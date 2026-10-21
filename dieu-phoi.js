document.addEventListener('DOMContentLoaded', () => {
  // 1. INITIAL 20-VEHICLE FLEET DATABASE (11 at Thang Binh Queue, 9 at Da Nang Queue)
  const fleet = [
    // Queue TB (Đầu bến Thăng Bình)
    { id: 'XE-01', name: 'Anh Nghĩa (Xe Chủ Lực)', type: 'VinFast Limo Green 7C', queue: 'TB', loc: '469 Huỳnh Thúc Kháng, Hà Lam', seats: 0, maxSeats: 6, wallet: 850000, trips: 5 },
    { id: 'XE-02', name: 'Anh Tuấn Hà Lam', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Cây Cốc, Hà Lam', seats: 2, maxSeats: 6, wallet: 520000, trips: 4 },
    { id: 'XE-03', name: 'Anh Hùng Bình Quý', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Bình Quý', seats: 0, maxSeats: 6, wallet: 480000, trips: 4 },
    { id: 'XE-04', name: 'Anh Dũng Cầu Ông Triệu', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Cầu Ông Triệu, Bình Định', seats: 0, maxSeats: 6, wallet: 410000, trips: 3 },
    { id: 'XE-05', name: 'Anh Khoa Hà Châu', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Chợ Hà Châu, Bình Phú', seats: 0, maxSeats: 6, wallet: 600000, trips: 4 },
    { id: 'XE-06', name: 'Anh Minh Quý Mỹ', type: 'Toyota Veloz Cross 7C', queue: 'TB', loc: 'Thôn Quý Mỹ, Bình Quý', seats: 0, maxSeats: 6, wallet: 350000, trips: 3 },
    { id: 'XE-07', name: 'Anh Tâm Bình Nguyên', type: 'Hyundai Accent 4C', queue: 'TB', loc: 'Xã Bình Nguyên', seats: 0, maxSeats: 4, wallet: 390000, trips: 3 },
    { id: 'XE-08', name: 'Anh Hoàng Bình Phục', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'QL1A Xã Bình Phục', seats: 0, maxSeats: 6, wallet: 470000, trips: 3 },
    { id: 'XE-09', name: 'Anh Sơn Bình Chánh', type: 'Toyota Vios 4C', queue: 'TB', loc: 'Xã Bình Chánh', seats: 0, maxSeats: 4, wallet: 310000, trips: 2 },
    { id: 'XE-10', name: 'Anh Phúc Bình Minh', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Gần VinWonders Nam Hội An', seats: 0, maxSeats: 6, wallet: 540000, trips: 4 },
    { id: 'XE-11', name: 'Anh Long Hà Lam', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Chợ Hà Lam, Thăng Bình', seats: 0, maxSeats: 6, wallet: 430000, trips: 3 },

    // Queue DN (Đầu bến Đà Nẵng chờ quay đầu về Thăng Bình)
    { id: 'XE-12', name: 'Anh Hải (Trực BV Đa Khoa)', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Cổng BV Đa Khoa Đà Nẵng', seats: 1, maxSeats: 6, wallet: 590000, trips: 4 },
    { id: 'XE-13', name: 'Anh Bảo (Trực Sân Bay)', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Sân bay Quốc tế Đà Nẵng', seats: 0, maxSeats: 6, wallet: 640000, trips: 5 },
    { id: 'XE-14', name: 'Anh Thành (Trực BV 600G)', type: 'Toyota Innova 7C', queue: 'DN', loc: 'BV Phụ Sản - Nhi 600 Giường', seats: 0, maxSeats: 6, wallet: 420000, trips: 3 },
    { id: 'XE-15', name: 'Anh Đạt (Trực BV Ung Bướu)', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'BV Ung Bướu Đà Nẵng', seats: 0, maxSeats: 6, wallet: 510000, trips: 4 },
    { id: 'XE-16', name: 'Anh Vũ Hải Châu', type: 'Honda City 4C', queue: 'DN', loc: 'Quận Hải Châu, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 360000, trips: 3 },
    { id: 'XE-17', name: 'Anh Khánh Thanh Khê', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Ga Đà Nẵng / Thanh Khê', seats: 0, maxSeats: 6, wallet: 490000, trips: 3 },
    { id: 'XE-18', name: 'Anh Tùng Cẩm Lệ', type: 'Mitsubishi Xpander 7C', queue: 'DN', loc: 'Ngã tư Cẩm Lệ, Đà Nẵng', seats: 0, maxSeats: 6, wallet: 380000, trips: 3 },
    { id: 'XE-19', name: 'Anh Nam Sơn Trà', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Chùa Linh Ứng / Sơn Trà', seats: 0, maxSeats: 6, wallet: 550000, trips: 4 },
    { id: 'XE-20', name: 'Anh Việt Ngũ Hành Sơn', type: 'Mazda 3 4C', queue: 'DN', loc: 'Ngũ Hành Sơn, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 330000, trips: 2 }
  ];

  // State counters
  let totalCallsToday = 142;
  let totalSeatsToday = 86;
  let totalChartersToday = 14;
  let totalCommissionToday = 2450000;
  let activeQueueTab = 'TB';
  let countdownValue = 45;
  let countdownTimer = null;

  // Current extracted order waiting for dispatch
  let currentOrder = {
    code: '#TB-208',
    customerPhoneMasked: '0905.***889',
    customerPhoneFull: '0905.382.889',
    queue: 'TB',
    directionText: 'Thăng Bình ➔ Đà Nẵng',
    pickup: 'Ngã 3 Bình Quý (Xã Bình Quý)',
    dropoff: 'Bệnh viện Đa khoa Đà Nẵng',
    serviceName: 'Đi ghép 2 người (100K/người + 100K)',
    seatsNeeded: 2,
    isCharter: false,
    totalFare: 200000,
    commissionFee: 30000,
    driverNet: 170000,
    timeNote: 'Đi ngay (Đón sau 15 phút)'
  };

  // Pooled passengers on active combo car
  const pooledSeats = [
    { label: 'Ghế 1: Chị Lan (Hà Lam ➔ BV Đa Khoa)', occupied: true },
    { label: 'Ghế 2: Cô Tư (Hà Lam ➔ BV Đa Khoa)', occupied: true },
    { label: 'Ghế 3: Đang trống (100K)', occupied: false },
    { label: 'Ghế 4: Đang trống (100K)', occupied: false },
    { label: 'Ghế 5: Đang trống (100K)', occupied: false },
    { label: 'Ghế 6: Đang trống (100K)', occupied: false }
  ];

  // DOM Elements
  const feeSeatSelect = document.getElementById('cfg-seat-fee');
  const feeCharterSelect = document.getElementById('cfg-charter-fee');
  const kpiCallsEl = document.getElementById('kpi-calls');
  const kpiTripsEl = document.getElementById('kpi-trips');
  const kpiCommissionEl = document.getElementById('kpi-commission');
  const transcriptInput = document.getElementById('call-transcript-input');
  const btnAiExtract = document.getElementById('btn-ai-extract');
  const btnMic = document.getElementById('btn-voice-mic');
  const queueListEl = document.getElementById('driver-queue-list');
  const seatSlotsEl = document.getElementById('pooling-seat-slots');
  const logBoxEl = document.getElementById('dispatch-activity-log');

  // Format currency
  const formatVND = (num) => num.toLocaleString('vi-VN') + 'đ';

  // Add Activity Log
  const addLog = (htmlMsg) => {
    if (!logBoxEl) return;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span style="color:#64748b">[${timeStr}]</span> ${htmlMsg}`;
    logBoxEl.prepend(div);
  };

  // Render Pooling Slots
  const renderPoolingSlots = () => {
    if (!seatSlotsEl) return;
    seatSlotsEl.innerHTML = pooledSeats
      .map(
        (s) => `
      <div class="seat-slot ${s.occupied ? 'occupied' : ''}">
        ${s.occupied ? '🟢 ' : '⚪ '}${s.label}
      </div>
    `
      )
      .join('');
  };

  // Render 20-Vehicle Queue List
  const renderQueue = () => {
    if (!queueListEl) return;
    const filtered = fleet.filter((car) => car.queue === activeQueueTab);
    queueListEl.innerHTML = filtered
      .map((car, index) => {
        const isTop = index === 0;
        return `
        <div class="driver-row ${isTop ? 'top-queue' : ''}">
          <div class="rank-badge">#${index + 1}</div>
          <div class="driver-meta">
            <strong>${car.id} • ${car.name} ${isTop ? '⚡ (Ưu tiên #1)' : ''}</strong>
            <small>${car.type} • 📍 ${car.loc} • Đã ghép: ${car.seats}/${car.maxSeats} ghế (${car.trips} chuyến)</small>
          </div>
          <div class="driver-wallet">
            <span>Ví cọc tài xế</span>
            <strong>${formatVND(car.wallet)}</strong>
          </div>
          <button type="button" class="btn-topup" data-id="${car.id}">+Nạp QR</button>
        </div>
      `;
      })
      .join('');

    // Attach topup listeners
    queueListEl.querySelectorAll('.btn-topup').forEach((btn) => {
      btn.addEventListener('click', () => {
        const carId = btn.getAttribute('data-id');
        const targetCar = fleet.find((c) => c.id === carId);
        if (targetCar) {
          targetCar.wallet += 200000;
          renderQueue();
          addLog(`💳 Tài xế <strong>${targetCar.name} (${targetCar.id})</strong> vừa quét VietQR nạp thêm <strong>+200.000đ</strong> vào Ví Điều Phối.`);
        }
      });
    });
  };

  // Render Extracted Card & Driver Phone Alert
  const renderCurrentOrder = (unmaskPhone = false) => {
    const extCode = document.getElementById('ext-code');
    const extService = document.getElementById('ext-service');
    const extPickup = document.getElementById('ext-pickup');
    const extDropoff = document.getElementById('ext-dropoff');
    const extFare = document.getElementById('ext-fare');
    const extFee = document.getElementById('ext-fee');

    if (extCode) extCode.textContent = currentOrder.code;
    if (extService) extService.textContent = currentOrder.serviceName;
    if (extPickup) extPickup.textContent = currentOrder.pickup;
    if (extDropoff) extDropoff.textContent = currentOrder.dropoff;
    if (extFare) extFare.textContent = formatVND(currentOrder.totalFare);
    if (extFee) extFee.textContent = `${formatVND(currentOrder.commissionFee)} (Thực nhận: ${formatVND(currentOrder.driverNet)})`;

    // Update Simulated Driver Phone
    const topCar = fleet.find((c) => c.queue === currentOrder.queue) || fleet[0];
    const phoneDriverName = document.getElementById('phone-driver-name');
    const phoneOrderCode = document.getElementById('phone-order-code');
    const phoneRouteInfo = document.getElementById('phone-route-info');
    const phoneFare = document.getElementById('phone-fare');
    const phoneFee = document.getElementById('phone-fee');
    const phoneNet = document.getElementById('phone-net');

    if (phoneDriverName) phoneDriverName.textContent = `${topCar.id} • ${topCar.name}`;
    if (phoneOrderCode) phoneOrderCode.textContent = `CUỐC MỚI ${currentOrder.code}`;
    if (phoneRouteInfo) {
      phoneRouteInfo.innerHTML = `
        <p><strong>Chiều:</strong> ${currentOrder.directionText}</p>
        <p><strong>📍 Đón:</strong> ${currentOrder.pickup}</p>
        <p><strong>🏥 Trả:</strong> ${currentOrder.dropoff}</p>
        <p><strong>👥 Dịch vụ:</strong> ${currentOrder.serviceName}</p>
        <p><strong>📞 SĐT Khách:</strong> <span style="color:#fde047;font-weight:800">${unmaskPhone ? currentOrder.customerPhoneFull + ' (Đã mở khóa)' : currentOrder.customerPhoneMasked + ' (Nhận cuốc để mở số)'}</span></p>
      `;
    }
    if (phoneFare) phoneFare.textContent = formatVND(currentOrder.totalFare);
    if (phoneFee) phoneFee.textContent = '-' + formatVND(currentOrder.commissionFee);
    if (phoneNet) phoneNet.textContent = formatVND(currentOrder.driverNet);
  };

  // Start / Reset 45s Countdown Timer
  const startCountdown = () => {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownValue = 45;
    const badge = document.getElementById('phone-countdown');
    if (badge) badge.textContent = `⏳ ${countdownValue}s`;

    countdownTimer = setInterval(() => {
      countdownValue -= 1;
      if (badge) badge.textContent = `⏳ ${countdownValue}s`;
      if (countdownValue <= 0) {
        rotateDriverQueue('Hết 45 giây không phản hồi');
      }
    }, 1000);
  };

  // Rotate Queue (When driver skips or times out)
  const rotateDriverQueue = (reason) => {
    const queueCars = fleet.filter((c) => c.queue === currentOrder.queue);
    if (queueCars.length < 2) return;
    const skippedCar = queueCars[0];
    const idxInFleet = fleet.indexOf(skippedCar);
    if (idxInFleet > -1) {
      fleet.splice(idxInFleet, 1);
      fleet.push(skippedCar);
    }
    const nextCar = fleet.find((c) => c.queue === currentOrder.queue);
    addLog(`⏭️ <strong>${skippedCar.id} (${skippedCar.name})</strong>: ${reason} ➔ Tự động xoay vòng cuốc <strong>${currentOrder.code}</strong> sang <strong>${nextCar.id} (${nextCar.name})</strong>.`);
    renderQueue();
    renderCurrentOrder(false);
    startCountdown();
  };

  // NLP Call Parser (Extracts structured order from natural Vietnamese speech/text)
  const parseCallTranscript = (rawText) => {
    const text = rawText.toLowerCase();
    const seatFeeUnit = parseInt(feeSeatSelect?.value || '15000', 10);
    const charterFeePct = parseInt(feeCharterSelect?.value || '10', 10);

    // 1. Detect Direction & Queue
    let queue = 'TB';
    let directionText = 'Thăng Bình ➔ Đà Nẵng';
    if (
      text.includes('về lại') ||
      text.includes('về thăng bình') ||
      text.includes('về hà lam') ||
      text.includes('về bình') ||
      text.includes('khám bệnh xong')
    ) {
      queue = 'DN';
      directionText = 'Đà Nẵng ➔ Về Thăng Bình';
    }

    // 2. Detect Pickup & Dropoff locations
    let pickup = 'Thị trấn Hà Lam (469 Huỳnh Thúc Kháng)';
    if (text.includes('bình quý') || text.includes('quý mỹ')) pickup = 'Ngã 3 Bình Quý / Thôn Quý Mỹ';
    else if (text.includes('ông triệu') || text.includes('bình định')) pickup = 'Cầu Ông Triệu (Xã Bình Định)';
    else if (text.includes('hà châu') || text.includes('bình phú')) pickup = 'Chợ Hà Châu (Xã Bình Phú)';
    else if (text.includes('bình nguyên')) pickup = 'Xã Bình Nguyên, Thăng Bình';
    else if (text.includes('bình phục')) pickup = 'Xã Bình Phục, Thăng Bình';
    else if (text.includes('bình chánh')) pickup = 'Xã Bình Chánh, Thăng Bình';

    let dropoff = 'Trung tâm TP. Đà Nẵng';
    if (text.includes('đa khoa')) dropoff = 'Bệnh viện Đa khoa Đà Nẵng';
    else if (text.includes('ung bướu')) dropoff = 'Bệnh viện Ung Bướu Đà Nẵng';
    else if (text.includes('600 giường') || text.includes('phụ sản')) dropoff = 'Bệnh viện Phụ Sản - Nhi (600 Giường)';
    else if (text.includes('sân bay chu lai') || text.includes('chu lai')) dropoff = 'Sân bay Chu Lai / Núi Thành';
    else if (text.includes('sân bay')) dropoff = 'Sân bay Quốc tế Đà Nẵng';
    else if (text.includes('vinwonders') || text.includes('hội an')) dropoff = 'VinWonders Nam Hội An & Phố cổ Hội An';
    else if (text.includes('bà nà')) dropoff = 'Khu du lịch Bà Nà Hills';
    else if (text.includes('linh ứng') || text.includes('ngũ hành sơn')) dropoff = 'Chùa Linh Ứng & Ngũ Hành Sơn';
    else if (text.includes('quảng ngãi') || text.includes('huế') || text.includes('tam kỳ')) dropoff = 'Hợp đồng Đi tỉnh (Tam Kỳ / Quảng Ngãi / Huế)';

    if (queue === 'DN') {
      const temp = pickup;
      pickup = dropoff;
      dropoff = temp;
    }

    // 3. Detect Passenger Count & Service Formula (100K/person vs Charter 350K-600K)
    let seatsNeeded = 1;
    if (text.match(/\b(2|hai)\s*(ghế|người|vé|chỗ|mẹ con)/)) seatsNeeded = 2;
    else if (text.match(/\b(3|ba)\s*(ghế|người|vé|chỗ)/)) seatsNeeded = 3;
    else if (text.match(/\b(4|bốn)\s*(ghế|người|vé|chỗ)/)) seatsNeeded = 4;
    else if (text.match(/\b(5|năm)\s*(ghế|người|vé|chỗ)/)) seatsNeeded = 5;

    let serviceName = `Đi ghép ${seatsNeeded} người (100K/người)`;
    let totalFare = seatsNeeded * 100000;
    let commissionFee = seatsNeeded * seatFeeUnit;
    let isCharter = false;

    if (text.includes('bao nguyên') || text.includes('bao chiếc') || text.includes('bao xe')) {
      isCharter = true;
      serviceName = 'Bao nguyên xe riêng 4–7 chỗ (Khung 350K–600K)';
      totalFare = 450000;
      commissionFee = Math.round((totalFare * charterFeePct) / 100);
    } else if (text.includes('đám cưới') || text.includes('xe hoa') || text.includes('rước dâu')) {
      isCharter = true;
      serviceName = 'Thuê xe Hoa – Cưới hỏi – Rước dâu';
      totalFare = 600000;
      commissionFee = Math.round((totalFare * charterFeePct) / 100);
    } else if (text.includes('vinwonders') || text.includes('du lịch') || text.includes('tham quan') || text.includes('bà nà')) {
      isCharter = true;
      serviceName = 'Thuê xe Du lịch – Tham quan trọn gói';
      totalFare = 550000;
      commissionFee = Math.round((totalFare * charterFeePct) / 100);
    } else if (text.includes('gửi hàng') || text.includes('bưu kiện') || text.includes('gửi đồ')) {
      seatsNeeded = 1;
      serviceName = 'Gửi hàng hóa / Bưu kiện hỏa tốc';
      totalFare = 50000;
      commissionFee = 10000;
    }

    const randomNum = Math.floor(100 + Math.random() * 899);
    const randomPhoneSuffix = Math.floor(100 + Math.random() * 899);

    currentOrder = {
      code: `#${queue}-${randomNum}`,
      customerPhoneMasked: `0905.***${randomPhoneSuffix}`,
      customerPhoneFull: `0905.412.${randomPhoneSuffix}`,
      queue,
      directionText,
      pickup,
      dropoff,
      serviceName,
      seatsNeeded,
      isCharter,
      totalFare,
      commissionFee,
      driverNet: totalFare - commissionFee,
      timeNote: 'Đi ngay (Đón sau 15 phút)'
    };

    // Switch queue tab to match order direction
    activeQueueTab = queue;
    document.querySelectorAll('.q-tab').forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-q') === activeQueueTab);
    });

    totalCallsToday += 1;
    if (kpiCallsEl) kpiCallsEl.textContent = `${totalCallsToday} cuộc`;

    renderQueue();
    renderCurrentOrder(false);
    startCountdown();

    const topCar = fleet.find((c) => c.queue === currentOrder.queue);
    addLog(
      `🤖 <strong>AI Voicebot</strong> vừa bóc tách cuộc gọi <strong>${currentOrder.code}</strong> (${currentOrder.serviceName} - <strong>${formatVND(currentOrder.totalFare)}</strong>) ➔ Tự động bắn cho <strong>${topCar.id} (${topCar.name})</strong>.`
    );
  };

  // Preset Scenario Buttons
  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sampleText = btn.getAttribute('data-speech');
      if (transcriptInput && sampleText) {
        transcriptInput.value = sampleText;
        parseCallTranscript(sampleText);
      }
    });
  });

  if (btnAiExtract) {
    btnAiExtract.addEventListener('click', () => {
      if (transcriptInput && transcriptInput.value.trim()) {
        parseCallTranscript(transcriptInput.value.trim());
      }
    });
  }

  // Web Speech API (Voice Recognition if supported by browser)
  if (btnMic) {
    btnMic.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Trình duyệt hiện tại chưa bật quyền Mic hoặc không hỗ trợ Web Speech. Anh có thể bấm các nút Kịch bản mẫu bên trên hoặc gõ trực tiếp câu nói của khách vào ô nhé!');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      btnMic.classList.add('listening');
      btnMic.textContent = '🔴 Đang nghe...';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcriptInput) transcriptInput.value = transcript;
        parseCallTranscript(transcript);
      };
      recognition.onend = () => {
        btnMic.classList.remove('listening');
        btnMic.textContent = '🎙️ Nói Thử Vào Mic';
      };
      recognition.onerror = () => {
        btnMic.classList.remove('listening');
        btnMic.textContent = '🎙️ Nói Thử Vào Mic';
      };
      recognition.start();
    });
  }

  // Queue Tab Switcher
  document.querySelectorAll('.q-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.q-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeQueueTab = tab.getAttribute('data-q') || 'TB';
      renderQueue();
    });
  });

  // Driver Accepts Trip Button
  const btnAccept = document.getElementById('btn-driver-accept');
  const btnSkip = document.getElementById('btn-driver-skip');

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer);
      const topCar = fleet.find((c) => c.queue === currentOrder.queue);
      if (!topCar) return;

      // Deduct commission from driver wallet
      topCar.wallet -= currentOrder.commissionFee;
      topCar.trips += 1;
      totalCommissionToday += currentOrder.commissionFee;

      if (currentOrder.isCharter) {
        totalChartersToday += 1;
        topCar.seats = topCar.maxSeats;
      } else {
        totalSeatsToday += currentOrder.seatsNeeded;
        topCar.seats = Math.min(topCar.maxSeats, topCar.seats + currentOrder.seatsNeeded);

        // Fill pooling slots visually
        let needed = currentOrder.seatsNeeded;
        pooledSeats.forEach((slot) => {
          if (!slot.occupied && needed > 0) {
            slot.occupied = true;
            slot.label = `Ghế đã ghép: ${currentOrder.pickup.slice(0, 14)}.. (100K)`;
            needed -= 1;
          }
        });
        renderPoolingSlots();
      }

      // Update KPI display
      if (kpiTripsEl) kpiTripsEl.textContent = `${totalSeatsToday} ghế • ${totalChartersToday} bao xe`;
      if (kpiCommissionEl) kpiCommissionEl.textContent = formatVND(totalCommissionToday);

      // Unmask phone for driver
      renderCurrentOrder(true);

      addLog(
        `✅ <strong>${topCar.id} (${topCar.name})</strong> đã NHẬN CUỐC <strong>${currentOrder.code}</strong>! Hệ thống tự động trừ <strong>-${formatVND(currentOrder.commissionFee)}</strong> phí điều xe và gửi Zalo ZNS báo thông tin tài xế cho khách <strong>${currentOrder.customerPhoneFull}</strong>.`
      );

      // Rotate car to bottom of queue if charter or full
      const idx = fleet.indexOf(topCar);
      if (idx > -1) {
        fleet.splice(idx, 1);
        fleet.push(topCar);
      }
      renderQueue();
    });
  }

  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      rotateDriverQueue('Bấm nhường cuốc cho xe sau');
    });
  }

  // Recalculate when commission config changes
  [feeSeatSelect, feeCharterSelect].forEach((sel) => {
    if (sel) {
      sel.addEventListener('change', () => {
        if (transcriptInput && transcriptInput.value.trim()) {
          parseCallTranscript(transcriptInput.value.trim());
        }
      });
    }
  });

  // Initial render
  renderPoolingSlots();
  renderQueue();
  renderCurrentOrder(false);
  startCountdown();
});
