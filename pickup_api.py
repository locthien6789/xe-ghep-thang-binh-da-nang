#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import hashlib
import json
import os
import random
import re
import threading
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DATA_DIR = os.environ.get("DATA_DIR", "/data")
ORDERS_FILE = os.path.join(DATA_DIR, "pickup_orders.json")
STATS_FILE = os.path.join(DATA_DIR, "page_stats.json")
CONFIG_FILE = os.path.join(DATA_DIR, "system_config.json")

LOCK = threading.Lock()
VN_TZ = timezone(timedelta(hours=7))

OWNER_PIN = "4268"    # Mã PIN Chủ Web (Kiểm soát toàn bộ & Ăn chia)
PARTNER_PIN = "1691"  # Mã PIN Nhà Xe (Nhận khách & Đối soát)

DEFAULT_CONFIG = {
    "seatFee": 10000,         # 10.000đ / ghế ghép (100K)
    "charterPercent": 10,     # 10% / chuyến bao xe, du lịch, cưới hỏi
    "dedupMinutes": 30,       # Gom trùng khách trong 30 phút
    "telegramBotToken": "8952626307:AAGJddneOL6I6jEF37Afu02MkhBN5voFmO8",
    "telegramChatId": "-1003984520283",
    "telegramEnabled": True,
}

PAGE_TITLES_MAP = {
    "/": "Trang Chủ Mega-Hub: Xe Ghép Thăng Bình & Các Xã ↔ Đà Nẵng",
    "/index.html": "Trang Chủ Mega-Hub: Xe Ghép Thăng Bình & Các Xã ↔ Đà Nẵng",
    "/xe-di-benh-vien-da-nang.html": "Chuyên Trang: Xe Đi Khám Bệnh Viện Đà Nẵng (04h45)",
    "/xe-dua-don-san-bay-da-nang.html": "Chuyên Trang: Xe Đưa Đón Sân Bay Đà Nẵng & Chu Lai",
    "/xe-di-sat-hach-lai-xe-quang-nam-da-nang.html": "Chuyên Trang: Xe Đi Sát Hạch Lái Xe Quảng Nam (Minh Sơn & QJC)",
    "/thue-xe-cuoi-hoi-thang-binh.html": "Chuyên Trang: Thuê Xe Hoa Cưới Hỏi & Đoàn Rước Dâu",
    "/thue-xe-cuoi-hoi-du-lich-thang-binh.html": "Chuyên Trang: Thuê Xe Du Lịch (VinWonders, Hội An, Bà Nà) & Đi Tỉnh",
    "/bang-gia-xe-ghep-thang-binh.html": "Chuyên Trang: Bảng Giá Cước Niêm Yết Toàn Huyện 2026",
}


def normalize_telegram_chat_id(raw_id):
    cid = str(raw_id or "").strip()
    if not cid:
        return ""
    # Auto-fix missing minus sign on Telegram Supergroup IDs (e.g. 1003984520283 -> -1003984520283)
    if cid.isdigit() and cid.startswith("100") and len(cid) >= 12:
        return "-" + cid
    return cid


def load_json(filepath, default_val):
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(filepath):
        return default_val
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception:
        return default_val


def save_json(filepath, data):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp_file = filepath + ".tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_file, filepath)


def load_config():
    cfg = load_json(CONFIG_FILE, {})
    merged = dict(DEFAULT_CONFIG)
    if isinstance(cfg, dict):
        merged.update(cfg)
    merged["telegramChatId"] = normalize_telegram_chat_id(merged.get("telegramChatId", ""))
    return merged


def calculate_commission(fare, seats, is_charter, service_code, cfg):
    seat_fee = int(cfg.get("seatFee", 10000) or 10000)
    charter_pct = int(cfg.get("charterPercent", 10) or 10)
    fare = int(fare or 100000)
    seats = int(seats or 1)

    if service_code == "gui-hang" or fare <= 60000:
        return max(5000, int(round(fare * charter_pct / 100.0)))
    if is_charter or seats == 0 or fare >= 350000 or "bao" in str(service_code).lower() or "thue" in str(service_code).lower():
        return int(round(fare * charter_pct / 100.0))
    return seats * seat_fee


