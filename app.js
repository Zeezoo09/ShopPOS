// ── PRODUCTS DATA ── edit this list to set your starting products
let products = [
  { id:1, name:"Rice 5kg",     cat:"Grocery",  price:950,  cost:800, stock:40 },
  { id:2, name:"Sugar 1kg",    cat:"Grocery",  price:160,  cost:130, stock:60 },
  { id:3, name:"Cooking Oil",  cat:"Grocery",  price:450,  cost:380, stock:25 },
  { id:4, name:"Tea 250g",     cat:"Drinks",   price:260,  cost:200, stock:20 },
  { id:5, name:"Biscuits",     cat:"Snacks",   price:70,   cost:50,  stock:50 },
  { id:6, name:"Shampoo",      cat:"Care",     price:240,  cost:180, stock:15 },
  { id:7, name:"Soap",         cat:"Care",     price:90,   cost:60,  stock:30 },
];

let cart = [];
let sales = [];
let payMethod = "Cash";
let saleCounter = 1;
let editingId = null;

// ══════════════════════════════════════════
// PRODUCTS DISPLAY
// ══════════════════════════════════════════
function renderProducts(list) {
  const grid = document.getElementById('product-grid');
  if (!list.length) {
    grid.innerHTML = '<p style="color:#aaa;padding:20px">No products found</p>';
    return;
  }
  grid.innerHTML = list.map(p => {
    const out = p.stock === 0;
    const low = p.stock > 0 && p.stock <= 5;
    return `<div class="product-card ${out ? 'out-of-stock' : ''}"
      onclick="${out ? '' : 'addToCart(' + p.id + ')'}">
      <div class="prod-name">${p.name}</div>
      <div class="prod-price">Rs. ${p.price}</div>
      <div class="prod-stock ${out ? 'no-stock' : low ? 'low-stock' : ''}">
        ${out ? 'Out of stock' : low ? 'Low: ' + p.stock + ' left' : p.stock + ' in stock'}
      </div>
    </div>`;
  }).join('');
}

function filterProducts() {
  const q = document.getElementById('search').value.toLowerCase();
  renderProducts(products.filter(p => p.name.toLowerCase().includes(q)));
}

// ══════════════════════════════════════════
// CART
// ══════════════════════════════════════════
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p || p.stock === 0) return;
  const item = cart.find(x => x.id === id);
  if (item) { if (item.qty < p.stock) item.qty++; else return; }
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  renderCart();
}

