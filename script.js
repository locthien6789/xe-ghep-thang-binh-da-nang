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

  // 2. INTERACTIVE BOOKING & INSTANT PRICE CALCULATOR
  let currentDirection = 'Thăng Bình ➔ Đà Nẵng';
  const dirTabs = document.querySelectorAll('.dir-tab');
  const pickupSelect = document.getElementById('booking-pickup');
  const dropoffSelect = document.getElementById('booking-dropoff');
  const serviceSelect = document.getElementById('booking-service');
  const timeSelect = document.getElementById('booking-time');
  const quotePriceEl = document.getElementById('quote-price-display');
  const quoteNoteEl = document.getElementById('quote-note-display');

  const updateQuote = () => {
    if (!pickupSelect || !serviceSelect || !quotePriceEl || !quoteNoteEl) return;

    const pickupZone = pickupSelect.options[pickupSelect.selectedIndex]?.getAttribute('data-zone') || '100k';
    const serviceType = serviceSelect.value;

    let priceText = '100.000đ / ghế';
    let noteText = '✅ Tuyến ưu đãi cố định • Xe điện VinFast Limo Green đón tận nơi sau 15 phút';

    if (serviceType === 'ghep-1-ghe') {
      if (pickupZone === '100k') {
        priceText = '100.000đ / vé';
        noteText = '🔥 Giá vé 100K áp dụng tuyến Hà Châu - Ngã 3 Bình Quý - Cầu Ông Triệu - Quý Mỹ - Hà Lam ↔ Đà Nẵng';
      } else {
        priceText = '120.000đ – 150.000đ / vé';
        noteText = '🚗 Đón tận ngõ tại các xã Bình Phú, Bình Chánh, Bình Định, Bình Phục, Bình Nguyên (tùy vị trí)';
      }
    } else if (serviceType === 'ghep-2-ghe') {
      if (pickupZone === '100k') {
        priceText = '200.000đ / 2 vé';
        noteText = '🔥 Đi 2 người tuyến cố định chỉ 200K • Đón trả tận nơi không phát sinh';
      } else {
        priceText = '240.000đ – 280.000đ / 2 vé';
        noteText = '🚗 Đón tận nhà tại xã • Ghế ngồi rộng rãi, cốp để hành lý thoải mái';
      }
    } else if (serviceType === 'bao-xe-4-cho') {
      priceText = '400.000đ – 450.000đ / chuyến';
      noteText = '⭐ Bao nguyên xe 4 chỗ riêng tư • Xuất phát bất kỳ giờ nào theo ý khách';
    } else if (serviceType === 'bao-xe-7-cho') {
      priceText = '500.000đ – 550.000đ / chuyến';
      noteText = '🌟 Bao nguyên xe điện 7 chỗ VinFast Limo Green (43H-198.45) • Êm ái, đi gia đình & sân bay cực sướng';
    } else if (serviceType === 'gui-hang') {
      priceText = 'Chỉ từ 50.000đ / kiện';
      noteText = '📦 Nhận vận chuyển hàng hóa, bưu kiện nhỏ, hồ sơ, quà quê Thăng Bình ↔ Đà Nẵng nhận sau 1h30p';
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

  // Build booking summary text & open Zalo
  const buildBookingMessage = () => {
    const pickupText = pickupSelect?.options[pickupSelect.selectedIndex]?.text || 'Hà Lam';
    const dropoffText = dropoffSelect?.options[dropoffSelect.selectedIndex]?.text || 'Trung tâm Đà Nẵng';
    const serviceText = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Ghép 1 ghế';
    const timeText = timeSelect?.options[timeSelect.selectedIndex]?.text || 'Đi ngay (Đón sau 15 phút)';
    const priceText = quotePriceEl?.textContent || '100.000đ';

    return `Xin chào Nhà Xe Ghép Nghĩa Hà Lam!\nTôi muốn đặt xe:\n- Chiều đi: ${currentDirection}\n- Điểm tại Thăng Bình: ${pickupText}\n- Điểm tại Đà Nẵng: ${dropoffText}\n- Dịch vụ: ${serviceText} (${priceText})\n- Khung giờ: ${timeText}\nVui lòng đón tôi nhé!`;
  };

  const zaloBtn1 = document.getElementById('btn-book-zalo-1');
  const zaloBtn2 = document.getElementById('btn-book-zalo-2');

  const handleZaloBooking = (phone) => {
    const msg = buildBookingMessage();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    alert(
      `Đã sao chép thông tin chuyến đi của anh/chị:\n\n"${msg}"\n\nBấm OK để chuyển sang Zalo Nhà Xe Nghĩa Hà Lam (${phone}) và dán (Paste) tin nhắn nhé!`
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
});
