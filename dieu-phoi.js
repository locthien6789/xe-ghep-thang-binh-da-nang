document.addEventListener('DOMContentLoaded', () => {
  // 0. ADMIN PIN GATE & SIDEBAR TAB SWITCHING
  const gateOverlay = document.getElementById('admin-gate');
  const btnGateLogin = document.getElementById('btn-gate-login');
  const btnLock = document.getElementById('btn-lock-dashboard');
  const pinInput = document.getElementById('admin-pin-input');

  if (btnGateLogin && gateOverlay) {
    btnGateLogin.addEventListener('click', () => {
      if (!pinInput || pinInput.value.trim().length >= 4) {
        gateOverlay.classList.add('hidden');
      } else {
        alert('Vui lòng nhập mã PIN Quản trị (Mặc định: 1296)');
      }
    });
  }

  if (btnLock && gateOverlay) {
    btnLock.addEventListener('click', () => {
      gateOverlay.classList.remove('hidden');
    });
  }

  // Sidebar Tabs
  const navBtns = document.querySelectorAll('.sb-nav-btn');
  const tabViews = document.querySelectorAll('.db-tab-view');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      tabViews.forEach((view) => {
        view.classList.toggle('active', view.id === targetTab);
      });
    });
  });

  // 1. INITIAL 20-VEHICLE FLEET DATABASE (11 at Thang Binh Queue, 9 at Da Nang Queue)
  const fleet = [
    { id: 'XE-01', name: 'Anh Nghĩa (Xe Chủ Lực)', phone: '0896.211.296', type: 'VinFast Limo Green 7C', queue: 'TB', loc: '469 Huỳnh Thúc Kháng, Hà Lam', seats: 0, maxSeats: 6, wallet: 850000, trips: 5 },
    { id: 'XE-02', name: 'Anh Tuấn Hà Lam', phone: '0905.214.112', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Cây Cốc, Hà Lam', seats: 2, maxSeats: 6, wallet: 520000, trips: 4 },
    { id: 'XE-03', name: 'Anh Hùng Bình Quý', phone: '0935.618.220', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Bình Quý', seats: 0, maxSeats: 6, wallet: 480000, trips: 4 },
    { id: 'XE-04', name: 'Anh Dũng Cầu Ông Triệu', phone: '0905.771.309', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Cầu Ông Triệu, Bình Định', seats: 0, maxSeats: 6, wallet: 410000, trips: 3 },
    { id: 'XE-05', name: 'Anh Khoa Hà Châu', phone: '0983.412.885', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Chợ Hà Châu, Bình Phú', seats: 0, maxSeats: 6, wallet: 600000, trips: 4 },
    { id: 'XE-06', name: 'Anh Minh Quý Mỹ', phone: '0914.552.190', type: 'Toyota Veloz Cross 7C', queue: 'TB', loc: 'Thôn Quý Mỹ, Bình Quý', seats: 0, maxSeats: 6, wallet: 350000, trips: 3 },
    { id: 'XE-07', name: 'Anh Tâm Bình Nguyên', phone: '0905.918.441', type: 'Hyundai Accent 4C', queue: 'TB', loc: 'Xã Bình Nguyên', seats: 0, maxSeats: 4, wallet: 390000, trips: 3 },
    { id: 'XE-08', name: 'Anh Hoàng Bình Phục', phone: '0935.109.774', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'QL1A Xã Bình Phục', seats: 0, maxSeats: 6, wallet: 470000, trips: 3 },
    { id: 'XE-09', name: 'Anh Sơn Bình Chánh', phone: '0905.334.612', type: 'Toyota Vios 4C', queue: 'TB', loc: 'Xã Bình Chánh', seats: 0, maxSeats: 4, wallet: 310000, trips: 2 },
    { id: 'XE-10', name: 'Anh Phúc Bình Minh', phone: '0977.812.550', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Gần VinWonders Nam Hội An', seats: 0, maxSeats: 6, wallet: 540000, trips: 4 },
    { id: 'XE-11', name: 'Anh Long Hà Lam', phone: '0905.663.901', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Chợ Hà Lam, Thăng Bình', seats: 0, maxSeats: 6, wallet: 430000, trips: 3 },

    { id: 'XE-12', name: 'Anh Hải (Trực BV Đa Khoa)', phone: '0905.882.119', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Cổng BV Đa Khoa Đà Nẵng', seats: 1, maxSeats: 6, wallet: 590000, trips: 4 },
    { id: 'XE-13', name: 'Anh Bảo (Trực Sân Bay)', phone: '0935.441.208', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Sân bay Quốc tế Đà Nẵng', seats: 0, maxSeats: 6, wallet: 640000, trips: 5 },
    { id: 'XE-14', name: 'Anh Thành (Trực BV 600G)', phone: '0905.129.884', type: 'Toyota Innova 7C', queue: 'DN', loc: 'BV Phụ Sản - Nhi 600 Giường', seats: 0, maxSeats: 6, wallet: 420000, trips: 3 },
    { id: 'XE-15', name: 'Anh Đạt (Trực BV Ung Bướu)', phone: '0914.773.210', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'BV Ung Bướu Đà Nẵng', seats: 0, maxSeats: 6, wallet: 510000, trips: 4 },
    { id: 'XE-16', name: 'Anh Vũ Hải Châu', phone: '0905.501.337', type: 'Honda City 4C', queue: 'DN', loc: 'Quận Hải Châu, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 360000, trips: 3 },
    { id: 'XE-17', name: 'Anh Khánh Thanh Khê', phone: '0935.990.142', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Ga Đà Nẵng / Thanh Khê', seats: 0, maxSeats: 6, wallet: 490000, trips: 3 },
    { id: 'XE-18', name: 'Anh Tùng Cẩm Lệ', phone: '0905.712.665', type: 'Mitsubishi Xpander 7C', queue: 'DN', loc: 'Ngã tư Cẩm Lệ, Đà Nẵng', seats: 0, maxSeats: 6, wallet: 380000, trips: 3 },
    { id: 'XE-19', name: 'Anh Nam Sơn Trà', phone: '0989.314.778', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Chùa Linh Ứng / Sơn Trà', seats: 0, maxSeats: 6, wallet: 550000, trips: 4 },
    { id: 'XE-20', name: 'Anh Việt Ngũ Hành Sơn', phone: '0905.238.991', type: 'Mazda 3 4C', queue: 'DN', loc: 'Ngũ Hành Sơn, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 330000, trips: 2 }
  ];

  // Initial Orders History List (Tab 2 CRM) + Sync Web Bookings from localStorage
  const defaultOrders = [
    { code: '#TB-205', time: '06:15', customerPhone: '0905.218.442', route: 'Thị trấn Hà Lam ➔ BV Đa khoa Đà Nẵng', service: 'Ghép 2 người (100K/người)', fare: 200000, fee: 30000, driverId: 'XE-02', driverName: 'Anh Tuấn Hà Lam', refunded: false },
    { code: '#TB-206', time: '06:30', customerPhone: '0935.881.109', route: 'Chợ Hà Châu ➔ Sân bay Đà Nẵng', service: 'Bao nguyên xe 7 chỗ', fare: 450000, fee: 45000, driverId: 'XE-05', driverName: 'Anh Khoa Hà Châu', refunded: false },
    { code: '#DN-207', time: '07:05', customerPhone: '0914.339.712', route: 'BV 600 Giường ĐN ➔ Cầu Ông Triệu', service: 'Ghép 1 người (100K/người)', fare: 100000, fee: 15000, driverId: 'XE-12', driverName: 'Anh Hải', refunded: false }
  ];
  let webSavedOrders = [];
  try {
    webSavedOrders = JSON.parse(localStorage.getItem('nghia_halam_web_orders') || '[]');
  } catch (e) {}
  const ordersHistory = [...webSavedOrders, ...defaultOrders];

  // State counters
  let totalCallsToday = 142;
  let totalSeatsToday = 86;
  let totalChartersToday = 14;
  let totalCommissionToday = 2450000;
  let activeQueueTab = 'TB';
  let countdownValue = 45;
  let countdownTimer = null;

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
  const ordersTableBody = document.getElementById('orders-table-body');
  const fleetFullTableBody = document.getElementById('fleet-full-table-body');

  const formatVND = (num) => num.toLocaleString('vi-VN') + 'đ';

  const addLog = (htmlMsg) => {
    if (!logBoxEl) return;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8);
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span style="color:#64748b">[${timeStr}]</span> ${htmlMsg}`;
    logBoxEl.prepend(div);
  };

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

  // Render Orders History Table (Tab 2)
  const renderOrdersTable = () => {
    if (!ordersTableBody) return;
    ordersTableBody.innerHTML = ordersHistory
      .map(
        (o, idx) => `
      <tr>
        <td><strong style="color:#fde047">${o.code}</strong><br><small>${o.time}</small></td>
        <td>
          <strong><a href="tel:${o.phoneClean || o.customerPhone}" style="color:#38bdf8;text-decoration:underline;">📞 ${o.customerPhone}</a></strong>
          ${o.mapsUrl ? `<br><a href="${o.mapsUrl}" target="_blank" rel="noopener" style="color:#34d399;font-size:0.78rem;font-weight:800;">🗺️ Mở Bản Đồ GPS ↗</a>` : ''}
        </td>
        <td>${o.route}</td>
        <td>${o.service}</td>
        <td><strong style="color:#fff">${formatVND(o.fare)}</strong></td>
        <td><strong style="color:#34d399">${o.refunded ? '0đ (Đã hoàn)' : '-' + formatVND(o.fee)}</strong></td>
        <td>${o.driverId} • ${o.driverName}</td>
        <td>
          <span class="status-pill ${o.refunded ? 'refund' : 'done'}">
            ${o.refunded ? 'Khách hủy (Đã hoàn phí)' : 'Đã nhận cuốc'}
          </span>
        </td>
        <td>
          ${
            o.refunded
              ? '<small style="color:#64748b">Đã xử lý</small>'
              : `<button type="button" class="btn-topup js-refund-order" data-idx="${idx}">↩ Hoàn Phí Cò</button>
                 <button type="button" class="btn-topup js-remind-return" data-idx="${idx}" style="margin-top:4px;border-color:#38bdf8;color:#38bdf8;">💬 Nhắc Chiều Về</button>`
          }
        </td>
      </tr>
    `
      )
      .join('');

    ordersTableBody.querySelectorAll('.js-remind-return').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        const order = ordersHistory[i];
        if (!order) return;
        const msg = `Dạ Nhà Xe Nghĩa Hà Lam (xeghepthangbinhdanang.vn) cảm ơn anh/chị (${order.customerPhone}) đã đặt chuyến ${order.route}! Anh/chị lưu số tổng đài 0896.211.296 nhé, lúc nào khám bệnh / công việc xong chỉ cần gọi trước 15 phút hoặc gửi định vị Zalo là có xe điện đón về tận nhà ngay ạ!`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).catch(() => {});
        }
        addLog(`💬 Đã sao chép tin nhắn <strong>Chăm sóc & Chốt chiều về (Khứ hồi)</strong> cho đơn <strong>${order.code} (${order.customerPhone})</strong>.`);
        alert(`Đã sao chép tin nhắn chăm sóc khách & chốt chiều về:\n\n"${msg}"`);
      });
    });

    ordersTableBody.querySelectorAll('.js-refund-order').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        const order = ordersHistory[i];
        if (order && !order.refunded) {
          order.refunded = true;
          const car = fleet.find((c) => c.id === order.driverId);
          if (car) car.wallet += order.fee;
          totalCommissionToday -= order.fee;
          if (kpiCommissionEl) kpiCommissionEl.textContent = formatVND(totalCommissionToday);
          addLog(`↩️ Quản trị viên đã duyệt <strong>Hoàn phí điều xe +${formatVND(order.fee)}</strong> đơn <strong>${order.code}</strong> về Ví tài xế <strong>${order.driverName}</strong>.`);
          renderOrdersTable();
          renderQueue();
          renderFullFleetTable();
        }
      });
    });
  };

  // Render Full 20-Vehicle Table (Tab 3)
  const renderFullFleetTable = () => {
    if (!fleetFullTableBody) return;
    fleetFullTableBody.innerHTML = fleet
      .map(
        (car) => `
      <tr>
        <td><strong style="color:#fde047">${car.id}</strong></td>
        <td><strong>${car.name}</strong><br><small>${car.phone}</small></td>
        <td>${car.type}</td>
        <td>
          <span class="status-pill done">${car.queue === 'TB' ? '🏡 Bến Thăng Bình' : '🏙️ Bến Đà Nẵng'}</span>
          <br><small>${car.loc}</small>
        </td>
        <td>${car.seats}/${car.maxSeats} ghế (${car.trips} chuyến)</td>
        <td><strong style="color:#34d399;font-size:0.95rem">${formatVND(car.wallet)}</strong></td>
        <td>
          <button type="button" class="btn-topup js-topup-full" data-id="${car.id}">+Nạp 200K</button>
          <button type="button" class="btn-topup js-switch-station" data-id="${car.id}">⇄ Đổi Bến</button>
        </td>
      </tr>
    `
      )
      .join('');

    fleetFullTableBody.querySelectorAll('.js-topup-full').forEach((btn) => {
      btn.addEventListener('click', () => {
        const car = fleet.find((c) => c.id === btn.getAttribute('data-id'));
        if (car) {
          car.wallet += 200000;
          renderFullFleetTable();
          renderQueue();
          addLog(`💳 Admin vừa nạp <strong>+200.000đ</strong> vào Ví cọc của <strong>${car.id} (${car.name})</strong>.`);
        }
      });
    });

    fleetFullTableBody.querySelectorAll('.js-switch-station').forEach((btn) => {
      btn.addEventListener('click', () => {
        const car = fleet.find((c) => c.id === btn.getAttribute('data-id'));
        if (car) {
          car.queue = car.queue === 'TB' ? 'DN' : 'TB';
          car.loc = car.queue === 'TB' ? 'Thị trấn Hà Lam, Thăng Bình' : 'Trung tâm TP. Đà Nẵng';
          renderFullFleetTable();
          renderQueue();
          addLog(`⇄ Admin đã chuyển đầu bến của <strong>${car.id} (${car.name})</strong> sang <strong>${car.queue === 'TB' ? 'Bến Thăng Bình' : 'Bến Đà Nẵng'}</strong>.`);
        }
      });
    });
  };

  // Render Live Queue List (Tab 1)
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

    queueListEl.querySelectorAll('.btn-topup').forEach((btn) => {
      btn.addEventListener('click', () => {
        const carId = btn.getAttribute('data-id');
        const targetCar = fleet.find((c) => c.id === carId);
        if (targetCar) {
          targetCar.wallet += 200000;
          renderQueue();
          renderFullFleetTable();
          addLog(`💳 Tài xế <strong>${targetCar.name} (${targetCar.id})</strong> vừa quét VietQR nạp thêm <strong>+200.000đ</strong> vào Ví Điều Phối.`);
        }
      });
    });
  };

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
    renderFullFleetTable();
    renderCurrentOrder(false);
    startCountdown();
  };

  const parseCallTranscript = (rawText) => {
    const text = rawText.toLowerCase();
    const seatFeeUnit = parseInt(feeSeatSelect?.value || '15000', 10);
    const charterFeePct = parseInt(feeCharterSelect?.value || '10', 10);

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

  if (btnMic) {
    btnMic.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Trình duyệt hiện tại chưa bật quyền Mic. Anh có thể bấm các nút Kịch bản mẫu bên trên hoặc gõ trực tiếp câu nói của khách vào ô nhé!');
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

  document.querySelectorAll('.q-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.q-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeQueueTab = tab.getAttribute('data-q') || 'TB';
      renderQueue();
    });
  });

  const btnAccept = document.getElementById('btn-driver-accept');
  const btnSkip = document.getElementById('btn-driver-skip');

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      if (countdownTimer) clearInterval(countdownTimer);
      const topCar = fleet.find((c) => c.queue === currentOrder.queue);
      if (!topCar) return;

      topCar.wallet -= currentOrder.commissionFee;
      topCar.trips += 1;
      totalCommissionToday += currentOrder.commissionFee;

      if (currentOrder.isCharter) {
        totalChartersToday += 1;
        topCar.seats = topCar.maxSeats;
      } else {
        totalSeatsToday += currentOrder.seatsNeeded;
        topCar.seats = Math.min(topCar.maxSeats, topCar.seats + currentOrder.seatsNeeded);

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

      // Add to Orders CRM History
      const nowTime = new Date().toTimeString().slice(0, 5);
      ordersHistory.unshift({
        code: currentOrder.code,
        time: nowTime,
        customerPhone: currentOrder.customerPhoneFull,
        route: `${currentOrder.pickup} ➔ ${currentOrder.dropoff}`,
        service: currentOrder.serviceName,
        fare: currentOrder.totalFare,
        fee: currentOrder.commissionFee,
        driverId: topCar.id,
        driverName: topCar.name,
        refunded: false
      });

      if (kpiTripsEl) kpiTripsEl.textContent = `${totalSeatsToday} ghế • ${totalChartersToday} bao xe`;
      if (kpiCommissionEl) kpiCommissionEl.textContent = formatVND(totalCommissionToday);

      renderCurrentOrder(true);
      renderOrdersTable();
      renderFullFleetTable();

      addLog(
        `✅ <strong>${topCar.id} (${topCar.name})</strong> đã NHẬN CUỐC <strong>${currentOrder.code}</strong>! Trừ <strong>-${formatVND(currentOrder.commissionFee)}</strong> phí điều xe và gửi Zalo ZNS cho khách <strong>${currentOrder.customerPhoneFull}</strong>.`
      );

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

  [feeSeatSelect, feeCharterSelect].forEach((sel) => {
    if (sel) {
      sel.addEventListener('change', () => {
        if (transcriptInput && transcriptInput.value.trim()) {
          parseCallTranscript(transcriptInput.value.trim());
        }
      });
    }
  });

  renderPoolingSlots();
  renderQueue();
  renderOrdersTable();
  renderFullFleetTable();
  renderCurrentOrder(false);
  startCountdown();

  // =====================================================================
  // 5. REAL-TIME POLLING OF "📍 HÃY ĐÓN TÔI" PICKUP REQUESTS FROM VPS API
  // =====================================================================
  const livePickupListEl = document.getElementById('live-pickup-list');
  const livePickupCounterEl = document.getElementById('live-pickup-counter');
  let knownServerOrderIds = new Set();
  let isFirstLoad = true;

  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch (e) {}
  };

  const fetchServerPickups = async () => {
    try {
      const resp = await fetch('/api/pickup-requests?t=' + Date.now(), { cache: 'no-store' });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data || !Array.isArray(data.orders)) return;

      const serverOrders = data.orders;
      let hasNewOrder = false;

      serverOrders.forEach((srvOrder) => {
        if (!knownServerOrderIds.has(srvOrder.id)) {
          knownServerOrderIds.add(srvOrder.id);
          if (!isFirstLoad) {
            hasNewOrder = true;
            addLog(
              `🚨 <strong>KHÁCH BẤM "📍 HÃY ĐÓN TÔI" (${srvOrder.code}):</strong> SĐT <strong>${srvOrder.phone}</strong> • ${srvOrder.service} • ${srvOrder.mapsUrl ? `<a href="${srvOrder.mapsUrl}" target="_blank" style="color:#fde047;text-decoration:underline;">Mở Bản Đồ GPS ↗</a>` : srvOrder.pickup}`
            );
          }
          // Sync into ordersHistory if not already present
          if (!ordersHistory.some((o) => o.code === srvOrder.code)) {
            ordersHistory.unshift({
              code: srvOrder.code,
              time: srvOrder.time,
              customerPhone: srvOrder.phone,
              phoneClean: srvOrder.phoneClean,
              route: srvOrder.route,
              service: srvOrder.service,
              mapsUrl: srvOrder.mapsUrl,
              fare: srvOrder.fare || 100000,
              fee: srvOrder.fee || 15000,
              driverId: srvOrder.driverId || 'XE-01',
              driverName: srvOrder.driverName || 'Anh Nghĩa (Xe Chủ Lực)',
              refunded: Boolean(srvOrder.refunded)
            });
          }
        }
      });

      if (hasNewOrder) {
        playAlertChime();
        renderOrdersTable();
      } else if (isFirstLoad && serverOrders.length > 0) {
        renderOrdersTable();
      }
      isFirstLoad = false;

      if (livePickupCounterEl) {
        livePickupCounterEl.textContent = `🟢 ${serverOrders.length} Yêu Cầu Đón Thực Tế`;
      }

      if (livePickupListEl && serverOrders.length > 0) {
        livePickupListEl.innerHTML = serverOrders
          .slice(0, 6)
          .map(
            (item) => `
            <div style="background:rgba(15,23,42,0.92);border:1.5px solid ${item.hasGps ? '#34d399' : '#fde047'};border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="color:#fde047;font-size:0.95rem;">${item.code} • 🕒 ${item.time}</strong>
                <span style="font-size:0.75rem;background:rgba(52,211,153,0.18);color:#34d399;padding:2px 8px;border-radius:999px;font-weight:700;">${item.device || 'Mobile'}</span>
              </div>
              <div style="font-size:1.1rem;font-weight:900;">
                <a href="tel:${item.phoneClean || item.phone}" style="color:#38bdf8;text-decoration:underline;">📞 Gọi Khách: ${item.phone}</a>
              </div>
              <div style="font-size:0.82rem;color:#cbd5e1;">
                <strong>Dịch vụ:</strong> ${item.service} (${formatVND(item.fare || 100000)})<br/>
                <strong>Đón:</strong> ${item.pickup}
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                ${
                  item.mapsUrl
                    ? `<a href="${item.mapsUrl}" target="_blank" rel="noopener" class="btn-topup" style="border-color:#34d399;color:#34d399;font-weight:800;">🗺️ Mở Bản Đồ Chỗ Khách Đứng ↗</a>`
                    : `<span style="font-size:0.76rem;color:#fde047;">🟡 Khách gửi SĐT (Chưa bật GPS)</span>`
                }
                <button type="button" class="btn-topup js-dispatch-pickup" data-code="${item.code}" style="border-color:#fde047;color:#fde047;font-weight:800;">
                  ⚡ Bắn Cuốc Cho Tài Xế
                </button>
              </div>
            </div>
          `
          )
          .join('');

        livePickupListEl.querySelectorAll('.js-dispatch-pickup').forEach((btn) => {
          btn.addEventListener('click', () => {
            const targetCode = btn.getAttribute('data-code');
            const found = serverOrders.find((x) => x.code === targetCode);
            if (!found) return;
            currentOrder = {
              code: found.code,
              customerPhoneMasked: found.phone,
              customerPhoneFull: found.phone,
              queue: found.pickup.toLowerCase().includes('bệnh viện') || found.pickup.toLowerCase().includes('sân bay') ? 'DN' : 'TB',
              directionText: found.route,
              pickup: found.mapsUrl ? `${found.pickup} (Có ghim GPS)` : found.pickup,
              dropoff: found.dropoff,
              serviceName: found.service,
              seatsNeeded: found.fare === 200000 ? 2 : 1,
              isCharter: found.fare >= 350000,
              totalFare: found.fare || 100000,
              commissionFee: found.fee || 15000,
              driverNet: (found.fare || 100000) - (found.fee || 15000),
              timeNote: 'Khách bấm 📍 HÃY ĐÓN TÔI'
            };
            renderCurrentOrder(true);
            startCountdown();
            addLog(`⚡ Admin vừa nạp yêu cầu <strong>${found.code} (SĐT: ${found.phone})</strong> vào bộ chia xe tự động!`);
          });
        });
      }
    } catch (e) {}
  };

  fetchServerPickups();
  setInterval(fetchServerPickups, 5000);
});
