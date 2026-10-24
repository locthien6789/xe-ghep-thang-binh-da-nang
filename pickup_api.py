#!/usr/bin/env python3
import json
import os
import random
import re
import threading
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DATA_DIR = os.environ.get("DATA_DIR", "/data")
DATA_FILE = os.path.join(DATA_DIR, "pickup_orders.json")
LOCK = threading.Lock()
VN_TZ = timezone(timedelta(hours=7))


def load_orders():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []


def save_orders(orders):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp_file = DATA_FILE + ".tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(orders[:200], f, ensure_ascii=False, indent=2)
    os.replace(tmp_file, DATA_FILE)


class PickupAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_GET(self):
        if self.path.startswith("/api/pickup-requests"):
            with LOCK:
                orders = load_orders()
            self._send_json(200, {"ok": True, "orders": orders})
        elif self.path.startswith("/api/health"):
            self._send_json(200, {"ok": True, "service": "xeghepthangbinh_pickup_api"})
        else:
            self._send_json(404, {"ok": False, "error": "Not found"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send_json(400, {"ok": False, "error": "Dữ liệu không hợp lệ"})
            return

        if self.path.startswith("/api/pickup-request"):
            raw_phone = str(payload.get("phone", "")).strip()
            digits = re.sub(r"\D", "", raw_phone)
            if len(digits) < 9 or len(digits) > 12:
                self._send_json(400, {"ok": False, "error": "Vui lòng nhập đúng Số điện thoại (9 - 11 số)"})
                return

            now = datetime.now(VN_TZ)
            lat = payload.get("lat")
            lng = payload.get("lng")
            accuracy = payload.get("accuracy")
            maps_url = str(payload.get("mapsUrl", "")).strip()
            if not maps_url and lat and lng:
                maps_url = f"https://www.google.com/maps?q={lat},{lng}"

            service_text = str(payload.get("serviceText", "Đi ghép 1 người (100K)")).strip()[:120]
            pickup_text = str(payload.get("pickupText", "Thăng Bình / Đà Nẵng")).strip()[:150]
            dropoff_text = str(payload.get("dropoffText", "Đà Nẵng / Thăng Bình")).strip()[:150]
            note = str(payload.get("note", "")).strip()[:200]
            device = str(payload.get("device", "Mobile")).strip()[:80]
            fare = int(payload.get("fare", 100000) or 100000)

            order_code = f"#DON-{random.randint(100, 999)}"
            new_order = {
                "id": f"{int(now.timestamp() * 1000)}-{random.randint(10,99)}",
                "code": order_code,
                "time": now.strftime("%H:%M"),
                "createdAt": now.strftime("%H:%M:%S %d/%m/%Y"),
                "phone": raw_phone,
                "phoneClean": digits,
                "service": service_text,
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
                "fee": 45000 if fare >= 350000 else (fare // 100000) * 15000,
                "status": "new",
                "driverId": "XE-01",
                "driverName": "Chờ điều xe",
                "refunded": False,
            }

            with LOCK:
                orders = load_orders()
                orders.insert(0, new_order)
                save_orders(orders)

            self._send_json(200, {"ok": True, "order": new_order})
            return

        if self.path.startswith("/api/pickup-status"):
            order_id = str(payload.get("id", "")).strip()
            new_status = str(payload.get("status", "called")).strip()
            driver_id = str(payload.get("driverId", "")).strip()
            driver_name = str(payload.get("driverName", "")).strip()

            with LOCK:
                orders = load_orders()
                updated = None
                for o in orders:
                    if o.get("id") == order_id or o.get("code") == order_id:
                        o["status"] = new_status
                        if driver_id:
                            o["driverId"] = driver_id
                        if driver_name:
                            o["driverName"] = driver_name
                        if new_status == "refunded":
                            o["refunded"] = True
                        updated = o
                        break
                save_orders(orders)

            self._send_json(200, {"ok": True, "order": updated})
            return

        self._send_json(404, {"ok": False, "error": "Unknown endpoint"})

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), PickupAPIHandler)
    print(f"Pickup API listening on 0.0.0.0:{port}")
    server.serve_forever()