function renderCart() {
  const el = document.getElementById('cart-items');
  const btn = document.getElementById('checkout-btn');
  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">Tap a product to add it</div>';
    btn.disabled = true;
    updateTotals();
    return;
  }
  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-name">${i.name}</div>
      <button class="qty-btn" onclick="changeQty(${i.id}, -1)">−</button>
      <span style="min-width:22px;text-align:center">${i.qty}</span>
      <button class="qty-btn" onclick="changeQty(${i.id}, 1)">+</button>
      <span style="min-width:72px;text-align:right">Rs.${i.price * i.qty}</span>
    </div>`).join('');
  btn.disabled = false;
  updateTotals();
}

function updateTotals() {
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = Math.min(100, Math.max(0, parseFloat(document.getElementById('discount').value) || 0));
  const total = sub * (1 - disc / 100);
  document.getElementById('subtotal').textContent = 'Rs. ' + sub.toFixed(2);
  document.getElementById('grand-total').textContent = 'Rs. ' + total.toFixed(2);
}

function clearCart() {
  cart = [];
  document.getElementById('discount').value = 0;
  renderCart();
}

function selectPay(btn, method) {
  document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  payMethod = method;
}

// ══════════════════════════════════════════
// CHECKOUT
// ══════════════════════════════════════════
function checkout() {
  if (!cart.length) return;
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const disc = parseFloat(document.getElementById('discount').value) || 0;
  const total = sub * (1 - disc / 100);
  const customer = document.getElementById('customer').value.trim() || 'Walk-in';
  const receiptNo = 'RCP-' + String(saleCounter++).padStart(4, '0');
  const now = new Date();

  cart.forEach(ci => {
    const p = products.find(x => x.id === ci.id);
    if (p) p.stock -= ci.qty;
  });

  const sale = { receiptNo, customer, items: [...cart], sub, disc, total, pay: payMethod, time: now };
  sales.unshift(sale);
  showReceipt(sale);

  cart = [];
  document.getElementById('customer').value = '';
  document.getElementById('discount').value = 0;
  renderCart();
  renderProducts(products);
}

// ══════════════════════════════════════════
// RECEIPT
// ══════════════════════════════════════════
function showReceipt(sale) {
  const d = sale.time.toLocaleDateString();
  const t = sale.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('receipt-content').innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <strong style="font-size:17px">My Shop</strong><br>
      <small style="color:#888">${d} ${t}</small><br>
      <small style="color:#888">${sale.receiptNo}</small>
    </div>
    <div style="font-size:13px;margin-bottom:10px">Customer: <strong>${sale.customer}</strong></div>
    <hr style="margin-bottom:10px">
    ${sale.items.map(i => `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
        <span>${i.name} x${i.qty}</span>
        <span>Rs.${i.price * i.qty}</span>
      </div>`).join('')}
    <hr style="margin:10px 0">
    ${sale.disc > 0 ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#888">
        <span>Discount (${sale.disc}%)</span>
        <span>-Rs.${(sale.sub * sale.disc / 100).toFixed(2)}</span>
      </div>` : ''}
    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;margin-top:8px">
      <span>TOTAL</span><span>Rs.${sale.total.toFixed(2)}</span>
    </div>
    <div style="text-align:center;margin-top:12px;color:#888;font-size:12px">
      Payment: ${sale.pay}<br>Thank you for your purchase!
    </div>`;
  document.getElementById('receipt-modal').classList.remove('hidden');
}

function closeReceipt() {
  document.getElementById('receipt-modal').classList.add('hidden');
}

function printReceipt() {
  const content = document.getElementById('receipt-content').innerHTML;
  const win = window.open('', '_blank', 'width=350,height=550');
  win.document.write('<html><body style="font-family:Arial;padding:20px;max-width:300px">' + content + '</body></html>');
  win.document.close();
  win.print();
}

// ══════════════════════════════════════════
// SALES LOG
// ══════════════════════════════════════════
function showLog() {
  document.querySelector('.pos-layout').classList.add('hidden');
  document.getElementById('stock-panel').classList.add('hidden');
  document.getElementById('log-panel').classList.remove('hidden');
  const total = sales.reduce((s, x) => s + x.total, 0);
  const avg = sales.length ? total / sales.length : 0;
  document.getElementById('summary-cards').innerHTML = `
    <div class="s-card"><div class="val">${sales.length}</div><div class="lbl">Sales today</div></div>
    <div class="s-card"><div class="val">Rs.${total.toFixed(0)}</div><div class="lbl">Revenue</div></div>
    <div class="s-card"><div class="val">Rs.${avg.toFixed(0)}</div><div class="lbl">Avg per sale</div></div>`;
  const payColors = { Cash: '#27ae60', Card: '#2980b9', Credit: '#e67e22', Online: '#8e44ad' };
  document.getElementById('log-body').innerHTML = sales.map(s => `
    <tr>
      <td>${s.receiptNo}</td>
      <td>${s.customer}</td>
      <td>${s.items.length} item(s)</td>
      <td><strong>Rs.${s.total.toFixed(2)}</strong></td>
      <td style="color:${payColors[s.pay] || '#666'}">${s.pay}</td>
      <td>${s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">No sales yet</td></tr>';
}

function hideLog() {
  document.getElementById('log-panel').classList.add('hidden');
  document.querySelector('.pos-layout').classList.remove('hidden');
}

// ══════════════════════════════════════════
// STOCK MANAGEMENT — ADD / EDIT / DELETE
// ══════════════════════════════════════════
function showStock() {
  document.querySelector('.pos-layout').classList.add('hidden');
  document.getElementById('log-panel').classList.add('hidden');
  document.getElementById('stock-panel').classList.remove('hidden');
  cancelEdit();
  renderStockTable();
}

function hideStock() {
  document.getElementById('stock-panel').classList.add('hidden');
  document.querySelector('.pos-layout').classList.remove('hidden');
  cancelEdit();
}