def normalize_page_slug(raw_path):
    if not raw_path:
        return "/"
    p = str(raw_path).split("?")[0].split("#")[0].strip()
    if not p.startswith("/"):
        p = "/" + p
    if p == "/index.html" or p.startswith("/xe-ghep-"):
        return "/"
    return p


def detect_traffic_source(referrer, utm_source=""):
    ref = (str(referrer or "") + " " + str(utm_source or "")).lower()
    if not ref.strip():
        return "Trực tiếp / Lưu trang"
    if any(k in ref for k in ["chatgpt", "openai", "perplexity", "claude", "gemini", "copilot", "bing.com/chat"]):
        return "AI Search (ChatGPT / Gemini)"
    if "google." in ref or "google" in utm_source.lower():
        if "maps" in ref:
            return "Google Maps"
        return "Google Tìm Kiếm (SEO)"
    if "zalo" in ref:
        return "Zalo"
    if "facebook" in ref or "fb." in ref or "messenger" in ref:
        return "Facebook"
    if "bing." in ref or "coccoc" in ref or "yahoo" in ref:
        return "Bing / Cốc Cốc"
    if "xeghepthangbinhdanang.vn" in ref:
        return "Điều hướng nội bộ Web"
    return "Nguồn Web khác"


def send_telegram_sync(cfg, text_msg):
    token = str(cfg.get("telegramBotToken", "")).strip()
    chat_id = normalize_telegram_chat_id(cfg.get("telegramChatId", ""))
    if not token or not chat_id:
        return False, "Thiếu Bot Token hoặc Chat ID"

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    candidates = [chat_id]
    if not chat_id.startswith("-"):
        candidates.append("-" + chat_id)
        if not chat_id.startswith("100"):
            candidates.append("-100" + chat_id)

    last_err = ""
    for cid in candidates:
        try:
            payload = {
                "chat_id": cid,
                "text": text_msg,
                "parse_mode": "HTML",
                "disable_web_page_preview": True,
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data,
                headers={"Content-Type": "application/json; charset=utf-8"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                resp.read()
                return True, cid
        except urllib.error.HTTPError as e:
            try:
                err_body = e.read().decode("utf-8", errors="ignore")
                last_err = f"HTTP {e.code}: {err_body}"
            except Exception:
                last_err = f"HTTP {e.code}"
        except Exception as e:
            last_err = str(e)
    return False, last_err


def send_telegram_async(cfg, text_msg):
    if not cfg.get("telegramEnabled"):
        return
    token = str(cfg.get("telegramBotToken", "")).strip()
    chat_id = normalize_telegram_chat_id(cfg.get("telegramChatId", ""))
    if not token or not chat_id:
        return

    def _worker():
        send_telegram_sync(cfg, text_msg)

    t = threading.Thread(target=_worker, daemon=True)
    t.start()


def format_vnd(val):
    try:
        return f"{int(val):,}".replace(",", ".") + "đ"
    except Exception:
        return "0đ"


class ConversionAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Pin")
        self.end_headers()
        self.wfile.write(body)

    def _get_client_ip_hash(self):
        cf_ip = self.headers.get("CF-Connecting-IP", "").strip()
        real_ip = self.headers.get("X-Real-IP", "").strip()
        fwd = self.headers.get("X-Forwarded-For", "").strip()
        ip = cf_ip or real_ip or (fwd.split(",")[0].strip() if fwd else "") or (
            self.client_address[0] if self.client_address else "0.0.0.0"
        )
        ua = self.headers.get("User-Agent", "")[:120]
        raw = f"{ip}|{ua}"
        short_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:10]
        is_private = ip.startswith(("172.", "10.", "192.168.", "127.", "0."))
        masked_ip = "3G/4G/WiFi" if is_private else (".".join(ip.split(".")[:3]) + ".xxx" if "." in ip else ip[:10])
        return short_hash, masked_ip, is_private

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        if path == "/api/health":
            self._send_json(200, {"ok": True, "service": "xeghepthangbinh_conversion_api_v2.1"})
            return

        if path == "/api/pickup-requests" or path == "/api/dashboard-summary":
            pin = (qs.get("pin", [""])[0] or self.headers.get("X-Admin-Pin", "")).strip()
            role = "owner" if pin == OWNER_PIN else ("partner" if pin == PARTNER_PIN else "partner")

            with LOCK:
                orders = load_json(ORDERS_FILE, [])
                if not isinstance(orders, list):
                    orders = []
                stats = load_json(STATS_FILE, {"pages": {}, "daily": {}})
                cfg = load_config()

                # Normalize & roll up any legacy 9-commune page stats into Mega-Hub "/"
                raw_pages = stats.get("pages", {})
                merged_pages = {}
                for raw_slug, p_val in raw_pages.items():
                    norm_slug = normalize_page_slug(raw_slug)
                    target = merged_pages.setdefault(norm_slug, {
                        "title": PAGE_TITLES_MAP.get(norm_slug, norm_slug),
                        "views": 0,
                        "quotes": 0,
                        "rawClicks": 0,
                        "uniqueLeads": 0,
                        "callClicks": 0,
                        "zaloClicks": 0,
                        "gpsForms": 0,
                    })
                    for k in ("views", "quotes", "rawClicks", "uniqueLeads", "callClicks", "zaloClicks", "gpsForms"):
                        target[k] = target.get(k, 0) + int(p_val.get(k, 0))
                stats["pages"] = merged_pages

                # Recalculate fee if needed & normalize fields
                for o in orders:
                    o["fee"] = calculate_commission(
                        o.get("fare", 100000),
                        o.get("seats", 1),
                        o.get("isCharter", False),
                        o.get("serviceCode", "ghep-1"),
                        cfg,
                    )
                    if "convType" not in o:
                        o["convType"] = "form_gps" if o.get("phoneClean") else "call_0896"
                    o["pageSlug"] = normalize_page_slug(o.get("pageSlug", "/"))
                    o["pageTitle"] = PAGE_TITLES_MAP.get(o["pageSlug"], o.get("pageTitle", o["pageSlug"]))
                    if "clickCount" not in o:
                        o["clickCount"] = 1
                    if "source" not in o:
                        o["source"] = "Google Tìm Kiếm (SEO)"

            safe_cfg = {
                "seatFee": cfg.get("seatFee", 10000),
                "charterPercent": cfg.get("charterPercent", 10),
                "dedupMinutes": cfg.get("dedupMinutes", 30),
                "telegramEnabled": cfg.get("telegramEnabled", True),
                "telegramBotToken": cfg.get("telegramBotToken", "") if role == "owner" else "",
                "telegramChatId": cfg.get("telegramChatId", "") if role == "owner" else "",
            }

            self._send_json(200, {
                "ok": True,
                "role": role,
                "config": safe_cfg,
                "orders": orders,
                "stats": stats,
                "pageTitles": PAGE_TITLES_MAP,
            })
            return

        self._send_json(404, {"ok": False, "error": "Not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send_json(400, {"ok": False, "error": "Dữ liệu JSON không hợp lệ"})
            return

        now = datetime.now(VN_TZ)
        today_str = now.strftime("%Y-%m-%d")
        ip_hash, masked_ip, is_private = self._get_client_ip_hash()

        # 0. VERIFY PIN ENDPOINT
        if self.path.startswith("/api/verify-pin"):
            pin = str(payload.get("pin", "")).strip()
            if pin == OWNER_PIN:
                self._send_json(200, {"ok": True, "role": "owner", "label": "Chủ Web & Quản Trị Ăn Chia (Full Quyền)"})
            elif pin == PARTNER_PIN:
                self._send_json(200, {"ok": True, "role": "partner", "label": "Đối Tác Nhà Xe (Điều Phối & Đối Soát)"})
            else:
                self._send_json(401, {"ok": False, "error": "Mã PIN không chính xác! Vui lòng kiểm tra lại."})
            return

        # 1. TRACK PAGEVIEW ENDPOINT
        if self.path.startswith("/api/track-pageview"):
            page_slug = normalize_page_slug(payload.get("page", "/"))
            source = detect_traffic_source(payload.get("referrer", ""), payload.get("utmSource", ""))
            is_quote = bool(payload.get("isQuoteInteraction", False))

            with LOCK:
                stats = load_json(STATS_FILE, {"pages": {}, "daily": {}})
                pages = stats.setdefault("pages", {})
                p_entry = pages.setdefault(page_slug, {
                    "title": PAGE_TITLES_MAP.get(page_slug, page_slug),
                    "views": 0,
                    "quotes": 0,
                    "rawClicks": 0,
                    "uniqueLeads": 0,
                    "callClicks": 0,
                    "zaloClicks": 0,
                    "gpsForms": 0,
                })
                if is_quote:
                    p_entry["quotes"] = p_entry.get("quotes", 0) + 1
                else:
                    p_entry["views"] = p_entry.get("views", 0) + 1

                daily = stats.setdefault("daily", {})
                d_entry = daily.setdefault(today_str, {
                    "views": 0,
                    "quotes": 0,
                    "rawClicks": 0,
                    "uniqueLeads": 0,
                    "sources": {},
                })
                if is_quote:
                    d_entry["quotes"] = d_entry.get("quotes", 0) + 1
                else:
                    d_entry["views"] = d_entry.get("views", 0) + 1
                    srcs = d_entry.setdefault("sources", {})
                    srcs[source] = srcs.get(source, 0) + 1

                save_json(STATS_FILE, stats)

            self._send_json(200, {"ok": True})
            return

        # 2. TRACK CLICK-TO-CALL / CLICK-TO-ZALO / FORM GPS CONVERSION
        if self.path.startswith("/api/track-conversion") or self.path.startswith("/api/pickup-request"):
            is_pickup_form = self.path.startswith("/api/pickup-request")
            raw_phone = str(payload.get("phone", "")).strip()
            digits = re.sub(r"\D", "", raw_phone)

            if is_pickup_form and (len(digits) < 9 or len(digits) > 12):
                self._send_json(400, {"ok": False, "error": "Vui lòng nhập đúng Số điện thoại (9 - 11 số)"})
                return

            conv_type = str(payload.get("convType", "form_gps" if is_pickup_form else "call_0896")).strip()
            target_phone = str(payload.get("targetPhone", "0896211296")).strip()
            button_label = str(payload.get("buttonLabel", "Nút Đặt Xe")).strip()[:100]
            session_id = str(payload.get("sessionId", "")).strip()[:64] or ip_hash
            page_slug = normalize_page_slug(payload.get("page", "/"))
            page_title = PAGE_TITLES_MAP.get(page_slug, page_slug)
            source = detect_traffic_source(payload.get("referrer", ""), payload.get("utmSource", ""))

            service_code = str(payload.get("serviceCode", "ghep-1")).strip()
            service_text = str(payload.get("serviceText", "Đi ghép 1 người (100K)")).strip()[:120]
            pickup_text = str(payload.get("pickupText", "Thăng Bình")).strip()[:150]
            dropoff_text = str(payload.get("dropoffText", "Đà Nẵng")).strip()[:150]
            note = str(payload.get("note", "")).strip()[:200]
            device = str(payload.get("device", "Điện thoại")).strip()[:80]
            fare = int(payload.get("fare", 100000) or 100000)
            seats = int(payload.get("seats", 1) or 1)
            is_charter = bool(payload.get("isCharter", fare >= 350000))

            lat = payload.get("lat")
            lng = payload.get("lng")
            accuracy = payload.get("accuracy")
            maps_url = str(payload.get("mapsUrl", "")).strip()
            if not maps_url and lat and lng:
                maps_url = f"https://www.google.com/maps?q={lat},{lng}"

            with LOCK:
                cfg = load_config()
                orders = load_json(ORDERS_FILE, [])
                if not isinstance(orders, list):
                    orders = []
                stats = load_json(STATS_FILE, {"pages": {}, "daily": {}})

                fee = calculate_commission(fare, seats, is_charter, service_code, cfg)
                dedup_seconds = int(cfg.get("dedupMinutes", 30) or 30) * 60
                now_ts = int(now.timestamp())

                # Update raw clicks in stats
                pages = stats.setdefault("pages", {})
                p_entry = pages.setdefault(page_slug, {
                    "title": page_title,
                    "views": 1,
                    "quotes": 0,
                    "rawClicks": 0,
                    "uniqueLeads": 0,
                    "callClicks": 0,
                    "zaloClicks": 0,
                    "gpsForms": 0,
                })
                p_entry["rawClicks"] = p_entry.get("rawClicks", 0) + 1
                if "call" in conv_type:
                    p_entry["callClicks"] = p_entry.get("callClicks", 0) + 1
                elif "zalo" in conv_type:
                    p_entry["zaloClicks"] = p_entry.get("zaloClicks", 0) + 1
                else:
                    p_entry["gpsForms"] = p_entry.get("gpsForms", 0) + 1

                daily = stats.setdefault("daily", {})
                d_entry = daily.setdefault(today_str, {
                    "views": 1,
                    "quotes": 0,
                    "rawClicks": 0,
                    "uniqueLeads": 0,
                    "sources": {},
                })
                d_entry["rawClicks"] = d_entry.get("rawClicks", 0) + 1

                # SMART DEDUPLICATION: Check if same sessionId or phoneClean (or public ipHash) converted within last 30 mins
                existing_order = None
                for o in orders:
                    o_ts = int(o.get("timestamp", 0) or 0)
                    if now_ts - o_ts <= dedup_seconds:
                        same_session = (o.get("sessionId") and o.get("sessionId") == session_id)
                        same_phone = (digits and o.get("phoneClean") == digits)
                        same_public_ip = (not is_private and not payload.get("sessionId") and o.get("ipHash") == ip_hash)
                        if same_session or same_phone or same_public_ip:
                            existing_order = o
                            break

                action_label = (
                    f"📍 Gửi SĐT ({raw_phone})" if is_pickup_form else
                    (f"📞 Bấm gọi {target_phone}" if "call" in conv_type else "💬 Bấm nhắn Zalo")
                )

                if existing_order:
                    # Merge into existing Unique Lead without double-charging commission!
                    existing_order["clickCount"] = int(existing_order.get("clickCount", 1)) + 1
                    existing_order["lastActionTime"] = now.strftime("%H:%M:%S")
                    history = existing_order.setdefault("actionHistory", [])
                    history.append(f"{now.strftime('%H:%M:%S')}: {action_label} ({button_label})")

                    # Upgrade lead details if user just submitted actual phone/GPS or higher-value route
                    if digits and not existing_order.get("phoneClean"):
                        existing_order["phone"] = raw_phone
                        existing_order["phoneClean"] = digits
                        existing_order["convType"] = "form_gps"
                    if maps_url and not existing_order.get("mapsUrl"):
                        existing_order["mapsUrl"] = maps_url
                        existing_order["hasGps"] = True
                        existing_order["lat"] = lat
                        existing_order["lng"] = lng
                    if note and not existing_order.get("note"):
                        existing_order["note"] = note
                    if fare > int(existing_order.get("fare", 0)):
                        existing_order["fare"] = fare
                        existing_order["seats"] = seats
                        existing_order["isCharter"] = is_charter
                        existing_order["service"] = service_text
                        existing_order["serviceCode"] = service_code
                        existing_order["fee"] = fee

                    save_json(ORDERS_FILE, orders[:500])
                    save_json(STATS_FILE, stats)

                    # Send Telegram update if customer upgraded from anonymous call click to real phone number
                    if is_pickup_form:
                        tg_msg = (
                            f"🔥 <b>[CẬP NHẬT SĐT & GPS KHÁCH HÀNG] ({existing_order.get('code')})</b>\n"
                            f"📞 SĐT Khách: <b>{raw_phone}</b>\n"
                            f"🕒 Giờ gửi: {now.strftime('%H:%M:%S - %d/%m/%Y')}\n"
                            f"📍 Lộ trình: {pickup_text} ➔ {dropoff_text}\n"
                            f"🚘 Dịch vụ: {service_text}\n"
                            f"💵 Giá cước: <b>{format_vnd(existing_order['fare'])}</b>\n"
                            f"💰 Hoa hồng Web (10K/ghế • 10%): <b>{format_vnd(existing_order['fee'])}</b>\n"
                            f"📄 Trang đích: {page_title}\n"
                            f"{'🗺️ Bản đồ GPS: ' + maps_url if maps_url else ''}"
                        )
                        send_telegram_async(cfg, tg_msg)

                    self._send_json(200, {"ok": True, "order": existing_order, "deduplicated": True})
                    return

                # Create brand new Unique Lead
                p_entry["uniqueLeads"] = p_entry.get("uniqueLeads", 0) + 1
                d_entry["uniqueLeads"] = d_entry.get("uniqueLeads", 0) + 1

                prefix = "#GPS" if is_pickup_form else ("#GOI" if "call" in conv_type else "#ZALO")
                order_code = f"{prefix}-{random.randint(1000, 9999)}"
                short_sid = session_id[-4:].upper() if len(session_id) >= 4 else "WEB"
                default_anon_label = (
                    f"Khách bấm gọi {target_phone} (Phiên #{short_sid})"
                    if "call" in conv_type
                    else f"Khách nhắn Zalo {target_phone} (Phiên #{short_sid})"
                )
                display_phone = raw_phone if raw_phone else default_anon_label

                new_order = {
                    "id": f"{int(now.timestamp() * 1000)}-{random.randint(10, 99)}",
                    "timestamp": now_ts,
                    "date": today_str,
                    "code": order_code,
                    "time": now.strftime("%H:%M:%S"),
                    "createdAt": now.strftime("%H:%M:%S %d/%m/%Y"),
                    "convType": conv_type,
                    "targetPhone": target_phone,
                    "buttonLabel": button_label,
                    "phone": display_phone,
                    "phoneClean": digits,
                    "sessionId": session_id,
                    "ipHash": ip_hash,
                    "maskedIp": masked_ip,
                    "pageSlug": page_slug,
                    "pageTitle": page_title,
                    "source": source,
                    "serviceCode": service_code,
                    "service": service_text,
                    "seats": seats,
                    "isCharter": is_charter,
                    "pickup": pickup_text,
                    "dropoff": dropoff_text,
                    "route": f"{pickup_text} ➔ {dropoff_text}",
                    "note": note,
                    "lat": lat,
                    "lng": lng,
                    "accuracy": accuracy,
                    "mapsUrl": maps_url,
                    "hasGps": bool(maps_url),
                    "device": device,
                    "fare": fare,
                    "fee": fee,
                    "clickCount": 1,
                    "actionHistory": [f"{now.strftime('%H:%M:%S')}: {action_label} ({button_label})"],
                    "status": "new",
                    "cancelReason": "",
                    "driverId": "XE-01",
                    "driverName": "Chờ xác nhận",
                    "refunded": False,
                }

                orders.insert(0, new_order)
                save_json(ORDERS_FILE, orders[:500])
                save_json(STATS_FILE, stats)

                # Instant Telegram Alert
                type_badge = (
                    "📍 KHÁCH GỬI SĐT & ĐỊNH VỊ GPS" if is_pickup_form else
                    (f"📞 KHÁCH BẤM GỌI HOTLINE {target_phone}" if "call" in conv_type else "💬 KHÁCH BẤM ĐẶT QUA ZALO")
                )
                tg_msg = (
                    f"🚨 <b>[{type_badge}] ({order_code})</b>\n"
                    f"🕒 Giờ chính xác: <b>{now.strftime('%H:%M:%S - %d/%m/%Y')}</b>\n"
                    f"👤 Khách hàng: <b>{display_phone}</b>\n"
                    f"📍 Lộ trình chọn: <b>{pickup_text} ➔ {dropoff_text}</b>\n"
                    f"🚘 Dịch vụ: {service_text}\n"
                    f"💵 Doanh thu dự kiến: <b>{format_vnd(fare)}</b>\n"
                    f"💰 <b>Hoa hồng Web (10K/ghế • 10%): {format_vnd(fee)}</b>\n"
                    f"📄 Trang SEO: {page_title} ({page_slug})\n"
                    f"🔍 Nguồn: {source} • Thiết bị: {device}\n"
                    f"{'📝 Ghi chú: ' + note + chr(10) if note else ''}"
                    f"{'🗺️ Bản đồ GPS: ' + maps_url if maps_url else ''}"
                )
                send_telegram_async(cfg, tg_msg)

            self._send_json(200, {"ok": True, "order": new_order, "deduplicated": False})
            return

        # 3. UPDATE ORDER / CONVERSION STATUS (BOTH OWNER 4268 & PARTNER 1691)
        if self.path.startswith("/api/pickup-status") or self.path.startswith("/api/conversion-status"):
            pin = str(payload.get("pin", "") or self.headers.get("X-Admin-Pin", "")).strip()
            role = "owner" if pin == OWNER_PIN else ("partner" if pin == PARTNER_PIN else "partner")
            actor_label = "Chủ Web (4268)" if role == "owner" else "Nhà Xe (1691)"

            order_id = str(payload.get("id", "")).strip()
            action = str(payload.get("action", "update")).strip()
            new_status = str(payload.get("status", "confirmed")).strip()
            cancel_reason = str(payload.get("cancelReason", "")).strip()[:200]
            driver_id = str(payload.get("driverId", "")).strip()
            driver_name = str(payload.get("driverName", "")).strip()
            custom_fare = payload.get("fare")
            custom_seats = payload.get("seats")

            with LOCK:
                cfg = load_config()
                orders = load_json(ORDERS_FILE, [])
                updated = None

                if action == "delete" and role == "owner":
                    orders = [o for o in orders if o.get("id") != order_id and o.get("code") != order_id]
                    save_json(ORDERS_FILE, orders)
                    self._send_json(200, {"ok": True, "deleted": order_id})
                    return

                for o in orders:
                    if o.get("id") == order_id or o.get("code") == order_id:
                        o["status"] = new_status
                        o["updatedBy"] = actor_label
                        o["updatedAt"] = now.strftime("%H:%M:%S %d/%m")
                        if driver_id:
                            o["driverId"] = driver_id
                        if driver_name:
                            o["driverName"] = driver_name
                        if new_status in ("refunded", "cancelled"):
                            o["refunded"] = True
                            o["cancelReason"] = cancel_reason or "Khách báo hủy / Chưa đi"
                        else:
                            o["refunded"] = False
                            o["cancelReason"] = ""

                        if custom_fare is not None:
                            o["fare"] = int(custom_fare)
                        if custom_seats is not None:
                            s_val = int(custom_seats)
                            o["seats"] = s_val if s_val > 0 else 4
                            o["isCharter"] = (s_val == 0) or (int(o.get("fare", 0)) >= 350000)
                            if o["isCharter"]:
                                o["service"] = f"Bao nguyên xe riêng ({format_vnd(o['fare'])})"
                                o["serviceCode"] = "bao-xe-4-7"
                            else:
                                o["service"] = f"Đi ghép {s_val} ghế ({format_vnd(o['fare'])})"
                                o["serviceCode"] = f"ghep-{s_val}"

                        o["fee"] = calculate_commission(
                            o.get("fare", 100000),
                            o.get("seats", 1),
                            o.get("isCharter", False),
                            o.get("serviceCode", "ghep-1"),
                            cfg,
                        )
                        updated = o
                        break

                save_json(ORDERS_FILE, orders)

                if updated:
                    if new_status in ("refunded", "cancelled"):
                        tg_update = (
                            f"⚠️ <b>[BÁO HỦY ĐƠN CHUYỂN ĐỔI {updated.get('code')}]</b>\n"
                            f"👤 Khách: {updated.get('phone')}\n"
                            f"📝 Lý do hủy: <b>{updated.get('cancelReason')}</b>\n"
                            f"🛠️ Người thao tác: <b>{actor_label}</b> lúc {now.strftime('%H:%M:%S')}"
                        )
                        send_telegram_async(cfg, tg_update)
                    elif custom_fare is not None:
                        tg_update = (
                            f"✏️ <b>[CẬP NHẬT CƯỚC & HOA HỒNG ĐƠN {updated.get('code')}]</b>\n"
                            f"🚘 Dịch vụ thực tế: <b>{updated.get('service')}</b>\n"
                            f"💵 Doanh thu cuốc: <b>{format_vnd(updated.get('fare'))}</b>\n"
                            f"💰 Hoa hồng Web (10K/ghế • 10%): <b>{format_vnd(updated.get('fee'))}</b>\n"
                            f"🛠️ Người cập nhật: <b>{actor_label}</b> lúc {now.strftime('%H:%M:%S')}"
                        )
                        send_telegram_async(cfg, tg_update)

            self._send_json(200, {"ok": True, "order": updated})
            return

        # 4. RESET ALL DATA TO ZERO FOR NEW SETTLEMENT PERIOD (OWNER PIN 4268 ONLY)
        if self.path.startswith("/api/reset-data"):
            pin = str(payload.get("pin", "") or self.headers.get("X-Admin-Pin", "")).strip()
            if pin != OWNER_PIN:
                self._send_json(403, {"ok": False, "error": "Chỉ Mã PIN Chủ Web (4268) mới có quyền Reset dữ liệu đối soát!"})
                return

            with LOCK:
                save_json(ORDERS_FILE, [])
                save_json(STATS_FILE, {"pages": {}, "daily": {}})
                cfg = load_config()

            if payload.get("notifyTelegram", False):
                tg_reset = (
                    "🧹 <b>[ĐÃ RESET SỐ LIỆU ĐỐI SOÁT VỀ 0]</b>\n"
                    f"Chủ Web (PIN 4268) vừa đặt lại toàn bộ bộ đếm Chuyển đổi & Hoa hồng về <b>0</b> lúc <b>{now.strftime('%H:%M:%S - %d/%m/%Y')}</b> để bắt đầu kỳ đối soát chính thức!"
                )
                send_telegram_async(cfg, tg_reset)

            self._send_json(200, {"ok": True, "reset": True})
            return

        # 5. OWNER CONFIGURATION & TELEGRAM BOT SETUP (PIN 4268 ONLY)
        if self.path.startswith("/api/config"):
            pin = str(payload.get("pin", "") or self.headers.get("X-Admin-Pin", "")).strip()
            if pin != OWNER_PIN:
                self._send_json(403, {"ok": False, "error": "Chỉ Mã PIN Chủ Web (4268) mới có quyền thay đổi cấu hình hệ thống!"})
                return

            with LOCK:
                cfg = load_config()
                if "seatFee" in payload:
                    cfg["seatFee"] = int(payload["seatFee"])
                if "charterPercent" in payload:
                    cfg["charterPercent"] = int(payload["charterPercent"])
                if "dedupMinutes" in payload:
                    cfg["dedupMinutes"] = int(payload["dedupMinutes"])
                if "telegramBotToken" in payload:
                    cfg["telegramBotToken"] = str(payload["telegramBotToken"]).strip()
                if "telegramChatId" in payload:
                    cfg["telegramChatId"] = normalize_telegram_chat_id(payload["telegramChatId"])
                if "telegramEnabled" in payload:
                    cfg["telegramEnabled"] = bool(payload["telegramEnabled"])
                # If both token and chat_id are present and user clicked testTelegram, ensure enabled is True
                if payload.get("testTelegram") and cfg.get("telegramBotToken") and cfg.get("telegramChatId"):
                    cfg["telegramEnabled"] = True
                save_json(CONFIG_FILE, cfg)

            tg_sent = False
            tg_info = ""
            if payload.get("testTelegram"):
                test_msg = (
                    "✅ <b>[KẾT NỐI TELEGRAM THÀNH CÔNG]</b>\n"
                    "Hệ thống Theo Dõi Chuyển Đổi & Đối Soát Ăn Chia <b>xeghepthangbinhdanang.vn</b> đã hoạt động!\n"
                    f"• Công thức ăn chia: <b>Ghép {format_vnd(cfg['seatFee'])}/ghế • Bao xe {cfg['charterPercent']}%</b>\n"
                    f"• Chống trùng khách: <b>{cfg['dedupMinutes']} phút</b>\n"
                    f"• Thời gian kiểm tra: <b>{now.strftime('%H:%M:%S - %d/%m/%Y')}</b>"
                )
                tg_sent, tg_info = send_telegram_sync(cfg, test_msg)
                if tg_sent and tg_info != cfg.get("telegramChatId"):
                    with LOCK:
                        cfg["telegramChatId"] = tg_info
                        save_json(CONFIG_FILE, cfg)

            self._send_json(200, {
                "ok": True,
                "config": cfg,
                "telegramSent": tg_sent,
                "telegramInfo": tg_info,
            })
            return

        self._send_json(404, {"ok": False, "error": "Unknown endpoint"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), ConversionAPIHandler)
    print(f"Conversion & Revenue-Share API v2.1 listening on 0.0.0.0:{port}")
    server.serve_forever()
