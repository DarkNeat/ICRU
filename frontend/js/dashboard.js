// Logout button
document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
});

// Dashboard buttons (icon, label, link, color)
const buttons = [
  { icon: 'fingerprint', label: 'Attendance', link: 'attendance.html', color: '#673ab7' },
  { icon: 'bar_chart', label: 'Report', link: 'report.html', color: '#3f51b5' },
  { icon: 'inventory', label: 'Inventory', link: 'inventory.html', color: '#009688' },
  { icon: 'qr_code_2', label: 'Download App', link: 'download.html', color: '#3949ab' }
];

// Responsive style helper
function getButtonStyle() {
  if (window.innerWidth <= 600) {
    return `
      width: 90vw;
      max-width: 340px;
      height: 90px;
      margin: 0 auto 14px auto;
      font-size: 1.15rem;
      border-radius: 14px;
    `;
  }
  return `
    width: 120px;
    height: 90px;
    margin: 14px;
    font-size: 1.2rem;
    border-radius: 16px;
  `;
}

function getIconStyle() {
  if (window.innerWidth <= 600) {
    return "font-size:2.2rem;margin-bottom:6px;";
  }
  return "font-size:2.7rem;margin-bottom:8px;";
}

function getLabelStyle() {
  if (window.innerWidth <= 600) {
    return "font-size:1.07rem;font-weight:600;letter-spacing:1.1px;text-align:center;";
  }
  return "font-size:1.18rem;font-weight:600;letter-spacing:1.1px;text-align:center;";
}

function renderDashboardButtons() {
  const style = getButtonStyle();
  const iconStyle = getIconStyle();
  const labelStyle = getLabelStyle();
  const container = document.getElementById('dashboard-buttons');
  container.innerHTML = buttons.map(btn => `
    <div
      class="dashboard-btn"
      style="
        background: ${btn.color};
        ${style}
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(80,0,80,0.09);
        user-select: none;
        transition: transform 0.15s, box-shadow 0.15s;
      "
      onclick="window.location.href='${btn.link}'"
      onmouseover="this.style.transform='translateY(-4px) scale(1.08)'; this.style.boxShadow='0 8px 32px rgba(80,0,80,0.14)'"
      onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 16px rgba(80,0,80,0.09)'"
    >
      <span
        class="material-icons"
        style="${iconStyle}"
      >${btn.icon}</span>
      <div
        style="${labelStyle}"
      >${btn.label}</div>
    </div>
  `).join('');
}
window.addEventListener('resize', renderDashboardButtons);
renderDashboardButtons();

// Date/time updater
function updateDateTime() {
  const now = new Date();
  const months = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const formatted = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} - ${
    now.getHours().toString().padStart(2, '0')
  }:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  document.getElementById('datetime').textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Status tile
async function checkDbStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    document.getElementById('status-tiles').innerHTML = `
      <div class="status-tile ${data.dbConnected ? 'active' : 'inactive'}"
        style="display:flex;align-items:center;gap:18px;padding:16px 20px;margin-bottom:16px;border-radius:12px;border:1.5px solid ${data.dbConnected ? '#4CAF50' : '#d32f2f'};background:${data.dbConnected ? '#e8f5e9' : '#ffebee'};box-shadow:0 2px 10px rgba(80,0,80,0.06);user-select:none;">
        <span class="material-icons status-icon" style="font-size:2.2rem;color:${data.dbConnected ? '#4CAF50' : '#d32f2f'};">${data.dbConnected ? 'check_circle' : 'cancel'}</span>
        <div>
          <div class="status-label" style="font-weight:600;font-size:1.07rem;color:#4B2265;">Connection with database</div>
          <div class="status-value" style="font-weight:bold;font-size:1.07rem;color:${data.dbConnected ? '#388e3c' : '#d32f2f'};">${data.dbConnected ? 'Active' : 'Inactive'}</div>
        </div>
      </div>
      <div class="status-tile active"
        style="display:flex;align-items:center;gap:18px;padding:16px 20px;margin-bottom:16px;border-radius:12px;border:1.5px solid #4CAF50;background:#e8f5e9;box-shadow:0 2px 10px rgba(80,0,80,0.06);user-select:none;">
        <span class="material-icons status-icon" style="font-size:2.2rem;color:#4CAF50;">check_circle</span>
        <div>
          <div class="status-label" style="font-weight:600;font-size:1.07rem;color:#4B2265;">System app status</div>
          <div class="status-value" style="font-weight:bold;font-size:1.07rem;color:#388e3c;">Active</div>
        </div>
      </div>
      <div class="status-tile active"
        style="display:flex;align-items:center;gap:18px;padding:16px 20px;margin-bottom:16px;border-radius:12px;border:1.5px solid #4CAF50;background:#e8f5e9;box-shadow:0 2px 10px rgba(80,0,80,0.06);user-select:none;">
        <span class="material-icons status-icon" style="font-size:2.2rem;color:#4CAF50;">check_circle</span>
        <div>
          <div class="status-label" style="font-weight:600;font-size:1.07rem;color:#4B2265;">Mobile app status</div>
          <div class="status-value" style="font-weight:bold;font-size:1.07rem;color:#388e3c;">Active</div>
        </div>
      </div>
    `;
  } catch (e) {
    document.getElementById('status-tiles').innerHTML = `
      <div style="color:#d32f2f;text-align:center;">Unable to load status.</div>
    `;
  }
}
checkDbStatus();
