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

  // 2. INTERACTIVE BOOKING & INSTANT PRICE CALCULATOR V3.0 (WITH SMART UPSELL + GPS ZALO)
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

  // Quick-select service from Ecosystem Cards (#dich-vu)
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

  // Build booking summary text
  const buildBookingMessage = (gpsUrl = '') => {
    const pickupText = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Thăng Bình';
    const dropoffText = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Đà Nẵng';
    const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Đi ghép 1 người (100K)';
    const timeText = timeSelect?.options[timeSelect.selectedIndex]?.text || 'Đi ngay (Đón sau 15 phút)';
    const priceText = quotePriceEl?.textContent || '100.000đ';

    let msg = `Xin chào Nhà Xe Nghĩa Hà Lam (xeghepthangbinhdanang.vn)!\nTôi muốn đặt dịch vụ:\n- Lộ trình: ${currentDirection}\n- Điểm đón/trả 1: ${pickupText}\n- Điểm trả/đến 2: ${dropoffText}\n- Dịch vụ chọn: ${serviceText}\n- Chi phí dự kiến: ${priceText}\n- Thời gian: ${timeText}`;
    if (gpsUrl) {
      msg += `\n- Vị trí GPS đón thực tế: ${gpsUrl}`;
    }
    msg += `\nVui lòng điều xe đón giúp tôi nhé!`;
    return msg;
  };

  const zaloBtn1 = document.getElementById('btn-book-zalo-1');
  const zaloBtn2 = document.getElementById('btn-book-zalo-2');

  const handleZaloBooking = (phone, gpsUrl = '') => {
    const msg = buildBookingMessage(gpsUrl);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    try {
      const pickupText = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Thăng Bình';
      const dropoffText = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Đà Nẵng';
      const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Đi ghép 1 người (100K)';
      const nowTime = new Date().toTimeString().slice(0, 5);
      const randId = Math.floor(300 + Math.random() * 699);
      const saved = JSON.parse(localStorage.getItem('nghia_halam_web_orders') || '[]');
      saved.unshift({
        code: `#WEB-${randId}`,
        time: nowTime,
        customerPhone: gpsUrl ? `Khách Zalo + GPS (${phone})` : `Khách đặt Web Zalo (${phone})`,
        route: `${pickupText} ➔ ${dropoffText}`,
        service: serviceText,
        fare: serviceText.includes('200') ? 200000 : serviceText.includes('300') ? 300000 : serviceText.includes('400') || serviceText.includes('Bao') ? 400000 : 100000,
        fee: 15000,
        driverId: 'XE-01',
        driverName: 'Anh Nghĩa (Xe Chủ Lực)',
        refunded: false
      });
      localStorage.setItem('nghia_halam_web_orders', JSON.stringify(saved.slice(0, 20)));
    } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: gpsUrl ? 'share_gps_zalo' : 'zalo_booking_submit',
        event_label: phone,
        value: 100000,
        currency: 'VND'
      });
    }
    alert(
      `Đã sao chép thông tin đặt xe của anh/chị:\n\n"${msg}"\n\nBấm OK để mở Zalo Nhà Xe Nghĩa Hà Lam (${phone}) và dán (Paste) tin nhắn nhé!`
    );
    window.open(`https://zalo.me/${phone}`, '_blank', 'noopener');
  };

  if (zaloBtn1) {
    zaloBtn1.addEventListener('click', () => handleZaloBooking('0896211296'));
  }
  if (zaloBtn2) {
    zaloBtn2.addEventListener('click', () => handleZaloBooking('0386400800'));
  }

  // 2B. 1-TAP GPS LOCATION SHARE VIA ZALO (FOR ELDERLY & ALLEY PICKUPS)
  const gpsButtons = document.querySelectorAll('.js-share-gps');
  gpsButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetPhone = btn.getAttribute('data-phone') || '0896211296';
      const originalText = btn.innerHTML;

      if (!navigator.geolocation) {
        handleZaloBooking(targetPhone, 'Khách sẽ gửi ghim vị trí trực tiếp trong Zalo');
        return;
      }

      btn.innerHTML = '⏳ Đang lấy tọa độ GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          btn.innerHTML = originalText;
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
          handleZaloBooking(targetPhone, mapsUrl);
        },
        () => {
          btn.innerHTML = originalText;
          handleZaloBooking(targetPhone, 'Nhờ tổng đài hướng dẫn bấm nút Gửi Vị Trí trong Zalo');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    });
  });

  // 3. FAQ ACCORDION
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

  // Initialize quote on load
  updateQuote();

  // 4. GA4 LEAD CONVERSION TRACKING (G-79KC9WN1F0)
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
