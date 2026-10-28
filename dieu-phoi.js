document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 0. DUAL-PIN ROLE ACCESS CONTROL (4268 = CHỦ WEB | 1691 = ĐỐI TÁC NHÀ XE)
  // =========================================================================
  const gateOverlay = document.getElementById('admin-gate');
  const btnGateLogin = document.getElementById('btn-gate-login');
  const btnLock = document.getElementById('btn-lock-dashboard');
  const pinInput = document.getElementById('admin-pin-input');
  const gateErrorMsg = document.getElementById('gate-error-msg');

  const sbRoleBadge = document.getElementById('sb-role-badge');
  const sbRoleLabel = document.getElementById('sb-role-label');
  const sidebarRoleName = document.getElementById('sidebar-role-name');
  const headerRolePill = document.getElementById('header-role-pill');

  let currentPin = '';
  let currentRole = 'partner'; // 'owner' (4268) | 'partner' (1691)

  const ALL_16_PAGES = {
    '/': 'Trang Chủ Mega-Hub: Xe Ghép Thăng Bình & Các Xã ↔ Đà Nẵng',
    '/xe-di-benh-vien-da-nang.html': 'Chuyên Trang: Xe Đi Khám Bệnh Viện Đà Nẵng (04h45)',
    '/xe-dua-don-san-bay-da-nang.html': 'Chuyên Trang: Xe Đưa Đón Sân Bay Đà Nẵng & Chu Lai',
    '/xe-di-sat-hach-lai-xe-quang-nam-da-nang.html': 'Chuyên Trang: Xe Đi Sát Hạch Lái Xe Quảng Nam (Minh Sơn & QJC)',
    '/thue-xe-cuoi-hoi-thang-binh.html': 'Chuyên Trang: Thuê Xe Hoa Cưới Hỏi & Đoàn Rước Dâu',
    '/thue-xe-cuoi-hoi-du-lich-thang-binh.html': 'Chuyên Trang: Thuê Xe Du Lịch (VinWonders, Hội An, Bà Nà) & Đi Tỉnh',
    '/bang-gia-xe-ghep-thang-binh.html': 'Chuyên Trang: Bảng Giá Cước Niêm Yết Toàn Huyện 2026'
  };

  const applyRolePermissions = (role) => {
    currentRole = role;
    const isOwner = role === 'owner';

    document.querySelectorAll('.owner-only-el').forEach((el) => {
      el.style.display = isOwner ? '' : 'none';
    });

    const feeSeatSelect = document.getElementById('cfg-seat-fee');
    const feeCharterSelect = document.getElementById('cfg-charter-fee');
    if (feeSeatSelect) feeSeatSelect.disabled = !isOwner;
    if (feeCharterSelect) feeCharterSelect.disabled = !isOwner;

    if (isOwner) {
      if (sbRoleBadge) sbRoleBadge.innerHTML = 'ADMIN<br/>PRO';
      if (sbRoleLabel) sbRoleLabel.textContent = '🟢 Quản trị viên Hệ thống';
      if (sidebarRoleName) sidebarRoleName.textContent = '🛡️ Quản Trị Hệ Thống (Toàn Quyền)';
      if (headerRolePill) {
        headerRolePill.textContent = '🛡️ QUẢN TRỊ HỆ THỐNG';
        headerRolePill.classList.remove('partner');
      }
    } else {
      if (sbRoleBadge) sbRoleBadge.innerHTML = 'ĐIỀU PHỐI<br/>20 XE';
      if (sbRoleLabel) sbRoleLabel.textContent = '🚘 Điều phối viên Nhà xe';
      if (sidebarRoleName) sidebarRoleName.textContent = '🚘 Điều Phối Nhà Xe (Nhận Chuyến & Đối Soát)';
      if (headerRolePill) {
        headerRolePill.textContent = '🚘 ĐIỀU PHỐI NHÀ XE';
        headerRolePill.classList.add('partner');
      }
      // Ensure partner is not on an owner-only tab
      const activeTab = document.querySelector('.db-tab-view.active');
      if (activeTab && (activeTab.id === 'tab-seo-funnel' || activeTab.id === 'tab-settings')) {
        switchTab('tab-conversions');
      }
    }
  };

  const handleLoginSubmit = async () => {
    const rawPin = (pinInput?.value || '').trim();
    if (!rawPin) {
      if (gateErrorMsg) {
        gateErrorMsg.textContent = '❌ Vui lòng nhập Mã PIN được cấp!';
        gateErrorMsg.style.display = 'block';
      }
      return;
    }

    let verifiedRole = null;
    try {
      const resp = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: rawPin })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) {
          verifiedRole = data.role;
        }
      }
    } catch (e) {
      // Fallback for offline preview
    }

    if (!verifiedRole) {
      if (rawPin === '4268') verifiedRole = 'owner';
      else if (rawPin === '1691') verifiedRole = 'partner';
    }

    if (!verifiedRole) {
      if (gateErrorMsg) {
        gateErrorMsg.textContent = '❌ Mã PIN không chính xác! Vui lòng kiểm tra lại mã PIN đăng nhập.';
        gateErrorMsg.style.display = 'block';
      }
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
      return;
    }

    currentPin = rawPin;
    try {
      sessionStorage.setItem('nghia_dashboard_pin', rawPin);
    } catch (e) {}

    if (gateErrorMsg) gateErrorMsg.style.display = 'none';
    applyRolePermissions(verifiedRole);
    if (gateOverlay) gateOverlay.classList.add('hidden');
    fetchDashboardData();
  };

  if (btnGateLogin) {
    btnGateLogin.addEventListener('click', handleLoginSubmit);
  }
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLoginSubmit();
      }
    });
  }

  if (btnLock && gateOverlay) {
    btnLock.addEventListener('click', () => {
      try {
        sessionStorage.removeItem('nghia_dashboard_pin');
      } catch (e) {}
      if (pinInput) pinInput.value = '';
      gateOverlay.classList.remove('hidden');
      setTimeout(() => pinInput?.focus(), 100);
    });
  }

  // Restore session PIN if already logged in during current tab session
  try {
    const savedSessionPin = sessionStorage.getItem('nghia_dashboard_pin');
    if (savedSessionPin === '4268' || savedSessionPin === '1691') {
      currentPin = savedSessionPin;
      applyRolePermissions(savedSessionPin === '4268' ? 'owner' : 'partner');
      if (gateOverlay) gateOverlay.classList.add('hidden');
    }
  } catch (e) {}

  // Sidebar Tabs
  const navBtns = document.querySelectorAll('.sb-nav-btn');
  const tabViews = document.querySelectorAll('.db-tab-view');

  const switchTab = (targetTabId) => {
    navBtns.forEach((b) => b.classList.toggle('active', b.getAttribute('data-tab') === targetTabId));
    tabViews.forEach((view) => view.classList.toggle('active', view.id === targetTabId));
  };

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  // =========================================================================
  // 1. GLOBAL STATE & COMMISSION FORMULA (10.000đ/GHẾ • 10% BAO XE)
  // =========================================================================
  let systemConfig = {
    seatFee: 10000,
    charterPercent: 10,
    dedupMinutes: 30,
    telegramEnabled: false,
    telegramBotToken: '',
    telegramChatId: ''
  };

  let serverOrdersList = [];
  let serverPageStats = { pages: {}, daily: {} };
  let knownServerOrderIds = new Set();
  let isFirstLoad = true;

  const feeSeatSelect = document.getElementById('cfg-seat-fee');
  const feeCharterSelect = document.getElementById('cfg-charter-fee');

  const formatVND = (num) => {
    const n = parseInt(num || 0, 10);
    return n.toLocaleString('vi-VN') + 'đ';
  };

  const computeCommissionFee = (fare, seats, isCharter, serviceCode = '') => {
    const f = parseInt(fare || 100000, 10);
    const s = parseInt(seats || 1, 10);
    const seatUnit = parseInt(systemConfig.seatFee || 10000, 10);
    const charterPct = parseInt(systemConfig.charterPercent || 10, 10);

    if (serviceCode === 'gui-hang' || f <= 60000) {
      return Math.max(5000, Math.round((f * charterPct) / 100));
    }
    if (isCharter || s === 0 || f >= 350000 || String(serviceCode).includes('bao') || String(serviceCode).includes('thue')) {
      return Math.round((f * charterPct) / 100);
    }
    return s * seatUnit;
  };

  // =========================================================================
  // 2. CONVERSION TRACKING, FILTERING, LEDGER & SEO FUNNEL RENDERING
  // =========================================================================
  const kpiViewsTotalEl = document.getElementById('kpi-views-total');
  const kpiQuotesSubEl = document.getElementById('kpi-quotes-sub');
  const kpiUniqueLeadsEl = document.getElementById('kpi-unique-leads');
  const kpiLeadsBreakdownEl = document.getElementById('kpi-leads-breakdown');
  const kpiCrPercentEl = document.getElementById('kpi-cr-percent');
  const kpiCancelRateAlertEl = document.getElementById('kpi-cancel-rate-alert');
  const kpiCommissionEl = document.getElementById('kpi-commission');
  const kpiRevenueSubEl = document.getElementById('kpi-revenue-sub');

  const fraudWarningBanner = document.getElementById('fraud-warning-banner');
  const fraudWarningText = document.getElementById('fraud-warning-text');

  const filterDateRangeEl = document.getElementById('filter-date-range');
  const filterConvTypeEl = document.getElementById('filter-conv-type');
  const filterConvStatusEl = document.getElementById('filter-conv-status');

  const stTotalLeadsEl = document.getElementById('st-total-leads');
  const stValidLeadsEl = document.getElementById('st-valid-leads');
  const stCancelledLeadsEl = document.getElementById('st-cancelled-leads');
  const stGrossFareEl = document.getElementById('st-gross-fare');
  const stNetCommissionEl = document.getElementById('st-net-commission');

  const conversionsTableBody = document.getElementById('conversions-table-body');
  const seoFunnelTableBody = document.getElementById('seo-funnel-table-body');
  const trafficSourcesGrid = document.getElementById('traffic-sources-grid');

  const getVnDateStr = (d = new Date()) => {
    const vnTime = new Date(d.getTime() + 7 * 3600 * 1000);
    return vnTime.toISOString().slice(0, 10);
  };

  const getFilteredConversions = () => {
    const dateMode = filterDateRangeEl?.value || 'all';
    const typeMode = filterConvTypeEl?.value || 'all';
    const statusMode = filterConvStatusEl?.value || 'all';

    const now = new Date();
    const todayIso = getVnDateStr(now);
    const monthPrefix = todayIso.slice(0, 7);
    const sevenDaysAgoTs = Math.floor(now.getTime() / 1000) - 7 * 86400;

    return serverOrdersList.filter((item) => {
      // Date filter
      if (dateMode === 'today') {
        if (item.date && item.date !== todayIso) return false;
      } else if (dateMode === '7days') {
        if (item.timestamp && item.timestamp < sevenDaysAgoTs) return false;
      } else if (dateMode === 'month') {
        if (item.date && !String(item.date).startsWith(monthPrefix)) return false;
      }

      // Conversion channel filter
      const cType = item.convType || (item.phoneClean ? 'form_gps' : 'call_0896');
      if (typeMode !== 'all' && cType !== typeMode) {
        return false;
      }

      // Status filter
      const isCancelled = Boolean(item.refunded) || item.status === 'refunded' || item.status === 'cancelled';
      const isConfirmed = !isCancelled && item.status === 'confirmed';
      const isNew = !isCancelled && !isConfirmed;

      if (statusMode === 'active' && isCancelled) return false;
      if (statusMode === 'new' && !isNew) return false;
      if (statusMode === 'confirmed' && !isConfirmed) return false;
      if (statusMode === 'refunded' && !isCancelled) return false;

      return true;
    });
  };

  const renderConvTypeBadge = (item) => {
    const cType = item.convType || (item.phoneClean ? 'form_gps' : 'call_0896');
    const clicks = parseInt(item.clickCount || 1, 10);
    let badgeHtml = '';

    if (cType === 'form_gps') {
      badgeHtml = `<span class="conv-badge gps">📍 Gửi SĐT + Định vị GPS</span>`;
    } else if (cType === 'call_0386') {
      badgeHtml = `<span class="conv-badge call2">📞 Bấm Gọi 0386.400.800</span>`;
    } else if (cType === 'zalo_click') {
      badgeHtml = `<span class="conv-badge zalo">💬 Bấm Đặt Qua Zalo</span>`;
    } else {
      badgeHtml = `<span class="conv-badge call1">📞 Bấm Gọi 0896.211.296</span>`;
    }

    const dedupHtml =
      clicks > 1
        ? `<br/><span class="dedup-tag" title="${(item.actionHistory || []).join(' | ')}">🛡️ Khách bấm ${clicks} lần (Chỉ tính 1 cuốc)</span>`
        : `<br/><small style="color:#64748b;font-size:0.7rem;">${item.buttonLabel || 'Chuyển đổi trực tiếp'}</small>`;

    return badgeHtml + dedupHtml;
  };

  const renderConversionDashboard = () => {
    // 1. Compute global stats across all 16 pages
    const pagesObj = (serverPageStats && serverPageStats.pages) || {};
    let totalViews = 0;
    let totalQuotes = 0;
    let totalRawClicks = 0;

    Object.values(pagesObj).forEach((p) => {
      totalViews += parseInt(p.views || 0, 10);
      totalQuotes += parseInt(p.quotes || 0, 10);
      totalRawClicks += parseInt(p.rawClicks || 0, 10);
    });

    const totalUniqueLeads = serverOrdersList.length;
    if (totalViews < totalUniqueLeads) totalViews = totalUniqueLeads;
    if (totalRawClicks < totalUniqueLeads) totalRawClicks = totalUniqueLeads;

    let gpsCount = 0;
    let callCount = 0;
    let zaloCount = 0;
    let cancelledCount = 0;
    let activeCommissionTotal = 0;
    let activeRevenueTotal = 0;

    serverOrdersList.forEach((o) => {
      const cType = o.convType || (o.phoneClean ? 'form_gps' : 'call_0896');
      if (cType === 'form_gps') gpsCount += 1;
      else if (cType === 'zalo_click') zaloCount += 1;
      else callCount += 1;

      const isCancelled = Boolean(o.refunded) || o.status === 'refunded' || o.status === 'cancelled';
      const fareVal = parseInt(o.fare || 100000, 10);
      const feeVal = o.fee !== undefined ? parseInt(o.fee, 10) : computeCommissionFee(fareVal, o.seats || 1, o.isCharter, o.serviceCode);

      if (isCancelled) {
        cancelledCount += 1;
      } else {
        activeRevenueTotal += fareVal;
        activeCommissionTotal += feeVal;
      }
    });

    const crPct = totalViews > 0 ? ((totalUniqueLeads / totalViews) * 100).toFixed(1) : '0.0';
    const cancelRatePct = totalUniqueLeads > 0 ? Math.round((cancelledCount / totalUniqueLeads) * 100) : 0;

    if (kpiViewsTotalEl) kpiViewsTotalEl.textContent = `${totalViews.toLocaleString('vi-VN')} lượt xem`;
    if (kpiQuotesSubEl) kpiQuotesSubEl.textContent = `⚡ ${totalQuotes.toLocaleString('vi-VN')} tương tác giá • ${totalRawClicks} lượt bấm`;
    if (kpiUniqueLeadsEl) kpiUniqueLeadsEl.textContent = `${totalUniqueLeads} khách duy nhất`;
    if (kpiLeadsBreakdownEl) kpiLeadsBreakdownEl.textContent = `📍 ${gpsCount} GPS • 📞 ${callCount} Gọi • 💬 ${zaloCount} Zalo`;
    if (kpiCrPercentEl) kpiCrPercentEl.textContent = `${crPct}%`;

    if (kpiCancelRateAlertEl) {
      if (cancelRatePct > 25 && totalUniqueLeads >= 3) {
        kpiCancelRateAlertEl.style.color = '#f87171';
        kpiCancelRateAlertEl.textContent = `⚠️ Tỷ lệ hủy: ${cancelRatePct}% (${cancelledCount}/${totalUniqueLeads} đơn)`;
      } else {
        kpiCancelRateAlertEl.style.color = '#34d399';
        kpiCancelRateAlertEl.textContent = `🟢 Tỷ lệ hủy: ${cancelRatePct}% (${cancelledCount} đơn hủy)`;
      }
    }

    if (fraudWarningBanner) {
      if (cancelRatePct > 25 && totalUniqueLeads >= 3) {
        fraudWarningBanner.style.display = 'flex';
        if (fraudWarningText) {
          fraudWarningText.textContent = `Tỷ lệ báo hủy đang ở mức ${cancelRatePct}% (${cancelledCount}/${totalUniqueLeads} khách). Quản trị viên có thể đối chiếu thời gian khách bấm gọi chính xác tới từng giây với lịch sử cuộc gọi tổng đài 0896.211.296.`;
        }
      } else {
        fraudWarningBanner.style.display = 'none';
      }
    }

    if (kpiCommissionEl) kpiCommissionEl.textContent = formatVND(activeCommissionTotal);
    if (kpiRevenueSubEl) kpiRevenueSubEl.textContent = `💵 Doanh thu cuốc từ Web: ${formatVND(activeRevenueTotal)}`;

    // 2. Render Filtered Statement Summary Bar & Conversion Ledger Table
    const filtered = getFilteredConversions();
    let fltValid = 0;
    let fltCancelled = 0;
    let fltGross = 0;
    let fltCommission = 0;

    filtered.forEach((o) => {
      const isCancelled = Boolean(o.refunded) || o.status === 'refunded' || o.status === 'cancelled';
      const fareVal = parseInt(o.fare || 100000, 10);
      const feeVal = o.fee !== undefined ? parseInt(o.fee, 10) : computeCommissionFee(fareVal, o.seats || 1, o.isCharter, o.serviceCode);
      if (isCancelled) {
        fltCancelled += 1;
      } else {
        fltValid += 1;
        fltGross += fareVal;
        fltCommission += feeVal;
      }
    });

    if (stTotalLeadsEl) stTotalLeadsEl.textContent = `${filtered.length} khách`;
    if (stValidLeadsEl) stValidLeadsEl.textContent = `${fltValid} cuốc hợp lệ`;
    if (stCancelledLeadsEl) stCancelledLeadsEl.textContent = `${fltCancelled} cuốc hủy`;
    if (stGrossFareEl) stGrossFareEl.textContent = formatVND(fltGross);
    if (stNetCommissionEl) stNetCommissionEl.textContent = formatVND(fltCommission);

    if (conversionsTableBody) {
      if (filtered.length === 0) {
        conversionsTableBody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align:center;padding:28px;color:#94a3b8;">
              Chưa có lượt chuyển đổi nào khớp với bộ lọc hiện tại. Hãy thử bấm nút Gọi / Zalo / 📍 HÃY ĐÓN TÔI trên trang web để kiểm tra!
            </td>
          </tr>
        `;
      } else {
        conversionsTableBody.innerHTML = filtered
          .map((o) => {
            const isCancelled = Boolean(o.refunded) || o.status === 'refunded' || o.status === 'cancelled';
            const isConfirmed = !isCancelled && o.status === 'confirmed';
            const fareVal = parseInt(o.fare || 100000, 10);
            const feeVal = o.fee !== undefined ? parseInt(o.fee, 10) : computeCommissionFee(fareVal, o.seats || 1, o.isCharter, o.serviceCode);
            const pageSlug = o.pageSlug || '/';
            const pageTitle = o.pageTitle || ALL_16_PAGES[pageSlug] || pageSlug;

            let statusHtml = `<span class="status-pill pending">⏳ Mới / Chờ đối soát</span>`;
            if (isConfirmed) {
              statusHtml = `<span class="status-pill done">✅ Đã đón khách (Chốt)</span>`;
            } else if (isCancelled) {
              statusHtml = `<span class="status-pill refund">❌ Khách hủy (0đ)</span>`;
            }

            return `
              <tr style="${isCancelled ? 'opacity:0.65;' : ''}">
                <td>
                  <strong style="color:#fde047;font-size:0.9rem;">${o.code}</strong><br/>
                  <span style="color:#38bdf8;font-weight:800;font-size:0.8rem;">🕒 ${o.time || ''}</span>
                  <br/><small style="color:#64748b;font-size:0.7rem;">${o.date || ''}</small>
                </td>
                <td>
                  ${renderConvTypeBadge(o)}
                </td>
                <td>
                  ${
                    o.phoneClean
                      ? `<strong><a href="tel:${o.phoneClean}" style="color:#38bdf8;text-decoration:underline;font-size:0.92rem;">📞 ${o.phone}</a></strong>`
                      : `<strong style="color:#e2e8f0;font-size:0.82rem;">${o.phone || 'Khách bấm gọi Hotline'}</strong>`
                  }
                  <br/><small style="color:#94a3b8;font-size:0.72rem;">📱 ${o.device || 'Mobile'}</small>
                  ${
                    o.mapsUrl
                      ? `<br/><a href="${o.mapsUrl}" target="_blank" rel="noopener" style="color:#34d399;font-size:0.75rem;font-weight:800;text-decoration:underline;">🗺️ Mở Vị Trí GPS ↗</a>`
                      : ''
                  }
                </td>
                <td>
                  <a href="${pageSlug}" target="_blank" style="color:#38bdf8;font-weight:700;font-size:0.8rem;text-decoration:underline;">
                    ${pageTitle}
                  </a>
                  <br/><small style="color:#94a3b8;font-size:0.72rem;">🔍 ${o.source || 'Google Tìm Kiếm (SEO)'}</small>
                </td>
                <td>
                  <strong style="color:#fff;font-size:0.82rem;">${o.route || `${o.pickup} ➔ ${o.dropoff}`}</strong>
                  <br/><small style="color:#fde047;font-weight:700;">🚘 ${o.service || 'Đi ghép 1 người (100K)'}</small>
                  ${o.note ? `<br/><small style="color:#34d399;">📝 Ghi chú: ${o.note}</small>` : ''}
                </td>
                <td>
                  <strong style="color:#fff;font-size:0.92rem;">${formatVND(fareVal)}</strong>
                  <br/><small style="color:#94a3b8;font-size:0.7rem;">${o.isCharter || fareVal >= 350000 ? 'Bao xe (10%)' : `${o.seats || 1} ghế (10K/ghế)`}</small>
                </td>
                <td>
                  <strong style="color:${isCancelled ? '#f87171' : '#34d399'};font-size:0.98rem;">
                    ${isCancelled ? '0đ (Miễn phí)' : formatVND(feeVal)}
                  </strong>
                </td>
                <td>
                  ${statusHtml}
                  ${o.cancelReason ? `<br/><small style="color:#fca5a5;font-size:0.7rem;">Lý do: ${o.cancelReason}</small>` : ''}
                  ${o.updatedBy ? `<br/><small style="color:#64748b;font-size:0.68rem;">Bởi: ${o.updatedBy}</small>` : ''}
                </td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:5px;max-width:190px;">
                    ${
                      !isConfirmed
                        ? `<button type="button" class="btn-topup js-conv-confirm" data-id="${o.id || o.code}" style="border-color:#10b981;color:#34d399;">✅ Chốt Đón</button>`
                        : ''
                    }
                    <button type="button" class="btn-topup js-conv-edit" data-id="${o.id || o.code}" style="border-color:#fde047;color:#fde047;">✏️ Sửa Cước</button>
                    ${
                      !isCancelled
                        ? `<button type="button" class="btn-topup js-conv-cancel" data-id="${o.id || o.code}" style="border-color:#ef4444;color:#f87171;">❌ Báo Hủy</button>`
                        : ''
                    }
                    <button type="button" class="btn-topup js-conv-dispatch" data-id="${o.id || o.code}" style="border-color:#38bdf8;color:#38bdf8;">⚡ Bắn Xe</button>
                    ${
                      currentRole === 'owner'
                        ? `<button type="button" class="btn-topup js-conv-delete" data-id="${o.id || o.code}" style="border-color:#64748b;color:#94a3b8;">🗑️ Xóa</button>`
                        : ''
                    }
                  </div>
                </td>
              </tr>
            `;
          })
          .join('');

        bindLedgerActions();
      }
    }

    // 3. Render 16-Page SEO Funnel Table (Tab 2 - Owner 4268)
    renderSeoFunnelTable();
  };

  const renderSeoFunnelTable = () => {
    if (!seoFunnelTableBody) return;
    const pagesStats = (serverPageStats && serverPageStats.pages) || {};

    // Aggregate actual orders per pageSlug
    const ordersByPage = {};
    const sourcesCount = {};

    serverOrdersList.forEach((o) => {
      const slug = o.pageSlug || '/';
      if (!ordersByPage[slug]) {
        ordersByPage[slug] = { unique: 0, call: 0, zalo: 0, gps: 0, commission: 0 };
      }
      ordersByPage[slug].unique += 1;
      const cType = o.convType || (o.phoneClean ? 'form_gps' : 'call_0896');
      if (cType === 'form_gps') ordersByPage[slug].gps += 1;
      else if (cType === 'zalo_click') ordersByPage[slug].zalo += 1;
      else ordersByPage[slug].call += 1;

      const isCancelled = Boolean(o.refunded) || o.status === 'refunded' || o.status === 'cancelled';
      if (!isCancelled) {
        ordersByPage[slug].commission += parseInt(o.fee || 10000, 10);
      }

      const src = o.source || 'Google Tìm Kiếm (SEO)';
      sourcesCount[src] = (sourcesCount[src] || 0) + 1;
    });

    const rows = Object.entries(ALL_16_PAGES).map(([slug, title]) => {
      const st = pagesStats[slug] || {};
      const ord = ordersByPage[slug] || { unique: 0, call: 0, zalo: 0, gps: 0, commission: 0 };
      const uniqueLeads = Math.max(parseInt(st.uniqueLeads || 0, 10), ord.unique);
      const rawClicks = Math.max(parseInt(st.rawClicks || 0, 10), uniqueLeads);
      const views = Math.max(parseInt(st.views || 0, 10), uniqueLeads);
      const quotes = parseInt(st.quotes || 0, 10);
      const cr = views > 0 ? ((uniqueLeads / views) * 100).toFixed(1) : '0.0';

      return {
        slug,
        title,
        views,
        quotes,
        rawClicks,
        uniqueLeads,
        call: Math.max(parseInt(st.callClicks || 0, 10), ord.call),
        zalo: Math.max(parseInt(st.zaloClicks || 0, 10), ord.zalo),
        gps: Math.max(parseInt(st.gpsForms || 0, 10), ord.gps),
        cr: parseFloat(cr),
        commission: ord.commission
      };
    });

    // Sort by Unique Leads desc, then Views desc
    rows.sort((a, b) => b.uniqueLeads - a.uniqueLeads || b.views - a.views);

    seoFunnelTableBody.innerHTML = rows
      .map(
        (r, idx) => `
        <tr>
          <td><strong style="color:#94a3b8;">#${idx + 1}</strong></td>
          <td>
            <a href="${r.slug}" target="_blank" style="color:#38bdf8;font-weight:800;text-decoration:underline;">${r.title}</a>
            <br/><small style="color:#64748b;">${r.slug}</small>
          </td>
          <td><strong>${r.views.toLocaleString('vi-VN')}</strong></td>
          <td>${r.quotes.toLocaleString('vi-VN')}</td>
          <td>${r.rawClicks.toLocaleString('vi-VN')}</td>
          <td><strong style="color:#fde047;font-size:0.95rem;">${r.uniqueLeads} khách</strong></td>
          <td>
            <span style="font-size:0.76rem;color:#cbd5e1;">
              📞 ${r.call} Gọi • 💬 ${r.zalo} Zalo • 📍 ${r.gps} GPS
            </span>
          </td>
          <td><strong style="color:#34d399;">${r.cr.toFixed(1)}%</strong></td>
          <td><strong style="color:#fde047;">${formatVND(r.commission)}</strong></td>
        </tr>
      `
      )
      .join('');

    if (trafficSourcesGrid) {
      const defaultSources = {
        'Google Tìm Kiếm (SEO)': sourcesCount['Google Tìm Kiếm (SEO)'] || 0,
        'AI Search (ChatGPT / Gemini)': sourcesCount['AI Search (ChatGPT / Gemini)'] || 0,
        Zalo: sourcesCount['Zalo'] || 0,
        'Google Maps': sourcesCount['Google Maps'] || 0,
        'Trực tiếp / Lưu trang': sourcesCount['Trực tiếp / Lưu trang'] || 0
      };
      trafficSourcesGrid.innerHTML = Object.entries(defaultSources)
        .map(
          ([srcName, count]) => `
          <div class="source-stat-card">
            <span>${srcName}</span>
            <strong>${count} khách chuyển đổi</strong>
          </div>
        `
        )
        .join('');
    }
  };

  // =========================================================================
  // 3. LEDGER ACTIONS (CONFIRM, EDIT FARE/SEATS, CANCEL, DELETE, DISPATCH)
  // =========================================================================
  const editModal = document.getElementById('edit-order-modal');
  const editModalCode = document.getElementById('edit-modal-code');
  const editModalFareInput = document.getElementById('edit-modal-fare-input');
  const editModalSeatsInput = document.getElementById('edit-modal-seats-input');
  const btnSaveEditOrder = document.getElementById('btn-save-edit-order');
  const btnCloseEditOrder = document.getElementById('btn-close-edit-order');
  let editingOrderId = null;

  const updateOrderOnServer = async (payload) => {
    try {
      const resp = await fetch('/api/conversion-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': currentPin
        },
        body: JSON.stringify({ ...payload, pin: currentPin })
      });
      if (resp.ok) {
        await fetchDashboardData();
      }
    } catch (e) {}
  };

  const bindLedgerActions = () => {
    if (!conversionsTableBody) return;

    conversionsTableBody.querySelectorAll('.js-conv-confirm').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        updateOrderOnServer({ id, status: 'confirmed' });
        addLog(`✅ Đã xác nhận đón khách thành công cho mã chuyển đổi <strong>${id}</strong>.`);
      });
    });

    conversionsTableBody.querySelectorAll('.js-conv-cancel').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const reason = prompt('Vui lòng nhập lý do khách hủy / thay đổi lịch trình (Ghi nhận vào nhật ký đối soát):', 'Khách báo hoãn lịch / Đổi giờ đi');
        if (reason === null) return;
        updateOrderOnServer({
          id,
          status: 'refunded',
          cancelReason: reason.trim() || 'Khách báo hủy'
        });
        addLog(`❌ Đã ghi nhận báo hủy đơn <strong>${id}</strong> (Lý do: ${reason}).`);
      });
    });

    conversionsTableBody.querySelectorAll('.js-conv-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (currentRole !== 'owner') return;
        const id = btn.getAttribute('data-id');
        if (!confirm(`Xác nhận xóa vĩnh viễn bản ghi chuyển đổi ${id} khỏi hệ thống?`)) return;
        updateOrderOnServer({ id, action: 'delete' });
      });
    });

    conversionsTableBody.querySelectorAll('.js-conv-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const found = serverOrdersList.find((x) => x.id === id || x.code === id);
        if (!found) return;
        editingOrderId = id;
        if (editModalCode) editModalCode.textContent = found.code;
        if (editModalFareInput) editModalFareInput.value = found.fare || 100000;
        if (editModalSeatsInput) editModalSeatsInput.value = found.isCharter ? 0 : found.seats || 1;
        if (editModal) editModal.classList.remove('hidden');
      });
    });

    conversionsTableBody.querySelectorAll('.js-conv-dispatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const found = serverOrdersList.find((x) => x.id === id || x.code === id);
        if (!found) return;
        loadOrderIntoAiDispatcher(found);
        switchTab('tab-dispatch');
      });
    });
  };

  document.querySelectorAll('.btn-quick-fare').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = parseInt(btn.getAttribute('data-fare') || '100000', 10);
      const s = parseInt(btn.getAttribute('data-seats') || '1', 10);
      const isC = btn.getAttribute('data-charter') === '1';
      if (editModalFareInput) editModalFareInput.value = f;
      if (editModalSeatsInput) editModalSeatsInput.value = isC ? 0 : s;
    });
  });

  if (btnSaveEditOrder) {
    btnSaveEditOrder.addEventListener('click', () => {
      if (!editingOrderId) return;
      const newFare = parseInt(editModalFareInput?.value || '100000', 10);
      const newSeats = parseInt(editModalSeatsInput?.value || '1', 10);
      updateOrderOnServer({
        id: editingOrderId,
        status: 'confirmed',
        fare: newFare,
        seats: newSeats
      });
      if (editModal) editModal.classList.add('hidden');
      addLog(`✏️ Đã cập nhật cước thực tế đơn <strong>${editingOrderId}</strong>: Doanh thu <strong>${formatVND(newFare)}</strong>.`);
    });
  }

  if (btnCloseEditOrder && editModal) {
    btnCloseEditOrder.addEventListener('click', () => editModal.classList.add('hidden'));
  }

  [filterDateRangeEl, filterConvTypeEl, filterConvStatusEl].forEach((el) => {
    if (el) el.addEventListener('change', renderConversionDashboard);
  });

  const btnRefreshConversions = document.getElementById('btn-refresh-conversions');
  if (btnRefreshConversions) {
    btnRefreshConversions.addEventListener('click', () => fetchDashboardData());
  }

  // Export CSV Statement
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const filtered = getFilteredConversions();
      if (filtered.length === 0) {
        alert('Không có dữ liệu chuyển đổi nào trong bộ lọc hiện tại để xuất file!');
        return;
      }

      const headers = [
        'Mã Đơn',
        'Giờ Chính Xác',
        'Ngày',
        'Kênh Chuyển Đổi',
        'Số Lần Bấm',
        'Khách Hàng / SĐT',
        'Trang Đích SEO',
        'Nguồn Truy Cập',
        'Lộ Trình Đón Trả',
        'Dịch Vụ',
        'Doanh Thu Cuốc (VND)',
        'Phí Dịch Vụ / Hoa Hồng (VND)',
        'Trạng Thái Đối Soát',
        'Lý Do Hủy / Ghi Chú'
      ];

      let totalGross = 0;
      let totalFee = 0;

      const csvRows = [headers.join(',')];
      filtered.forEach((o) => {
        const isCancelled = Boolean(o.refunded) || o.status === 'refunded' || o.status === 'cancelled';
        const fareVal = parseInt(o.fare || 100000, 10);
        const feeVal = isCancelled ? 0 : parseInt(o.fee || 10000, 10);
        if (!isCancelled) {
          totalGross += fareVal;
          totalFee += feeVal;
        }
        const row = [
          o.code,
          o.time || '',
          o.date || '',
          o.convType || 'call_0896',
          o.clickCount || 1,
          `"${(o.phone || '').replace(/"/g, '""')}"`,
          `"${(o.pageTitle || o.pageSlug || '/').replace(/"/g, '""')}"`,
          `"${(o.source || '').replace(/"/g, '""')}"`,
          `"${(o.route || '').replace(/"/g, '""')}"`,
          `"${(o.service || '').replace(/"/g, '""')}"`,
          fareVal,
          feeVal,
          isCancelled ? 'Khách hủy (0đ)' : o.status === 'confirmed' ? 'Đã đón khách' : 'Hợp lệ / Chờ xác nhận',
          `"${(o.cancelReason || o.note || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      csvRows.push(
        ['TỔNG CỘNG ĐỐI SOÁT', '', '', '', '', '', '', '', '', '', totalGross, totalFee, '', ''].join(',')
      );

      const csvContent = '\uFEFF' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bang-Doi-Soat-Chuyen-Doi-XeGhepThangBinh-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  const btnPrintStatement = document.getElementById('btn-print-statement');
  if (btnPrintStatement) {
    btnPrintStatement.addEventListener('click', () => {
      window.print();
    });
  }

  // Owner 4268 Reset All Data to 0 Button
  const btnResetAllData = document.getElementById('btn-reset-all-data');
  if (btnResetAllData) {
    btnResetAllData.addEventListener('click', async () => {
      if (currentRole !== 'owner') {
        alert('Chỉ Quản trị viên hệ thống mới có quyền đặt lại số liệu đối soát!');
        return;
      }
      if (
        !confirm(
          '🧹 XÁC NHẬN RESET SỐ LIỆU VỀ 0:\nToàn bộ lịch sử chuyển đổi test và bộ đếm lượt xem/hoa hồng sẽ được đặt lại về 0 để bắt đầu kỳ đối soát mới.\nAnh chắc chắn muốn Reset chứ?'
        )
      ) {
        return;
      }
      try {
        localStorage.removeItem('nghia_halam_web_orders');
      } catch (e) {}
      try {
        const resp = await fetch('/api/reset-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Pin': currentPin
          },
          body: JSON.stringify({ pin: currentPin, notifyTelegram: true })
        });
        if (resp.ok) {
          knownServerOrderIds.clear();
          serverOrdersList = [];
          serverPageStats = { pages: {}, daily: {} };
          renderConversionDashboard();
          await fetchDashboardData();
          addLog('🧹 <strong>Quản trị hệ thống</strong> vừa đặt lại toàn bộ số liệu chuyển đổi & đối soát về <strong>0</strong>.');
          alert('✅ Đã Reset toàn bộ số liệu về 0 thành công! Hệ thống sẵn sàng ghi nhận dữ liệu chuẩn từ bây giờ.');
        }
      } catch (e) {}
    });
  }

  // =========================================================================
  // 4. OWNER CONFIGURATION & TELEGRAM BOT SETUP (PIN 4268)
  // =========================================================================
  const inputCfgSeatFee = document.getElementById('input-cfg-seat-fee');
  const inputCfgCharterPct = document.getElementById('input-cfg-charter-pct');
  const inputCfgDedupMins = document.getElementById('input-cfg-dedup-mins');
  const inputCfgTgEnabled = document.getElementById('input-cfg-tg-enabled');
  const inputCfgTgToken = document.getElementById('input-cfg-tg-token');
  const inputCfgTgChatId = document.getElementById('input-cfg-tg-chatid');
  const btnSaveSystemConfig = document.getElementById('btn-save-system-config');
  const btnTestTelegram = document.getElementById('btn-test-telegram');
  const settingsSaveFeedback = document.getElementById('settings-save-feedback');

  const syncConfigInputs = (cfg) => {
    if (!cfg) return;
    systemConfig = { ...systemConfig, ...cfg };
    if (feeSeatSelect) feeSeatSelect.value = String(systemConfig.seatFee || 10000);
    if (feeCharterSelect) feeCharterSelect.value = String(systemConfig.charterPercent || 10);
    if (inputCfgSeatFee) inputCfgSeatFee.value = systemConfig.seatFee || 10000;
    if (inputCfgCharterPct) inputCfgCharterPct.value = systemConfig.charterPercent || 10;
    if (inputCfgDedupMins) inputCfgDedupMins.value = systemConfig.dedupMinutes || 30;
    if (inputCfgTgEnabled) inputCfgTgEnabled.checked = Boolean(systemConfig.telegramEnabled);
    if (currentRole === 'owner') {
      if (inputCfgTgToken && cfg.telegramBotToken !== undefined) inputCfgTgToken.value = cfg.telegramBotToken;
      if (inputCfgTgChatId && cfg.telegramChatId !== undefined) inputCfgTgChatId.value = cfg.telegramChatId;
    }
  };

  const saveOwnerConfig = async (testTelegram = false) => {
    if (currentRole !== 'owner') {
      alert('Chỉ Quản trị viên hệ thống mới có quyền thay đổi cấu hình định mức & Telegram!');
      return;
    }
    if (testTelegram && inputCfgTgEnabled) {
      inputCfgTgEnabled.checked = true;
    }
    const payload = {
      pin: currentPin,
      seatFee: parseInt(inputCfgSeatFee?.value || '10000', 10),
      charterPercent: parseInt(inputCfgCharterPct?.value || '10', 10),
      dedupMinutes: parseInt(inputCfgDedupMins?.value || '30', 10),
      telegramEnabled: Boolean(inputCfgTgEnabled?.checked),
      telegramBotToken: (inputCfgTgToken?.value || '').trim(),
      telegramChatId: (inputCfgTgChatId?.value || '').trim(),
      testTelegram
    };

    try {
      const resp = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Pin': currentPin
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.config) syncConfigInputs(data.config);
        if (settingsSaveFeedback) {
          settingsSaveFeedback.style.display = 'block';
          if (testTelegram) {
            if (data.telegramSent) {
              settingsSaveFeedback.style.color = '#34d399';
              settingsSaveFeedback.textContent = `🚀 Đã bắn tin nhắn Test vào nhóm Telegram (Chat ID: ${data.telegramInfo}) thành công! Anh kiểm tra điện thoại ngay nhé.`;
            } else {
              settingsSaveFeedback.style.color = '#f87171';
              settingsSaveFeedback.textContent = `❌ Chưa gửi được Telegram (${data.telegramInfo || 'Kiểm tra lại Token/Chat ID'}).`;
            }
          } else {
            settingsSaveFeedback.style.color = '#34d399';
            settingsSaveFeedback.textContent = '✅ Đã lưu cấu hình định mức đối soát (10K/ghế • 10%) & Telegram thành công!';
          }
        }
        fetchDashboardData();
      }
    } catch (e) {}
  };

  if (btnSaveSystemConfig) {
    btnSaveSystemConfig.addEventListener('click', () => saveOwnerConfig(false));
  }
  if (btnTestTelegram) {
    btnTestTelegram.addEventListener('click', () => saveOwnerConfig(true));
  }

  // Header quick dropdowns for Owner
  [feeSeatSelect, feeCharterSelect].forEach((sel) => {
    if (sel) {
      sel.addEventListener('change', () => {
        if (currentRole !== 'owner') return;
        if (inputCfgSeatFee && feeSeatSelect) inputCfgSeatFee.value = feeSeatSelect.value;
        if (inputCfgCharterPct && feeCharterSelect) inputCfgCharterPct.value = feeCharterSelect.value;
        saveOwnerConfig(false);
      });
    }
  });

  // =========================================================================
  // 5. 20-VEHICLE FLEET & AI DISPATCH WORKSPACE (TAB 3 & TAB 4)
  // =========================================================================
  const fleet = [
    { id: 'XE-01', name: 'Anh Nghĩa (Xe Chủ Lực)', phone: '0896.211.296', type: 'VinFast Limo Green 7C', queue: 'TB', loc: '469 Huỳnh Thúc Kháng, Hà Lam', seats: 0, maxSeats: 6, wallet: 850000, trips: 0 },
    { id: 'XE-02', name: 'Anh Tuấn Hà Lam', phone: '0905.214.112', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Cây Cốc, Hà Lam', seats: 0, maxSeats: 6, wallet: 520000, trips: 0 },
    { id: 'XE-03', name: 'Anh Hùng Bình Quý', phone: '0935.618.220', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Ngã 3 Bình Quý', seats: 0, maxSeats: 6, wallet: 480000, trips: 0 },
    { id: 'XE-04', name: 'Anh Dũng Cầu Ông Triệu', phone: '0905.771.309', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Cầu Ông Triệu, Bình Định', seats: 0, maxSeats: 6, wallet: 410000, trips: 0 },
    { id: 'XE-05', name: 'Anh Khoa Hà Châu', phone: '0983.412.885', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Chợ Hà Châu, Bình Phú', seats: 0, maxSeats: 6, wallet: 600000, trips: 0 },
    { id: 'XE-06', name: 'Anh Minh Quý Mỹ', phone: '0914.552.190', type: 'Toyota Veloz Cross 7C', queue: 'TB', loc: 'Thôn Quý Mỹ, Bình Quý', seats: 0, maxSeats: 6, wallet: 350000, trips: 0 },
    { id: 'XE-07', name: 'Anh Tâm Bình Nguyên', phone: '0905.918.441', type: 'Hyundai Accent 4C', queue: 'TB', loc: 'Xã Bình Nguyên', seats: 0, maxSeats: 4, wallet: 390000, trips: 0 },
    { id: 'XE-08', name: 'Anh Hoàng Bình Phục', phone: '0935.109.774', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'QL1A Xã Bình Phục', seats: 0, maxSeats: 6, wallet: 470000, trips: 0 },
    { id: 'XE-09', name: 'Anh Sơn Bình Chánh', phone: '0905.334.612', type: 'Toyota Vios 4C', queue: 'TB', loc: 'Xã Bình Chánh', seats: 0, maxSeats: 4, wallet: 310000, trips: 0 },
    { id: 'XE-10', name: 'Anh Phúc Bình Minh', phone: '0977.812.550', type: 'VinFast Limo Green 7C', queue: 'TB', loc: 'Gần VinWonders Nam Hội An', seats: 0, maxSeats: 6, wallet: 540000, trips: 0 },
    { id: 'XE-11', name: 'Anh Long Hà Lam', phone: '0905.663.901', type: 'Mitsubishi Xpander 7C', queue: 'TB', loc: 'Chợ Hà Lam, Thăng Bình', seats: 0, maxSeats: 6, wallet: 430000, trips: 0 },

    { id: 'XE-12', name: 'Anh Hải (Trực BV Đa Khoa)', phone: '0905.882.119', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Cổng BV Đa Khoa Đà Nẵng', seats: 0, maxSeats: 6, wallet: 590000, trips: 0 },
    { id: 'XE-13', name: 'Anh Bảo (Trực Sân Bay)', phone: '0935.441.208', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Sân bay Quốc tế Đà Nẵng', seats: 0, maxSeats: 6, wallet: 640000, trips: 0 },
    { id: 'XE-14', name: 'Anh Thành (Trực BV 600G)', phone: '0905.129.884', type: 'Toyota Innova 7C', queue: 'DN', loc: 'BV Phụ Sản - Nhi 600 Giường', seats: 0, maxSeats: 6, wallet: 420000, trips: 0 },
    { id: 'XE-15', name: 'Anh Đạt (Trực BV Ung Bướu)', phone: '0914.773.210', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'BV Ung Bướu Đà Nẵng', seats: 0, maxSeats: 6, wallet: 510000, trips: 0 },
    { id: 'XE-16', name: 'Anh Vũ Hải Châu', phone: '0905.501.337', type: 'Honda City 4C', queue: 'DN', loc: 'Quận Hải Châu, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 360000, trips: 0 },
    { id: 'XE-17', name: 'Anh Khánh Thanh Khê', phone: '0935.990.142', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Ga Đà Nẵng / Thanh Khê', seats: 0, maxSeats: 6, wallet: 490000, trips: 0 },
    { id: 'XE-18', name: 'Anh Tùng Cẩm Lệ', phone: '0905.712.665', type: 'Mitsubishi Xpander 7C', queue: 'DN', loc: 'Ngã tư Cẩm Lệ, Đà Nẵng', seats: 0, maxSeats: 6, wallet: 380000, trips: 0 },
    { id: 'XE-19', name: 'Anh Nam Sơn Trà', phone: '0989.314.778', type: 'VinFast Limo Green 7C', queue: 'DN', loc: 'Chùa Linh Ứng / Sơn Trà', seats: 0, maxSeats: 6, wallet: 550000, trips: 0 },
    { id: 'XE-20', name: 'Anh Việt Ngũ Hành Sơn', phone: '0905.238.991', type: 'Mazda 3 4C', queue: 'DN', loc: 'Ngũ Hành Sơn, Đà Nẵng', seats: 0, maxSeats: 4, wallet: 330000, trips: 0 }
  ];

  let activeQueueTab = 'TB';
  let countdownValue = 45;
  let countdownTimer = null;

  let currentOrder = {
    code: '#TB-001',
    customerPhoneMasked: 'Chờ khách gọi...',
    customerPhoneFull: 'Chờ khách gọi...',
    queue: 'TB',
    directionText: 'Thăng Bình ➔ Đà Nẵng',
    pickup: 'Thị trấn Hà Lam, Thăng Bình',
    dropoff: 'Trung tâm TP. Đà Nẵng',
    serviceName: 'Đi ghép 1 người (100K/người)',
    seatsNeeded: 1,
    isCharter: false,
    totalFare: 100000,
    commissionFee: 10000,
    driverNet: 90000
  };

  const pooledSeats = [
    { label: 'Ghế 1: Đang trống (100K)', occupied: false },
    { label: 'Ghế 2: Đang trống (100K)', occupied: false },
    { label: 'Ghế 3: Đang trống (100K)', occupied: false },
    { label: 'Ghế 4: Đang trống (100K)', occupied: false },
    { label: 'Ghế 5: Đang trống (100K)', occupied: false },
    { label: 'Ghế 6: Đang trống (100K)', occupied: false }
  ];

  const transcriptInput = document.getElementById('call-transcript-input');
  const btnAiExtract = document.getElementById('btn-ai-extract');
  const btnMic = document.getElementById('btn-voice-mic');
  const queueListEl = document.getElementById('driver-queue-list');
  const seatSlotsEl = document.getElementById('pooling-seat-slots');
  const logBoxEl = document.getElementById('dispatch-activity-log');
  const fleetFullTableBody = document.getElementById('fleet-full-table-body');

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
          addLog(`💳 Vừa nạp <strong>+200.000đ</strong> vào Ví cọc của <strong>${car.id} (${car.name})</strong>.`);
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
          addLog(`⇄ Đã chuyển đầu bến của <strong>${car.id} (${car.name})</strong> sang <strong>${car.queue === 'TB' ? 'Bến Thăng Bình' : 'Bến Đà Nẵng'}</strong>.`);
        }
      });
    });
  };

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
          addLog(`💳 Tài xế <strong>${targetCar.name} (${targetCar.id})</strong> vừa nạp thêm <strong>+200.000đ</strong> vào Ví Điều Phối.`);
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

  const loadOrderIntoAiDispatcher = (srvOrder) => {
    const fareVal = parseInt(srvOrder.fare || 100000, 10);
    const feeVal = srvOrder.fee !== undefined ? parseInt(srvOrder.fee, 10) : computeCommissionFee(fareVal, srvOrder.seats || 1, srvOrder.isCharter, srvOrder.serviceCode);
    currentOrder = {
      code: srvOrder.code,
      customerPhoneMasked: srvOrder.phone,
      customerPhoneFull: srvOrder.phone,
      queue: (srvOrder.pickup || '').toLowerCase().includes('đà nẵng') ? 'DN' : 'TB',
      directionText: srvOrder.route || `${srvOrder.pickup} ➔ ${srvOrder.dropoff}`,
      pickup: srvOrder.mapsUrl ? `${srvOrder.pickup} (Có ghim GPS)` : srvOrder.pickup,
      dropoff: srvOrder.dropoff,
      serviceName: srvOrder.service,
      seatsNeeded: srvOrder.seats || (fareVal === 200000 ? 2 : 1),
      isCharter: Boolean(srvOrder.isCharter || fareVal >= 350000),
      totalFare: fareVal,
      commissionFee: feeVal,
      driverNet: fareVal - feeVal
    };
    renderCurrentOrder(true);
    startCountdown();
    addLog(`⚡ Đã nạp cuốc chuyển đổi <strong>${srvOrder.code} (${srvOrder.phone})</strong> vào bộ chia xe 20 đầu xe!`);
  };

  const parseCallTranscript = (rawText) => {
    const text = rawText.toLowerCase();
    const seatFeeUnit = parseInt(systemConfig.seatFee || 10000, 10);
    const charterFeePct = parseInt(systemConfig.charterPercent || 10, 10);

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
      commissionFee = 5000;
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
      driverNet: totalFare - commissionFee
    };

    activeQueueTab = queue;
    document.querySelectorAll('.q-tab').forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-q') === activeQueueTab);
    });

    renderQueue();
    renderCurrentOrder(false);
    startCountdown();

    const topCar = fleet.find((c) => c.queue === currentOrder.queue);
    addLog(
      `🤖 <strong>AI Voicebot</strong> vừa bóc tách cuộc gọi <strong>${currentOrder.code}</strong> (${currentOrder.serviceName} - <strong>${formatVND(currentOrder.totalFare)}</strong> • Hoa hồng <strong>${formatVND(currentOrder.commissionFee)}</strong>) ➔ Bắn cho <strong>${topCar.id} (${topCar.name})</strong>.`
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

      if (currentOrder.isCharter) {
        topCar.seats = topCar.maxSeats;
      } else {
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

      renderCurrentOrder(true);
      renderFullFleetTable();

      addLog(
        `✅ <strong>${topCar.id} (${topCar.name})</strong> đã NHẬN CUỐC <strong>${currentOrder.code}</strong>! Trừ <strong>-${formatVND(currentOrder.commissionFee)}</strong> phí hoa hồng (10K/ghế • 10%).`
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

  renderPoolingSlots();
  renderQueue();
  renderFullFleetTable();
  renderCurrentOrder(false);
  startCountdown();

  // =========================================================================
  // 6. REAL-TIME POLLING FROM VPS CONVERSION & REVENUE-SHARE API (EVERY 5S)
  // =========================================================================
  const livePickupListEl = document.getElementById('live-pickup-list');
  const livePickupCounterEl = document.getElementById('live-pickup-counter');

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

  const fetchDashboardData = async () => {
    try {
      const resp = await fetch(`/api/dashboard-summary?pin=${encodeURIComponent(currentPin)}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'X-Admin-Pin': currentPin }
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data || !data.ok) return;

      if (data.config) {
        syncConfigInputs(data.config);
      }
      if (data.stats) {
        serverPageStats = data.stats;
      }

      const incomingOrders = Array.isArray(data.orders) ? data.orders : [];
      let hasNewConversion = false;

      incomingOrders.forEach((srvOrder) => {
        const oid = srvOrder.id || srvOrder.code;
        if (!knownServerOrderIds.has(oid)) {
          knownServerOrderIds.add(oid);
          if (!isFirstLoad) {
            hasNewConversion = true;
            addLog(
              `🚨 <strong>CHUYỂN ĐỔI MỚI (${srvOrder.code}):</strong> ${srvOrder.phone} • ${srvOrder.service} (${formatVND(srvOrder.fare || 100000)} ➔ Hoa hồng <strong>${formatVND(srvOrder.fee || 10000)}</strong>) từ trang <em>${srvOrder.pageSlug || '/'}</em>`
            );
          }
        }
      });

      serverOrdersList = incomingOrders;
      isFirstLoad = false;

      if (hasNewConversion) {
        playAlertChime();
      }

      renderConversionDashboard();

      if (livePickupCounterEl) {
        livePickupCounterEl.textContent = `🟢 ${serverOrdersList.length} Chuyển Đổi Thực Tế`;
      }

      if (livePickupListEl && serverOrdersList.length > 0) {
        livePickupListEl.innerHTML = serverOrdersList
          .slice(0, 6)
          .map(
            (item) => `
            <div style="background:rgba(15,23,42,0.92);border:1.5px solid ${item.hasGps ? '#34d399' : '#fde047'};border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="color:#fde047;font-size:0.92rem;">${item.code} • 🕒 ${item.time}</strong>
                <span style="font-size:0.72rem;background:rgba(52,211,153,0.18);color:#34d399;padding:2px 8px;border-radius:999px;font-weight:700;">Hoa hồng: ${formatVND(item.fee || 10000)}</span>
              </div>
              <div style="font-size:1rem;font-weight:900;">
                ${
                  item.phoneClean
                    ? `<a href="tel:${item.phoneClean}" style="color:#38bdf8;text-decoration:underline;">📞 Gọi Khách: ${item.phone}</a>`
                    : `<span style="color:#e2e8f0;">${item.phone}</span>`
                }
              </div>
              <div style="font-size:0.8rem;color:#cbd5e1;">
                <strong>Dịch vụ:</strong> ${item.service} (${formatVND(item.fare || 100000)})<br/>
                <strong>Lộ trình:</strong> ${item.route || item.pickup}<br/>
                <strong>Trang SEO:</strong> <span style="color:#38bdf8">${item.pageTitle || item.pageSlug || '/'}</span>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
                ${
                  item.mapsUrl
                    ? `<a href="${item.mapsUrl}" target="_blank" rel="noopener" class="btn-topup" style="border-color:#34d399;color:#34d399;font-weight:800;">🗺️ Mở Bản Đồ GPS ↗</a>`
                    : ''
                }
                <button type="button" class="btn-topup js-dispatch-pickup" data-code="${item.code}" style="border-color:#fde047;color:#fde047;font-weight:800;">
                  ⚡ Nạp Vào Bộ Chia Xe
                </button>
              </div>
            </div>
          `
          )
          .join('');

        livePickupListEl.querySelectorAll('.js-dispatch-pickup').forEach((btn) => {
          btn.addEventListener('click', () => {
            const targetCode = btn.getAttribute('data-code');
            const found = serverOrdersList.find((x) => x.code === targetCode);
            if (found) loadOrderIntoAiDispatcher(found);
          });
        });
      } else if (livePickupListEl) {
        livePickupListEl.innerHTML = `
          <div style="font-size: 0.85rem; color: #94a3b8; padding: 6px 0;">
            🟢 Hệ thống đang ở trạng thái chuẩn (0 đơn). Ngay khi khách bấm <strong>Gọi / Zalo / 📍 HÃY ĐÓN TÔI</strong> trên hệ thống 7 trang Hub & Spoke, dữ liệu sẽ nhảy lên đây và bắn về Telegram tức thì!
          </div>
        `;
      }
    } catch (e) {}
  };

  fetchDashboardData();
  setInterval(fetchDashboardData, 5000);
});
