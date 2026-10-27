document.addEventListener('DOMContentLoaded', () => {
  // 1. HERO IMAGE GALLERY SWITCHER
  const mainImg = document.getElementById('hero-main-img');
  const mainCaption = document.getElementById('hero-main-caption');
  const thumbs = document.querySelectorAll('.hero-thumb');

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.getAttribute('data-src');
      const newCap = thumb.getAttribute('data-caption');
      if (mainImg && newSrc) {
        mainImg.src = newSrc;
      }
      if (mainCaption && newCap) {
        mainCaption.textContent = newCap;
      }
    });
  });

  // 2. INTERACTIVE BOOKING & INSTANT PRICE CALCULATOR V4.0
  let currentDirection = 'Thăng Bình ➔ Đà Nẵng';
  const dirTabs = document.querySelectorAll('.dir-tab');
  const pickupSelect = document.getElementById('booking-pickup');
  const dropoffSelect = document.getElementById('booking-dropoff');
  const serviceSelect = document.getElementById('booking-service');
  const timeSelect = document.getElementById('booking-time');
  const quotePriceEl = document.getElementById('quote-price-display');
  const quoteNoteEl = document.getElementById('quote-note-display');
  const upsellBannerEl = document.getElementById('upsell-banner');
  const upsellTextEl = document.getElementById('upsell-text');
  const upsellSwitchBtn = document.getElementById('btn-upsell-switch');

  const updateQuote = () => {
    if (!serviceSelect || !quotePriceEl || !quoteNoteEl) return;

    const serviceType = serviceSelect.value;
    const dropoffVal = dropoffSelect ? dropoffSelect.value : '';

    let priceText = '100.000đ / 1 người';
    let noteText = '🔥 Giá cố định 100K/người (thêm 1 người +100K) • Đón tận nhà sau 15 phút';
    let showUpsell = false;
    let upsellMessage = '';

    switch (serviceType) {
      case 'ghep-1':
        priceText = '100.000đ (1 người)';
        noteText = '✅ Giá vé cố định 100K/người • Đón tận nhà Thăng Bình ↔ Trả tận nơi Đà Nẵng';
        if (dropoffVal === 'san-bay-da-nang' || dropoffVal === 'tam-ky-chu-lai') {
          showUpsell = true;
          upsellMessage =
            '✈️ <strong>Đi Sân bay cần đúng giờ tuyệt đối?</strong> Anh/chị có thể chọn <strong>Bao nguyên xe riêng 4–7 chỗ (chỉ từ 350K–600K)</strong> để đi thẳng tận sảnh sân bay không chờ ghép khách!';
        }
        break;
      case 'ghep-2':
        priceText = '200.000đ (2 người • +100K/người)';
        noteText = '✅ Công thức cố định: 1 người 100K + thêm 1 người 100K = 200K trọn gói không phát sinh';
        if (dropoffVal === 'san-bay-da-nang' || dropoffVal === 'tam-ky-chu-lai') {
          showUpsell = true;
          upsellMessage =
            '✈️ <strong>Đi Sân bay 2 người + hành lý (200K):</strong> Chỉ cần bù thêm từ 150K là <strong>Bao nguyên xe riêng (350K–600K)</strong> rộng rãi cốp để valy, đi thẳng không chờ đợi!';
        }
        break;
      case 'ghep-3':
        priceText = '300.000đ (3 người • +100K/người)';
        noteText = '💡 Mẹo tiết kiệm: Đi 3 người (300K) chỉ cần thêm từ 50K là BAO NGUYÊN XE RIÊNG (350K–600K) đi ngay!';
        showUpsell = true;
        upsellMessage =
          '💡 <strong>Mẹo đặt xe thông minh:</strong> Đi ghép 3 người đã là <strong>300.000đ</strong>. Anh/chị chỉ cần bù thêm từ <strong>50.000đ</strong> là <strong>BAO NGUYÊN XE RIÊNG 4–7 CHỖ (350K–600K)</strong> đi thẳng không ghép khách!';
        break;
      case 'ghep-4':
        priceText = '400.000đ (4 người • +100K/người)';
        noteText = '🌟 Khuyên chọn: Đi 4 người (400K) anh/chị nên chọn BAO XE RIÊNG (chỉ từ 350K–600K) để đi riêng cả gia đình!';
        showUpsell = true;
        upsellMessage =
          '🌟 <strong>Đặc quyền Gia đình / Nhóm 4 người:</strong> Đi ghép 4 ghế đã là <strong>400.000đ</strong> — Bằng giá <strong>BAO NGUYÊN XE RIÊNG 4–7 CHỖ (350K–600K)</strong>! Bấm nút bên cạnh để lấy nguyên xe riêng miễn phí chờ đợi.';
        break;
      case 'bao-xe-4-7':
        priceText = 'Liên hệ từ 350.000đ – 600.000đ / chuyến';
        noteText = '🚘 Bao nguyên xe 4 chỗ – 7 chỗ riêng tư • Giờ giấc tự chọn, đi thẳng không ghép khách, đón trả tận sảnh';
        break;
      case 'bao-xe-khu-hoi':
        priceText = 'Báo giá khứ hồi ưu đãi (Có chờ đón về)';
        noteText = '🔄 Bao nguyên xe 4–7 chỗ đi và chờ đón chiều về trong ngày • Tiết kiệm hơn đặt lẻ 2 chiều';
        break;
      case 'nhom-sat-hach':
        priceText = 'Bao xe 4–7 chỗ chia đầu người (~80K–100K/HV)';
        noteText = '🎓 Đưa nhóm học viên tới tận cổng Trung tâm Sát hạch Minh Sơn / QJC trước 06h30 sáng • Nhận chờ thi xong đón về';
        break;
      case 'thue-xe-du-lich':
        priceText = 'Liên hệ từ 350.000đ (Báo giá trọn gói)';
        noteText = '🏖️ Phục vụ đi VinWonders Nam Hội An, Phố cổ Hội An, Bà Nà Hills, Núi Thần Tài, Chùa Linh Ứng, Mỹ Sơn...';
        break;
      case 'thue-xe-cuoi-hoi':
        priceText = 'Liên hệ báo giá ưu đãi trọn gói';
        noteText = '💒 Đội xe điện VinFast Limo Green trắng ngọc trai sang trọng & xe 4–7 chỗ phục vụ Xe hoa, Rước dâu, Đưa đón hai họ';
        break;
      case 'thue-xe-di-tinh':
        priceText = 'Báo giá hợp đồng siêu tiết kiệm';
        noteText = '🛣️ Nhận đi Tam Kỳ, Sân bay Chu Lai, Tiên Phước, Quế Sơn, Quảng Ngãi, Huế, Măng Đen (1 chiều & 2 chiều)';
        break;
      case 'gui-hang':
        priceText = 'Chỉ từ 50.000đ / kiện';
        noteText = '📦 Nhận vận chuyển hàng hóa, bưu kiện nhỏ, hồ sơ, quà quê Thăng Bình ↔ Đà Nẵng nhận sau 1h30p';
        break;
      default:
        break;
    }

    quotePriceEl.textContent = priceText;
    quoteNoteEl.textContent = noteText;

    if (upsellBannerEl && upsellTextEl) {
      if (showUpsell) {
        upsellTextEl.innerHTML = upsellMessage;
        upsellBannerEl.classList.add('active');
      } else {
        upsellBannerEl.classList.remove('active');
      }
    }
  };

  if (upsellSwitchBtn && serviceSelect) {
    upsellSwitchBtn.addEventListener('click', () => {
      serviceSelect.value = 'bao-xe-4-7';
      updateQuote();
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'upsell_bao_xe_click',
          event_label: 'switch_to_bao_xe_350k_600k',
          value: 400000,
          currency: 'VND'
        });
      }
    });
  }

  dirTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      dirTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentDirection = tab.getAttribute('data-dir') || 'Thăng Bình ➔ Đà Nẵng';
      updateQuote();
    });
  });

  [pickupSelect, dropoffSelect, serviceSelect, timeSelect].forEach((el) => {
    if (el) el.addEventListener('change', updateQuote);
  });

  const quickServiceBtns = document.querySelectorAll('.js-select-service');
  quickServiceBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetVal = btn.getAttribute('data-service');
      if (serviceSelect && targetVal) {
        serviceSelect.value = targetVal;
        updateQuote();
      }
      const bookingSection = document.getElementById('dat-xe');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  const buildBookingMessage = (gpsUrl = '', customerPhone = '') => {
    const pickupText = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Thăng Bình';
    const dropoffText = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Đà Nẵng';
    const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Đi ghép 1 người (100K)';
    const timeText = timeSelect?.options[timeSelect.selectedIndex]?.text || 'Đi ngay (Đón sau 15 phút)';
    const priceText = quotePriceEl?.textContent || '100.000đ';

    let msg = `📍 HÃY ĐÓN TÔI - Nhà Xe Nghĩa Hà Lam!\n`;
    if (customerPhone) {
      msg += `- SĐT liên hệ đón: ${customerPhone}\n`;
    }
    msg += `- Lộ trình: ${currentDirection}\n- Điểm đón: ${pickupText}\n- Điểm đến: ${dropoffText}\n- Dịch vụ: ${serviceText} (${priceText})\n- Thời gian: ${timeText}`;
    if (gpsUrl) {
      msg += `\n- Bản đồ GPS chỗ tôi đứng: ${gpsUrl}`;
    }
    return msg;
  };

  const zaloBtn1 = document.getElementById('btn-book-zalo-1');
  const zaloBtn2 = document.getElementById('btn-book-zalo-2');

  const handleDirectZalo = (phone) => {
    const msg = buildBookingMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'zalo_booking_submit',
        event_label: phone,
        value: 100000,
        currency: 'VND'
      });
    }
    window.open(`https://zalo.me/${phone}`, '_blank', 'noopener');
  };

  if (zaloBtn1) zaloBtn1.addEventListener('click', () => handleDirectZalo('0896211296'));
  if (zaloBtn2) zaloBtn2.addEventListener('click', () => handleDirectZalo('0386400800'));

  // =========================================================================
  // 3. ELDERLY-FRIENDLY "📍 HÃY ĐÓN TÔI (GỬI SĐT + VỊ TRÍ)" ENGINE
  //    100% COMPATIBLE WITH ANDROID & iOS (iPHONE SAFARI / ZALO WEBVIEW)
  // =========================================================================
  let capturedGps = {
    lat: null,
    lng: null,
    accuracy: null,
    mapsUrl: '',
    status: 'idle' // idle | loading | success | fallback
  };

  const detectDeviceName = () => {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iPhone / iOS';
    if (/Android/i.test(ua)) return 'Điện thoại Android';
    return 'Điện thoại / Máy tính';
  };

  const buildSmsHref = (targetPhone, bodyText) => {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const sep = isIOS ? '&' : '?';
    return `sms:${targetPhone}${sep}body=${encodeURIComponent(bodyText)}`;
  };

  // Inject Modal HTML into body so all 6 pages share the exact same experience
  const injectPickupMeModal = () => {
    if (document.getElementById('pickup-me-modal')) return;

    const modalHtml = `
      <div id="pickup-me-modal" class="pickup-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pickup-modal-title">
        <div class="pickup-modal-card">
          <div class="pickup-modal-header">
            <div>
              <h3 id="pickup-modal-title">📍 HÃY ĐÓN TÔI TẠI ĐÂY</h3>
              <p>Chỉ cần nhập Số Điện Thoại – Tài xế gọi lại đón ngay sau 1 phút!</p>
            </div>
            <button type="button" id="btn-close-pickup-modal" class="btn-close-pickup" aria-label="Đóng">✕</button>
          </div>

          <div class="pickup-modal-body">
            <!-- FORM STEP -->
            <div id="pickup-form-step">
              <div id="gps-status-banner" class="gps-live-banner loading">
                <span>📡</span>
                <div id="gps-status-text">
                  Đang lấy vị trí của cô/chú trên bản đồ...<br />
                  <small>(Vui lòng bấm <strong>"Cho phép / Allow"</strong> nếu điện thoại hỏi)</small>
                </div>
              </div>

              <div class="elderly-field-group">
                <label for="elderly-phone-input">📞 1. Nhập Số Điện Thoại của Cô/Chú (Bắt buộc):</label>
                <input
                  type="tel"
                  id="elderly-phone-input"
                  class="elderly-phone-input"
                  inputmode="numeric"
                  autocomplete="tel"
                  placeholder="Ví dụ: 0905 123 456"
                  maxlength="15"
                />
              </div>

              <div class="elderly-field-group">
                <label>🚘 2. Chọn Số Người Đi (1 người = 100K):</label>
                <div class="seat-quick-pills" id="modal-seat-pills">
                  <button type="button" class="seat-pill-btn active" data-service="Đi ghép 1 người (100K)" data-fare="100000">
                    <strong>1 Người</strong>
                    <span>100.000đ</span>
                  </button>
                  <button type="button" class="seat-pill-btn" data-service="Đi ghép 2 người (200K)" data-fare="200000">
                    <strong>2 Người</strong>
                    <span>200.000đ</span>
                  </button>
                  <button type="button" class="seat-pill-btn" data-service="Bao nguyên xe riêng (350K–600K)" data-fare="400000">
                    <strong>Bao Xe Riêng</strong>
                    <span>350K–600K</span>
                  </button>
                </div>
              </div>

              <div class="elderly-field-group">
                <label for="elderly-note-input">🏠 3. Ghi chú điểm đón (Không bắt buộc):</label>
                <input
                  type="text"
                  id="elderly-note-input"
                  class="elderly-note-input"
                  placeholder="VD: Cổng BV Đa Khoa, Ngã 3 Bình Quý, Chợ Hà Lam..."
                />
              </div>

              <button type="button" id="btn-submit-pickup-me" class="btn-pickup-submit">
                <span>🚕 BẤM GỬI: HÃY ĐÓN TÔI NGAY!</span>
                <small>Gửi SĐT + Vị trí bản đồ về thẳng Tổng đài 0896.211.296</small>
              </button>
            </div>

            <!-- SUCCESS STEP (SYNCHRONOUS 1-TAP BACKUPS FOR iOS & ANDROID) -->
            <div id="pickup-success-step" class="pickup-success-box">
              <div class="pickup-success-icon">✅</div>
              <h4>ĐÃ GỬI YÊU CẦU ĐÓN THÀNH CÔNG!</h4>
              <p id="pickup-success-summary">
                Nhà Xe Nghĩa Hà Lam đã nhận được Số điện thoại và vị trí của cô/chú. Tài xế gần nhất sẽ gọi lại ngay trong <strong>1 – 2 phút</strong>!
              </p>

              <div class="pickup-backup-actions">
                <a href="tel:0896211296" class="btn btn-call-primary btn-xl" style="width:100%;justify-content:center;">
                  📞 Gọi Luôn Tổng Đài: 0896.211.296
                </a>
                <a id="btn-backup-sms" href="sms:0896211296" class="btn btn-call-secondary" style="width:100%;justify-content:center;padding:13px;">
                  ✉️ Gửi Thêm Tin Nhắn SMS Tọa Độ (1-Chạm)
                </a>
                <button type="button" id="btn-backup-zalo" class="btn btn-zalo" style="width:100%;justify-content:center;padding:13px;">
                  💬 Mở Zalo Nhà Xe (Đã Copy Sẵn Vị Trí)
                </button>
                <button type="button" id="btn-reset-pickup-modal" class="btn" style="background:#f1f5f9;color:#334155;width:100%;">
                  ← Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  injectPickupMeModal();

  // Upgrade all existing GPS buttons to say "📍 HÃY ĐÓN TÔI (Gửi SĐT & Vị Trí)"
  document.querySelectorAll('.js-share-gps').forEach((btn) => {
    if (!btn.classList.contains('btn-xl')) {
      btn.innerHTML = '📍 HÃY ĐÓN TÔI (Gửi SĐT & Vị Trí)';
    }
  });

  // Also upgrade the middle button of the Mobile Sticky Bottom Bar so elderly users can tap "📍 HÃY ĐÓN TÔI" from anywhere!
  const floatingBarInner = document.querySelector('.floating-bar-inner');
  if (floatingBarInner) {
    const secondFloatBtn = floatingBarInner.querySelector('.float-call-2');
    if (secondFloatBtn) {
      secondFloatBtn.outerHTML = `
        <button type="button" class="float-btn float-pickup-me js-share-gps" data-phone="0896211296" style="border:1.5px solid #fde047;cursor:pointer;font-family:inherit;">
          <span>📍 HÃY ĐÓN TÔI</span>
          <small>Gửi SĐT + Vị Trí</small>
        </button>
      `;
    }
  }

  const modalEl = document.getElementById('pickup-me-modal');
  const closeBtn = document.getElementById('btn-close-pickup-modal');
  const resetBtn = document.getElementById('btn-reset-pickup-modal');
  const gpsBanner = document.getElementById('gps-status-banner');
  const gpsText = document.getElementById('gps-status-text');
  const phoneInput = document.getElementById('elderly-phone-input');
  const noteInput = document.getElementById('elderly-note-input');
  const seatPills = document.querySelectorAll('#modal-seat-pills .seat-pill-btn');
  const submitPickupBtn = document.getElementById('btn-submit-pickup-me');
  const formStep = document.getElementById('pickup-form-step');
  const successStep = document.getElementById('pickup-success-step');
  const successSummary = document.getElementById('pickup-success-summary');
  const backupSmsBtn = document.getElementById('btn-backup-sms');
  const backupZaloBtn = document.getElementById('btn-backup-zalo');

  let selectedModalService = 'Đi ghép 1 người (100K)';
  let selectedModalFare = 100000;
  let lastSubmittedMsg = '';

  // Pre-fill saved phone number for returning customers
  try {
    const savedPhone = localStorage.getItem('nghia_halam_customer_phone');
    if (savedPhone && phoneInput) {
      phoneInput.value = savedPhone;
    }
  } catch (e) {}

  seatPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      seatPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedModalService = pill.getAttribute('data-service') || 'Đi ghép 1 người (100K)';
      selectedModalFare = parseInt(pill.getAttribute('data-fare') || '100000', 10);
    });
  });

  const requestGpsSynchronously = () => {
    if (!navigator.geolocation) {
      capturedGps.status = 'fallback';
      if (gpsBanner && gpsText) {
        gpsBanner.className = 'gps-live-banner fallback';
        gpsText.innerHTML =
          '🟡 <strong>Điện thoại chưa bật định vị GPS:</strong> Không sao cả! Cô/chú chỉ cần nhập <strong>Số Điện Thoại</strong> bên dưới, tài xế sẽ gọi lại hỏi điểm đón ngay!';
      }
      return;
    }

    capturedGps.status = 'loading';
    if (gpsBanner && gpsText) {
      gpsBanner.className = 'gps-live-banner loading';
      gpsText.innerHTML =
        '📡 Đang xác định vị trí của cô/chú trên bản đồ...<br/><small>(Hãy bấm <strong>"Cho phép / Allow"</strong> nếu điện thoại hỏi)</small>';
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const acc = Math.round(pos.coords.accuracy || 15);
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        capturedGps = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          accuracy: acc,
          mapsUrl: url,
          status: 'success'
        };
        if (gpsBanner && gpsText) {
          gpsBanner.className = 'gps-live-banner success';
          gpsText.innerHTML = `🟢 <strong>Đã ghim đúng vị trí của cô/chú!</strong> (Sai số ~${acc}m) • <a href="${url}" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:900;">Xem bản đồ ↗</a>`;
        }
      },
      () => {
        capturedGps.status = 'fallback';
        if (gpsBanner && gpsText) {
          gpsBanner.className = 'gps-live-banner fallback';
          gpsText.innerHTML =
            '🟡 <strong>Chưa bật vị trí GPS:</strong> Không sao cả! Cô/chú chỉ cần nhập <strong>Số Điện Thoại</strong> bên dưới, nhà xe sẽ gọi lại đón ngay!';
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const openPickupMeModal = () => {
    if (!modalEl) return;
    if (formStep) formStep.style.display = 'block';
    if (successStep) successStep.classList.remove('active');
    modalEl.classList.add('open');

    // Trigger GPS immediately inside the synchronous user click gesture (works on iOS Safari & Android!)
    requestGpsSynchronously();

    setTimeout(() => {
      if (phoneInput && !phoneInput.value) {
        phoneInput.focus();
      }
    }, 150);
  };

  const closePickupMeModal = () => {
    if (modalEl) modalEl.classList.remove('open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closePickupMeModal);
  if (resetBtn) resetBtn.addEventListener('click', closePickupMeModal);
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closePickupMeModal();
    });
  }

  // Bind all ".js-share-gps" buttons (including the newly injected sticky bar button)
  document.querySelectorAll('.js-share-gps').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPickupMeModal();
    });
  });

  // Handle Form Submission inside "📍 HÃY ĐÓN TÔI" Modal
  if (submitPickupBtn) {
    submitPickupBtn.addEventListener('click', async () => {
      const rawPhone = (phoneInput?.value || '').trim();
      const cleanDigits = rawPhone.replace(/\D/g, '');

      if (cleanDigits.length < 9 || cleanDigits.length > 12) {
        alert('Cô/chú vui lòng nhập đúng Số Điện Thoại (10 số) để tài xế gọi lại đón nhé!');
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Save customer phone for future 1-tap use
      try {
        localStorage.setItem('nghia_halam_customer_phone', rawPhone);
      } catch (e) {}

      const pickupVal = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Thăng Bình';
      const dropoffVal = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Đà Nẵng';
      const noteVal = (noteInput?.value || '').trim();
      const pickupCombined = noteVal ? `${noteVal} (${pickupVal})` : pickupVal;

      const payload = {
        phone: rawPhone,
        serviceText: selectedModalService,
        pickupText: capturedGps.mapsUrl ? `📍 Vị trí GPS khách đứng (${pickupCombined})` : pickupCombined,
        dropoffText: dropoffVal,
        note: noteVal,
        lat: capturedGps.lat,
        lng: capturedGps.lng,
        accuracy: capturedGps.accuracy,
        mapsUrl: capturedGps.mapsUrl,
        device: detectDeviceName(),
        fare: selectedModalFare
      };

      submitPickupBtn.disabled = true;
      const origHtml = submitPickupBtn.innerHTML;
      submitPickupBtn.innerHTML = '<span>⏳ ĐANG GỬI VỀ TỔNG ĐÀI...</span>';

      let serverOrderCode = `#DON-${Math.floor(100 + Math.random() * 899)}`;

      try {
        const resp = await fetch('/api/pickup-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.order && data.order.code) {
            serverOrderCode = data.order.code;
          }
        }
      } catch (err) {
        // Fallback if offline
      }

      // Also save to localStorage for local browser sync
      try {
        const nowTime = new Date().toTimeString().slice(0, 5);
        const saved = JSON.parse(localStorage.getItem('nghia_halam_web_orders') || '[]');
        saved.unshift({
          code: serverOrderCode,
          time: nowTime,
          customerPhone: rawPhone,
          route: `${payload.pickupText} ➔ ${payload.dropoffText}`,
          service: selectedModalService,
          mapsUrl: capturedGps.mapsUrl,
          fare: selectedModalFare,
          fee: selectedModalFare >= 350000 ? 45000 : 15000,
          driverId: 'XE-01',
          driverName: 'Anh Nghĩa (Xe Chủ Lực)',
          refunded: false
        });
        localStorage.setItem('nghia_halam_web_orders', JSON.stringify(saved.slice(0, 30)));
      } catch (e) {}

      // Fire GA4 conversion event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'pickup_me_submit',
          event_label: rawPhone,
          value: selectedModalFare,
          currency: 'VND'
        });
      }

      // Build SMS & Zalo backup text
      lastSubmittedMsg =
        `📍 HÃY ĐÓN TÔI (${serverOrderCode})\n` +
        `- SĐT khách: ${rawPhone}\n` +
        `- Dịch vụ: ${selectedModalService}\n` +
        `- Đón tại: ${payload.pickupText}\n` +
        (capturedGps.mapsUrl ? `- Bản đồ GPS: ${capturedGps.mapsUrl}\n` : '') +
        `Nhờ nhà xe Nghĩa Hà Lam gọi lại đón giúp tôi!`;

      if (backupSmsBtn) {
        backupSmsBtn.setAttribute('href', buildSmsHref('0896211296', lastSubmittedMsg));
      }

      if (successSummary) {
        successSummary.innerHTML =
          `Mã yêu cầu: <strong style="color:#dc2626">${serverOrderCode}</strong> • SĐT: <strong>${rawPhone}</strong><br/>` +
          (capturedGps.mapsUrl
            ? `🟢 <strong>Đã đính kèm tọa độ Google Maps chính xác chỗ cô/chú đang đứng!</strong><br/>`
            : '') +
          `Tổng đài Nhà Xe Nghĩa Hà Lam đã nhận thông tin và sẽ <strong>gọi điện lại cho cô/chú trong 1 – 2 phút</strong> nữa!`;
      }

      submitPickupBtn.disabled = false;
      submitPickupBtn.innerHTML = origHtml;

      if (formStep) formStep.style.display = 'none';
      if (successStep) successStep.classList.add('active');
    });
  }

  // Synchronous Zalo backup button on confirmation screen (100% iOS Safari compliant!)
  if (backupZaloBtn) {
    backupZaloBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText && lastSubmittedMsg) {
        navigator.clipboard.writeText(lastSubmittedMsg).catch(() => {});
      }
      window.open('https://zalo.me/0896211296', '_blank', 'noopener');
    });
  }

  // 4. QUICK LANDMARK CHIPS (1-TAP PICKUP POINT SELECTION FOR LOCAL & ELDERLY USERS)
  const landmarkChips = document.querySelectorAll('.js-landmark-chip');
  landmarkChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      landmarkChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const landmarkName = chip.getAttribute('data-landmark') || chip.textContent.trim();
      const selectVal = chip.getAttribute('data-pickup-val');
      if (pickupSelect && selectVal) {
        const opt = Array.from(pickupSelect.options).find((o) => o.value === selectVal);
        if (opt) pickupSelect.value = selectVal;
      }
      if (noteInput && landmarkName) {
        noteInput.value = landmarkName;
      }
      if (quoteNoteEl && landmarkName) {
        quoteNoteEl.innerHTML = `📍 Đã chọn điểm đón/trả: <strong>${landmarkName}</strong> • Bấm Gọi Ngay hoặc HÃY ĐÓN TÔI để xe vào đón!`;
      }
    });
  });

  // 5. FAQ ACCORDION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach((i) => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  updateQuote();

  // 5. GA4 LEAD CONVERSION TRACKING (G-79KC9WN1F0)
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        const phone = link.getAttribute('href').replace('tel:', '');
        window.gtag('event', 'generate_lead', {
          event_category: 'call_hotline',
          event_label: phone,
          value: 100000,
          currency: 'VND'
        });
      }
    });
  });

  document.querySelectorAll('a[href*="zalo.me"]').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'chat_zalo',
          event_label: link.getAttribute('href'),
          value: 100000,
          currency: 'VND'
        });
      }
    });
  });
});