function renderStockTable() {
  const search = document.getElementById('stock-search') ?
    document.getElementById('stock-search').value.toLowerCase() : '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(search));

  document.getElementById('stock-table-body').innerHTML = filtered.map(p => `
    <tr id="row-${p.id}" style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 8px;font-weight:500">${p.name}</td>
      <td style="padding:10px 8px;color:#666">${p.cat}</td>
      <td style="padding:10px 8px;text-align:center">Rs.${p.cost}</td>
      <td style="padding:10px 8px;text-align:center">Rs.${p.price}</td>
      <td style="padding:10px 8px;text-align:center;font-weight:bold;
        color:${p.stock === 0 ? '#e74c3c' : p.stock <= 5 ? '#e67e22' : '#27ae60'}">
        ${p.stock}
      </td>
      <td style="padding:10px 8px;text-align:center">
        <input type="number" id="addin-${p.id}" min="1" placeholder="0"
          style="width:60px;padding:5px;border:1px solid #ddd;border-radius:6px;text-align:center;font-size:13px">
        <button onclick="addStock(${p.id})"
          style="padding:5px 10px;background:#2980b9;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-left:4px">
          +Add
        </button>
      </td>
      <td style="padding:10px 8px;text-align:center">
        <button onclick="startEdit(${p.id})"
          style="padding:5px 10px;background:#f39c12;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-right:4px">
          Edit
        </button>
        <button onclick="deleteProduct(${p.id})"
          style="padding:5px 10px;background:#e74c3c;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">
          Delete
        </button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#aaa">No products found</td></tr>';
}

// ── ADD STOCK ──
function addStock(id) {
  const input = document.getElementById('addin-' + id);
  const qty = parseInt(input.value);
  if (!qty || qty <= 0) { alert('Enter a valid quantity to add'); return; }
  const p = products.find(x => x.id === id);
  if (p) {
    p.stock += qty;
    input.value = '';
    renderStockTable();
    renderProducts(products);
    showToast(qty + ' units added to ' + p.name + '. Stock now: ' + p.stock);
  }
}

// ── DELETE PRODUCT ──
function deleteProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!confirm('Delete "' + p.name + '" from the product list?\n\nThis cannot be undone.')) return;
  products = products.filter(x => x.id !== id);
  cart = cart.filter(x => x.id !== id);
  renderStockTable();
  renderProducts(products);
  showToast(p.name + ' deleted successfully');
}

// ── EDIT PRODUCT ──
function startEdit(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  editingId = id;

  document.getElementById('edit-panel').classList.remove('hidden');
  document.getElementById('edit-id').value = p.id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-cat').value = p.cat;
  document.getElementById('edit-price').value = p.price;
  document.getElementById('edit-cost').value = p.cost;
  document.getElementById('edit-stock').value = p.stock;

  // Scroll to edit form
  document.getElementById('edit-panel').scrollIntoView({ behavior: 'smooth' });
}

function saveEdit() {
  const name  = document.getElementById('edit-name').value.trim();
  const cat   = document.getElementById('edit-cat').value.trim();
  const price = parseFloat(document.getElementById('edit-price').value);
  const cost  = parseFloat(document.getElementById('edit-cost').value) || 0;
  const stock = parseInt(document.getElementById('edit-stock').value);

  if (!name || !price || isNaN(stock)) {
    alert('Please fill in all required fields (name, price, stock)');
    return;
  }

  const p = products.find(x => x.id === editingId);
  if (p) {
    p.name  = name;
    p.cat   = cat || 'General';
    p.price = price;
    p.cost  = cost;
    p.stock = stock;
  }

  cancelEdit();
  renderStockTable();
  renderProducts(products);
  showToast(name + ' updated successfully');
}

function cancelEdit() {
  editingId = null;
  document.getElementById('edit-panel').classList.add('hidden');
  ['edit-name','edit-cat','edit-price','edit-cost','edit-stock'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ── ADD NEW PRODUCT ──
function addNewProduct() {
  const name  = document.getElementById('np-name').value.trim();
  const cat   = document.getElementById('np-cat').value.trim() || 'General';
  const price = parseFloat(document.getElementById('np-price').value);
  const cost  = parseFloat(document.getElementById('np-cost').value) || 0;
  const stock = parseInt(document.getElementById('np-stock').value);
  const msg   = document.getElementById('add-msg');

  if (!name || !price || isNaN(stock)) {
    msg.style.color = '#e74c3c';
    msg.textContent = 'Please fill in product name, selling price and stock.';
    return;
  }

  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  products.push({ id: newId, name, cat, price, cost, stock });

  ['np-name','np-cat','np-price','np-cost','np-stock'].forEach(id => {
    document.getElementById(id).value = '';
  });

  msg.style.color = '#27ae60';
  msg.textContent = '✓ ' + name + ' added successfully!';
  setTimeout(() => msg.textContent = '', 3000);

  renderStockTable();
  renderProducts(products);
}

// ── TOAST NOTIFICATION ──
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#2c3e50;color:white;padding:10px 22px;border-radius:20px;
      font-size:13px;z-index:9999;opacity:0;transition:opacity .3s`;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 2500);
}

// ══════════════════════════════════════════
// CLOCK
// ══════════════════════════════════════════
function updateClock() {
  document.getElementById('clock').textContent =
    new Date().toLocaleDateString() + '  ' +
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════
renderProducts(products);
renderCart();