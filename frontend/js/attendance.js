let currentTab = 'daily';

document.getElementById('tab-daily').onclick = () => switchTab('daily');
document.getElementById('tab-monthly').onclick = () => switchTab('monthly');

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-daily').classList.toggle('tab-active', tab === 'daily');
  document.getElementById('tab-monthly').classList.toggle('tab-active', tab === 'monthly');
  renderTab();
}

function renderTab() {
  if (currentTab === 'daily') {
    renderDailyAttendance();
  } else {
    renderMonthlyAttendance();
  }
}

async function renderDailyAttendance() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('attendance-content').innerHTML = `
    <div class="center-controls">
      <label for="daily-date">Date:</label>
      <input type="date" id="daily-date" value="${today}">
      <button id="daily-refresh">Refresh</button>
    </div>
    <div id="daily-summary"></div>
    <div id="daily-table"></div>
  `;
  document.getElementById('daily-refresh').onclick = fetchDailyAttendance;
  document.getElementById('daily-date').onchange = fetchDailyAttendance;
  fetchDailyAttendance();
}

async function fetchDailyAttendance() {
  const date = document.getElementById('daily-date').value;
  document.getElementById('daily-table').innerHTML = 'Loading...';
  const res = await fetch(`/api/attendance/daily?date=${date}`); // <-- FIXED HERE
  const data = await res.json();
  renderDailyTable(data);
}


function renderDailyTable(data) {
  if (!data || data.length === 0) {
    document.getElementById('daily-table').innerHTML = 'No data available.';
    document.getElementById('daily-summary').innerText = '';
    return;
  }
  let late = 0, missing = 0;
  data.forEach(row => {
    if (!row.time_in_1 || !row.time_out_1) missing++;
    else {
      const t = row.time_in_1.split(':');
      if (parseInt(t[0]) > 9 || (parseInt(t[0]) === 9 && parseInt(t[1]) > 0)) late++;
    }
  });
  document.getElementById('daily-summary').innerText =
    `👥 Employees: ${data.length} ⏰ Late: ${late} ⚠️ Missing: ${missing}`;
  let html = `<table>
    <tr>
      <th>ID</th><th>Name</th><th>In 1</th><th>Out 1</th><th>In 2</th><th>Out 2</th>
    </tr>`;
  data.forEach(row => {
    html += `<tr>
      <td>${row.ID}</td>
      <td>${row.name_acc || ''}</td>
      <td>${row.time_in_1 || ''}</td>
      <td>${row.time_out_1 || ''}</td>
      <td>${row.time_in_2 || ''}</td>
      <td>${row.time_out_2 || ''}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('daily-table').innerHTML = html;
}

async function renderMonthlyAttendance() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  document.getElementById('attendance-content').innerHTML = `
    <div class="center-controls">
      <label for="monthly-month">Month:</label>
      <select id="monthly-month">${[...Array(12).keys()].map(i => `<option value="${i+1}" ${i+1===month?'selected':''}>${new Date(0, i).toLocaleString('en', {month:'long'})}</option>`).join('')}</select>
      <label for="monthly-year">Year:</label>
      <select id="monthly-year">${[...Array(6).keys()].map(i => `<option value="${2020+i}" ${2020+i===year?'selected':''}>${2020+i}</option>`).join('')}</select>
      <button id="monthly-refresh">Refresh</button>
    </div>
    <div id="monthly-summary"></div>
    <div id="monthly-table"></div>
  `;
  document.getElementById('monthly-refresh').onclick = fetchMonthlyAttendance;
  document.getElementById('monthly-month').onchange = fetchMonthlyAttendance;
  document.getElementById('monthly-year').onchange = fetchMonthlyAttendance;
  fetchMonthlyAttendance();
}

async function fetchMonthlyAttendance() {
  const month = document.getElementById('monthly-month').value;
  const year = document.getElementById('monthly-year').value;
  document.getElementById('monthly-table').innerHTML = 'Loading...';
  const res = await fetch(`/api/attendance/monthly?month=${month}&year=${year}`); // <-- FIXED HERE
  const data = await res.json();
  renderMonthlyTable(data);
}


function renderMonthlyTable(data) {
  if (!data || data.length === 0) {
    document.getElementById('monthly-table').innerHTML = 'No data available.';
    document.getElementById('monthly-summary').innerText = '';
    return;
  }
  let totalPresent = 0, totalLate = 0, totalMissing = 0, avgHours = 0;
  data.forEach(row => {
    totalPresent += parseInt(row.present_days);
    totalLate += parseInt(row.late_days);
    totalMissing += parseInt(row.missing_punches);
    avgHours += parseFloat(row.avg_hours);
  });
  avgHours = avgHours / data.length;
  document.getElementById('monthly-summary').innerText =
    `👥 Employees: ${data.length} ✅ Present: ${totalPresent} ⏰ Late: ${totalLate} ⚠️ Missing: ${totalMissing} ⏳ Avg: ${avgHours.toFixed(2)}h`;
  let html = `<table>
    <tr>
      <th>ID</th><th>Name</th><th>Present Days</th><th>Late Days</th><th>Missing Punches</th><th>Avg Hours</th>
    </tr>`;
  data.forEach(row => {
    html += `<tr>
      <td>${row.ID}</td>
      <td>${row.name_acc || ''}</td>
      <td>${row.present_days}</td>
      <td>${row.late_days}</td>
      <td>${row.missing_punches}</td>
      <td>${parseFloat(row.avg_hours).toFixed(2)}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('monthly-table').innerHTML = html;
}

switchTab('daily');
