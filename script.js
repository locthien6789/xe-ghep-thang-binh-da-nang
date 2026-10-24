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

  // 2. INTERACTIVE BOOKING & INSTANT PRICE CALCULATOR V2.0 (100K/NGUOI + BAO XE 350K-600K + FULL SERVICE)
  let currentDirection = 'Thăng Bình ➔ Đà Nẵng';
  const dirTabs = document.querySelectorAll('.dir-tab');
  const pickupSelect = document.getElementById('booking-pickup');
  const dropoffSelect = document.getElementById('booking-dropoff');
  const serviceSelect = document.getElementById('booking-service');
  const timeSelect = document.getElementById('booking-time');
  const quotePriceEl = document.getElementById('quote-price-display');
  const quoteNoteEl = document.getElementById('quote-note-display');

  const updateQuote = () => {
    if (!serviceSelect || !quotePriceEl || !quoteNoteEl) return;

    const serviceType = serviceSelect.value;

    let priceText = '100.000đ / 1 người';
    let noteText = '🔥 Giá cố định 100K/người (thêm 1 người +100K) • Đón tận nhà sau 15 phút';

    switch (serviceType) {
      case 'ghep-1':
        priceText = '100.000đ (1 người)';
        noteText = '✅ Giá vé cố định 100K/người • Đón tận nhà Thăng Bình ↔ Trả tận nơi Đà Nẵng';
        break;
      case 'ghep-2':
        priceText = '200.000đ (2 người • +100K/người)';
        noteText = '✅ Công thức cố định: 1 người 100K + thêm 1 người 100K = 200K trọn gói không phát sinh';
        break;
      case 'ghep-3':
        priceText = '300.000đ (3 người • +100K/người)';
        noteText = '💡 Mẹo tiết kiệm: Đi 3 người (300K) chỉ cần thêm từ 50K là BAO NGUYÊN XE RIÊNG (350K–600K) đi ngay!';
        break;
      case 'ghep-4':
        priceText = '400.000đ (4 người • +100K/người)';
        noteText = '🌟 Khuyên chọn: Đi 4 người (400K) anh/chị nên chọn BAO XE RIÊNG (chỉ từ 350K–600K) để đi riêng cả gia đình!';
        break;
      case 'bao-xe-4-7':
        priceText = 'Liên hệ từ 350.000đ – 600.000đ / chuyến';
        noteText = '🚘 Bao nguyên xe 4 chỗ – 7 chỗ riêng tư • Giờ giấc tự chọn, đón trả nhiều điểm theo yêu cầu';
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
  };

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

  // Build booking summary text & open Zalo
  const buildBookingMessage = () => {
    const pickupText = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Thăng Bình';
    const dropoffText = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Đà Nẵng';
    const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Đi ghép 1 người (100K)';
    const timeText = timeSelect?.options[timeSelect.selectedIndex]?.text || 'Đi ngay (Đón sau 15 phút)';
    const priceText = quotePriceEl?.textContent || '100.000đ';

    return `Xin chào Nhà Xe Nghĩa Hà Lam (xeghepthangbinhdanang.vn)!\nTôi muốn đặt dịch vụ:\n- Lộ trình: ${currentDirection}\n- Điểm đón/trả 1: ${pickupText}\n- Điểm trả/đến 2: ${dropoffText}\n- Dịch vụ chọn: ${serviceText}\n- Chi phí dự kiến: ${priceText}\n- Thời gian: ${timeText}\nVui lòng liên hệ xác nhận giúp tôi nhé!`;
  };

  const zaloBtn1 = document.getElementById('btn-book-zalo-1');
  const zaloBtn2 = document.getElementById('btn-book-zalo-2');

  const handleZaloBooking = (phone) => {
    const msg = buildBookingMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
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
