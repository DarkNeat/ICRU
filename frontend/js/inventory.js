const categories = ['All', 'Spice', 'Meat', 'Vegetable', 'Grain', 'Dairy', 'Other'];
let inventoryData = [];
let selectedCategory = 'All';
let searchText = '';

function renderInventoryControls() {
  let catBtns = categories.map(cat =>
    `<button class="cat-btn${cat===selectedCategory?' cat-active':''}" onclick="selectCategory('${cat}')">${cat}</button>`
  ).join('');
  document.getElementById('inventory-controls').innerHTML = `
    <div style="margin-bottom:10px;">
      ${catBtns}
      <input type="text" id="inventory-search" placeholder="Search inventory..." value="${searchText}" style="margin-left:10px; padding:6px; border-radius:8px; border:1px solid #b8a1d9;">
      <button onclick="showStockAlert()" style="margin-left:10px;">Stock Alert</button>
    </div>
  `;
  document.getElementById('inventory-search').oninput = e => {
    searchText = e.target.value;
    renderInventoryTable();
  };
}

function selectCategory(cat) {
  selectedCategory = cat;
  renderInventoryControls();
  renderInventoryTable();
}

function filterInventory() {
  return inventoryData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchText === '' ||
      (item.ingredient_name && item.ingredient_name.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchText.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
}

function renderInventoryTable() {
  const items = filterInventory();
  if (items.length === 0) {
    document.getElementById('inventory-table').innerHTML = '<div style="color:gray;">No inventory items.</div>';
    return;
  }
  let html = `<table>
    <tr>
      <th>Ingredient</th><th>Category</th><th>Quantity</th><th>Unit</th>
    </tr>`;
  items.forEach(item => {
    html += `<tr>
      <td>${item.ingredient_name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.unit}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('inventory-table').innerHTML = html;
}

function showStockAlert() {
  // Show items with quantity 0 or <= 1/5 of full_stock
  const alerts = inventoryData.filter(item => {
    const qty = parseFloat(item.quantity) || 0;
    const full = parseFloat(item.full_stock) || 0;
    return qty === 0 || (full > 0 && qty <= full / 5);
  });
  if (alerts.length === 0) {
    alert('No items are low or out of stock.');
    return;
  }
  let html = `<table>
    <tr>
      <th>Ingredient</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Full Stock</th>
    </tr>`;
  alerts.forEach(item => {
    html += `<tr>
      <td>${item.ingredient_name}</td>
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.unit}</td>
      <td>${item.full_stock || ''}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('inventory-alert').innerHTML = html;
  setTimeout(() => { document.getElementById('inventory-alert').innerHTML = ''; }, 10000);
}

async function fetchInventory() {
  document.getElementById('inventory-table').innerHTML = 'Loading...';
  const res = await fetch('http://localhost:3000/api/inventory');
  inventoryData = await res.json();
  renderInventoryControls();
  renderInventoryTable();
}

fetchInventory();
