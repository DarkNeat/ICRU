let reportTab = 'daily';

document.getElementById('tab-daily').onclick = () => switchReportTab('daily');
document.getElementById('tab-monthly').onclick = () => switchReportTab('monthly');

function switchReportTab(tab) {
  reportTab = tab;
  document.getElementById('tab-daily').classList.toggle('tab-active', tab === 'daily');
  document.getElementById('tab-monthly').classList.toggle('tab-active', tab === 'monthly');
  renderReportTab();
}

function renderReportTab() {
  if (reportTab === 'daily') {
    renderDailyReport();
  } else {
    renderMonthlyReport();
  }
}

async function renderDailyReport() {
  const today = new Date().toISOString().split('T')[0];
document.getElementById('report-content').innerHTML = `
  <div class="center-controls">
    <label for="daily-date">Date:</label>
    <input type="date" id="daily-date" value="${today}">
    <button id="daily-refresh">Refresh</button>
  </div>
  <div id="daily-summary"></div>
  <div id="daily-table"></div>
`;

  document.getElementById('daily-refresh').onclick = fetchDailyReport;
  document.getElementById('daily-date').onchange = fetchDailyReport;
  fetchDailyReport();
}

async function fetchDailyReport() {
  const date = document.getElementById('daily-date').value;
  document.getElementById('daily-table').innerHTML = 'Loading...';
  const res = await fetch(`/api/report/daily?date=${date}`); // <-- FIXED HERE
  const data = await res.json();
  renderDailyReportTable(data);
}


function renderDailyReportTable(data) {
  if (!data || data.length === 0) {
    document.getElementById('daily-table').innerHTML = 'No data available.';
    document.getElementById('daily-summary').innerText = '';
    return;
  }
  let totalSales = 0, totalTips = 0;
  data.forEach(row => {
    totalSales += parseFloat(row.Total) || 0;
    totalTips += parseFloat(row.Tip) || 0;
  });
  document.getElementById('daily-summary').innerText =
    `🧾 Orders: ${data.length}   💵 Total Sales: ${totalSales.toFixed(2)}   🎁 Total Tips: ${totalTips.toFixed(2)}`;
  let html = `<table>
    <tr>
      <th>Order ID</th><th>Customer Ref</th><th>Time</th><th>Total</th><th>Tip</th><th>Payment Mode</th>
    </tr>`;
  data.forEach(row => {
    html += `<tr>
      <td>${row.OrderID}</td>
      <td>${row.CustomerRef || ''}</td>
      <td>${row.Time || ''}</td>
      <td>${row.Total || ''}</td>
      <td>${row.Tip || ''}</td>
      <td>${row.PaymentMode || ''}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('daily-table').innerHTML = html;
}

async function renderMonthlyReport() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
document.getElementById('report-content').innerHTML = `
  <div class="center-controls">
    <label for="daily-date">Date:</label>
    <input type="date" id="daily-date" value="${today}">
    <button id="daily-refresh">Refresh</button>
  </div>
  <div id="daily-summary"></div>
  <div id="daily-table"></div>
`;

  document.getElementById('monthly-refresh').onclick = fetchMonthlyReport;
  document.getElementById('monthly-month').onchange = fetchMonthlyReport;
  document.getElementById('monthly-year').onchange = fetchMonthlyReport;
  fetchMonthlyReport();
}

async function fetchMonthlyReport() {
  const month = document.getElementById('monthly-month').value;
  const year = document.getElementById('monthly-year').value;
  document.getElementById('monthly-table').innerHTML = 'Loading...';
  const res = await fetch(`/api/report/monthly?month=${month}&year=${year}`); // <-- FIXED HERE
  const data = await res.json();
  renderMonthlyReportTable(data);
}


function renderMonthlyReportTable(data) {
  if (!data || data.length === 0) {
    document.getElementById('monthly-table').innerHTML = 'No data available.';
    document.getElementById('monthly-summary').innerText = '';
    return;
  }
  let totalSales = 0, totalTips = 0;
  data.forEach(row => {
    totalSales += parseFloat(row.Total) || 0;
    totalTips += parseFloat(row.Tip) || 0;
  });
  document.getElementById('monthly-summary').innerText =
    `🧾 Orders: ${data.length}   💵 Total Sales: ${totalSales.toFixed(2)}   🎁 Total Tips: ${totalTips.toFixed(2)}`;
  let html = `<table>
    <tr>
      <th>Order ID</th><th>Customer Ref</th><th>Date</th><th>Time</th><th>Total</th><th>Tip</th><th>Payment Mode</th>
    </tr>`;
  data.forEach(row => {
    html += `<tr>
      <td>${row.OrderID}</td>
      <td>${row.CustomerRef || ''}</td>
      <td>${row.Date || ''}</td>
      <td>${row.Time || ''}</td>
      <td>${row.Total || ''}</td>
      <td>${row.Tip || ''}</td>
      <td>${row.PaymentMode || ''}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('monthly-table').innerHTML = html;
}

switchReportTab('daily');
