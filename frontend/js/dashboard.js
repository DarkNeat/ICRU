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

function renderDashboardButtons() {
  const container = document.getElementById('dashboard-buttons');
  container.innerHTML = buttons.map(btn => `
    <div class="dashboard-btn" style="background:${btn.color}" onclick="window.location.href='${btn.link}'">
      <span class="material-icons dashboard-btn-icon">${btn.icon}</span>
      <div class="dashboard-btn-label">${btn.label}</div>
    </div>
  `).join('');
}
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
  const res = await fetch('http://localhost:3000/api/status');
  const data = await res.json();
  document.getElementById('status-tiles').innerHTML = `
    <div class="status-tile ${data.dbConnected ? 'active' : 'inactive'}">
      <span class="material-icons status-icon">${data.dbConnected ? 'check_circle' : 'cancel'}</span>
      <div>
        <div class="status-label">Connection with database</div>
        <div class="status-value">${data.dbConnected ? 'Active' : 'Inactive'}</div>
      </div>
    </div>
    <div class="status-tile active">
      <span class="material-icons status-icon">check_circle</span>
      <div>
        <div class="status-label">System app status</div>
        <div class="status-value">Active</div>
      </div>
    </div>
    <div class="status-tile active">
      <span class="material-icons status-icon">check_circle</span>
      <div>
        <div class="status-label">Mobile app status</div>
        <div class="status-value">Active</div>
      </div>
    </div>
  `;
}
checkDbStatus();
