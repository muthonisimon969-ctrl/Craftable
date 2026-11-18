import type { GeneratedAppBundle } from '../types/project';

export function buildStarterTemplateBundle(templateId: string): GeneratedAppBundle {
  switch (templateId) {
    case 'kenyan_commerce':
      return kenyanManualPayBundle();
    case 'atelier_editorial':
      return atelierEditorialBundle();
    case 'precision_tech':
      return precisionTechBundle();
    case 'culinary_bistro':
      return culinaryBistroBundle();
    case 'corporate_advisory':
      return corporateAdvisoryBundle();
    case '3d_game_studio':
    case '2d_game_studio':
      return gameStudio3DBundle();
    default:
      return tactileUtilityBundle();
  }
}

function kenyanManualPayBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'Savanna Manual Pay',
    description:
      'Kenyan online storefront with KSh pricing, Till/Paybill manual M-Pesa checkout & owner verification.',
    summary:
      'Loaded Savanna Manual Pay — ready for immediate manual M-Pesa payments without Safaricom Daraja. Customers browse in KSh, copy your Till or Paybill number, submit their M-Pesa confirmation code, and you verify payments in the Owner Verify tab.',
    designStrategy: 'template_foundation',
    templateId: 'kenyan_commerce',
    designDirection:
      'Savanna Warm Stone canvas with Charcoal ink and Emerald actions tailored for mobile Kenyan retail and manual Lipa na M-Pesa verification.',
    qaSummary:
      'QA Audit (6/6 checks passed): manual M-Pesa flow, structure, typography, responsive CSS, self-contained visuals, and JS verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Change Till number & store name',
      'Add WhatsApp order message link',
      'Add more Nairobi products',
    ],
    htmlCode: `<header class="topbar">
  <div class="container topbar-inner">
    <a href="#catalog" class="brand">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="8" fill="#15803D"/>
        <path d="M8 15l4 4 8-9" stroke="#FFFFFF" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Savanna Goods</span>
    </a>
    <div class="nav-actions">
      <button id="tabStoreBtn" type="button" class="pill-btn active">Store</button>
      <button id="tabOwnerBtn" type="button" class="pill-btn">Verify (<span id="pendingBadge">0</span>)</button>
      <button id="openBagBtn" type="button" class="bag-btn">Bag <span id="bagCount">0</span></button>
    </div>
  </div>
</header>

<main id="storeView" class="container">
  <section class="hero">
    <div>
      <span class="eyebrow">Nairobi &bull; Manual M-Pesa Ready</span>
      <h1>Curated Kenyan Craft &amp; Pantry Goods</h1>
      <p>Order directly with transparent KSh pricing and pay manually via Lipa na M-Pesa Till or Paybill &mdash; no automatic STK or Daraja needed.</p>
      <div class="hero-meta">
        <span>Till: <strong>5829140</strong></span>
        <span>Support: <strong>+254 712 345 678</strong></span>
      </div>
    </div>
    <div class="hero-card">
      <svg viewBox="0 0 220 140" width="220" height="140" aria-hidden="true">
        <rect width="220" height="140" rx="14" fill="#ECFDF5"/>
        <circle cx="62" cy="70" r="34" fill="#15803D" opacity="0.16"/>
        <rect x="44" y="42" width="132" height="58" rx="10" fill="#FFFFFF" stroke="#15803D" stroke-width="1.5"/>
        <text x="60" y="66" font-family="sans-serif" font-size="11" font-weight="700" fill="#14181F">LIPA NA M-PESA</text>
        <text x="60" y="84" font-family="monospace" font-size="13" font-weight="700" fill="#15803D">TILL 5829140</text>
      </svg>
    </div>
  </section>

  <section id="catalog" class="catalog-section">
    <div class="toolbar">
      <div class="filters" id="categoryFilters">
        <button type="button" class="chip active" data-cat="All">All</button>
        <button type="button" class="chip" data-cat="Coffee & Tea">Coffee &amp; Tea</button>
        <button type="button" class="chip" data-cat="Home Craft">Home Craft</button>
        <button type="button" class="chip" data-cat="Leather">Leather</button>
      </div>
      <input id="searchInput" type="search" placeholder="Search items in KSh..." aria-label="Search products" />
    </div>
    <div id="productGrid" class="product-grid"></div>
  </section>
</main>

<section id="ownerView" class="container hidden">
  <div class="section-head">
    <div>
      <span class="eyebrow">Merchant Manual Verification</span>
      <h2>Submitted M-Pesa Payments</h2>
      <p>Cross-check M-Pesa confirmation codes against your Till/SMS notifications and confirm orders manually.</p>
    </div>
    <button id="backToStoreBtn" type="button" class="btn-outline">Back to Store</button>
  </div>
  <div id="ordersList" class="orders-list"></div>
</section>

<aside id="checkoutDrawer" class="drawer hidden" aria-label="Checkout drawer">
  <div class="drawer-panel">
    <div class="drawer-head">
      <h3>Your Bag &amp; Manual Checkout</h3>
      <button id="closeBagBtn" type="button" class="icon-close">&times;</button>
    </div>
    <div id="bagItems" class="bag-items"></div>
    <div class="zone-row">
      <label for="zoneSelect">Delivery Zone</label>
      <select id="zoneSelect">
        <option value="200">Nairobi CBD &amp; Westlands (KSh 200)</option>
        <option value="350">Kilimani, Karen &amp; Ruaka (KSh 350)</option>
        <option value="0">Pickup at Yaya Centre (Free)</option>
      </select>
    </div>
    <div class="totals-box">
      <div><span>Subtotal</span><strong id="subtotalVal">KSh 0</strong></div>
      <div><span>Delivery</span><strong id="deliveryVal">KSh 200</strong></div>
      <div class="grand"><span>Total to Pay</span><strong id="totalVal">KSh 200</strong></div>
    </div>

    <div class="mpesa-box">
      <div class="mpesa-head">
        <strong>Manual Lipa na M-Pesa Instructions</strong>
        <button id="copyTillBtn" type="button" class="copy-btn">Copy Till 5829140</button>
      </div>
      <ol>
        <li>Go to M-Pesa &rarr; <strong>Lipa na M-Pesa</strong> &rarr; <strong>Buy Goods &amp; Services</strong></li>
        <li>Enter Till Number: <strong>5829140</strong> (Savanna Goods Ltd)</li>
        <li>Or Paybill: <strong>400200</strong> &bull; Account: <strong>SAVANNA</strong></li>
        <li>Pay exact total above, then enter your M-Pesa code below.</li>
      </ol>
    </div>

    <form id="manualPayForm" class="pay-form">
      <label>Customer Name
        <input id="custName" type="text" required placeholder="e.g. Amina Wanjiku" />
      </label>
      <label>Safaricom M-Pesa Number
        <input id="custPhone" type="tel" required placeholder="+254 712 345 678" />
      </label>
      <label>M-Pesa Confirmation Code
        <input id="mpesaCode" type="text" required maxlength="14" placeholder="e.g. SJK48X291P" />
      </label>
      <button type="submit" class="btn-primary">Submit Manual Payment</button>
    </form>
  </div>
</aside>
<div id="toast" class="toast hidden"></div>`,
    cssCode: `:root {
  --bg: #FAFAF9;
  --surface: #FFFFFF;
  --ink: #14181F;
  --muted: #525B66;
  --accent: #15803D;
  --accent-soft: #ECFDF5;
  --gold: #D97706;
  --border: #E5E7EB;
  --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
body { background: var(--bg); color: var(--ink); font-family: var(--font-sans); line-height: 1.5; }
.container { max-width: 1040px; margin: 0 auto; padding: 16px; }
.hidden { display: none !important; }
.topbar { position: sticky; top: 0; z-index: 20; background: rgba(250,250,249,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
.topbar-inner { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 16px; }
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); font-weight: 700; font-size: 1rem; }
.nav-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.pill-btn, .bag-btn, .chip, .btn-outline, .copy-btn {
  border: 1px solid var(--border); background: var(--surface); color: var(--ink);
  min-height: 44px; padding: 10px 16px; border-radius: 999px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
}
.pill-btn.active, .chip.active { background: var(--ink); color: #FFF; border-color: var(--ink); }
.bag-btn { background: var(--accent); color: #FFF; border-color: var(--accent); }
.hero {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: center;
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-top: 8px;
}
.eyebrow { display: inline-block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); margin-bottom: 6px; }
.hero h1 { font-size: clamp(1.5rem, 3.4vw, 2.2rem); line-height: 1.15; margin: 0 0 10px; }
.hero p { color: var(--muted); margin: 0 0 14px; font-size: 1rem; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.92rem; color: var(--ink); }
.hero-card { display: flex; justify-content: center; }
.toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; margin: 20px 0 14px; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
input[type="search"], input[type="text"], input[type="tel"], select {
  width: 100%; min-height: 46px; padding: 11px 14px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--surface); color: var(--ink); font-size: 1rem;
}
#searchInput { max-width: 260px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px;
  display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
}
.card-cat { font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); font-weight: 700; }
.card h3 { margin: 0; font-size: 1.1rem; }
.card p { margin: 0; font-size: 0.92rem; color: var(--muted); }
.card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; gap: 10px; }
.price { font-weight: 700; font-size: 1.05rem; font-variant-numeric: tabular-nums; color: var(--ink); }
.btn-primary {
  background: var(--accent); color: #FFF; border: none; border-radius: 10px;
  min-height: 46px; padding: 11px 18px; font-weight: 700; cursor: pointer; font-size: 0.98rem;
}
.drawer { position: fixed; inset: 0; background: rgba(20,24,31,0.5); z-index: 50; display: flex; justify-content: flex-end; }
.drawer-panel { width: 100%; max-width: 440px; background: var(--surface); height: 100%; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.drawer-head, .section-head, .mpesa-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.icon-close { background: none; border: 1px solid var(--border); border-radius: 10px; width: 44px; height: 44px; font-size: 1.4rem; cursor: pointer; }
.bag-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.qty-ctrl { display: flex; align-items: center; gap: 8px; }
.qty-ctrl button { width: 40px; height: 40px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); cursor: pointer; font-size: 1.1rem; font-weight: 700; }
.totals-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; }
.totals-box > div { display: flex; justify-content: space-between; }
.totals-box .grand { border-top: 1px solid var(--border); padding-top: 6px; margin-top: 4px; font-size: 1rem; color: var(--accent); }
.mpesa-box { background: var(--accent-soft); border: 1px solid #BBF7D0; border-radius: 12px; padding: 12px; font-size: 0.84rem; }
.mpesa-box ol { margin: 8px 0 0; padding-left: 18px; }
.pay-form { display: flex; flex-direction: column; gap: 10px; }
.pay-form label { display: flex; flex-direction: column; gap: 4px; font-size: 0.84rem; font-weight: 600; }
.orders-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.order-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.status-pill { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-pending { background: #FEF3C7; color: #92400E; }
.status-confirmed { background: #DCFCE7; color: #166534; }
.status-flagged { background: #FEE2E2; color: #991B1B; }
.toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); background: var(--ink); color: #FFF; padding: 10px 16px; border-radius: 999px; font-size: 0.85rem; z-index: 60; }
@media (max-width: 700px) {
  .hero { grid-template-columns: 1fr; padding: 18px; }
  #searchInput { max-width: 100%; }
}`,
    jsCode: `const PRODUCTS = [
  { id: 'p1', name: 'Nyeri Peaberry AA Roast', cat: 'Coffee & Tea', price: 1450, desc: 'Single-origin 500g whole bean roast with bright berry notes.' },
  { id: 'p2', name: 'Kericho Purple Leaf Tea', cat: 'Coffee & Tea', price: 850, desc: 'Antioxidant-rich Kenyan highland purple tea caddy (250g).' },
  { id: 'p3', name: 'Kiondo Woven Market Tote', cat: 'Home Craft', price: 2900, desc: 'Hand-spun sisal tote with vegetable-tanned leather straps.' },
  { id: 'p4', name: 'Kisii Soapstone Espresso Set', cat: 'Home Craft', price: 2200, desc: 'Set of 4 hand-carved warm stone coasters and cups.' },
  { id: 'p5', name: 'Nairobi Leather Passport Sleeve', cat: 'Leather', price: 1950, desc: 'Full-grain Kenyan leather sleeve with hand-stitched edge.' },
  { id: 'p6', name: 'Rift Valley Raw Acacia Honey', cat: 'Coffee & Tea', price: 1100, desc: 'Unfiltered 500ml amber jar harvested in Baringo.' }
];
let activeCat = 'All';
let searchQuery = '';
let bag = [];
let orders = JSON.parse(localStorage.getItem('savanna_manual_orders') || 'null') || [
  { id: 'ORD-1042', name: 'Brian Kamau', phone: '+254722109844', code: 'SJK82P904L', total: 3100, items: 'Kiondo Woven Market Tote x1', status: 'Pending Verification' }
];
const fmt = (n) => 'KSh ' + Number(n).toLocaleString('en-KE');
function saveOrders() { localStorage.setItem('savanna_manual_orders', JSON.stringify(orders)); }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2600);
}
function renderProducts() {
  const grid = document.getElementById('productGrid');
  const list = PRODUCTS.filter(p => (activeCat === 'All' || p.cat === activeCat) && (!searchQuery || p.name.toLowerCase().includes(searchQuery)));
  grid.innerHTML = list.length ? list.map(p =>
    '<article class="card">' +
      '<div>' +
        '<span class="card-cat">' + p.cat + '</span>' +
        '<h3>' + p.name + '</h3>' +
        '<p>' + p.desc + '</p>' +
      '</div>' +
      '<div class="card-foot">' +
        '<span class="price">' + fmt(p.price) + '</span>' +
        '<button type="button" class="btn-primary" onclick="addToBag(\\'' + p.id + '\\')">Add</button>' +
      '</div>' +
    '</article>'
  ).join('') : '<p>No matching products found.</p>';
}
window.addToBag = function(id) {
  const item = bag.find(b => b.id === id);
  if (item) item.qty++;
  else { const p = PRODUCTS.find(x => x.id === id); if (p) bag.push({ ...p, qty: 1 }); }
  renderBag();
  showToast('Added to bag');
};
window.updateQty = function(id, delta) {
  const item = bag.find(b => b.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) bag = bag.filter(b => b.id !== id);
  renderBag();
};
function renderBag() {
  const count = bag.reduce((s, x) => s + x.qty, 0);
  document.getElementById('bagCount').textContent = count;
  const sub = bag.reduce((s, x) => s + x.price * x.qty, 0);
  const del = Number(document.getElementById('zoneSelect').value || 0);
  document.getElementById('subtotalVal').textContent = fmt(sub);
  document.getElementById('deliveryVal').textContent = fmt(del);
  document.getElementById('totalVal').textContent = fmt(sub + (bag.length ? del : 0));
  document.getElementById('bagItems').innerHTML = bag.length ? bag.map(i =>
    '<div class="bag-item">' +
      '<div><strong>' + i.name + '</strong><div style="font-size:0.82rem;color:#525B66">' + fmt(i.price) + ' each</div></div>' +
      '<div class="qty-ctrl">' +
        '<button type="button" onclick="updateQty(\\'' + i.id + '\\', -1)">-</button>' +
        '<span>' + i.qty + '</span>' +
        '<button type="button" onclick="updateQty(\\'' + i.id + '\\', 1)">+</button>' +
      '</div>' +
    '</div>'
  ).join('') : '<p style="color:#525B66;font-size:0.9rem">Your bag is empty. Add products to test manual M-Pesa checkout.</p>';
}
window.setOrderStatus = function(id, status) {
  orders = orders.map(o => o.id === id ? { ...o, status } : o);
  saveOrders();
  renderOrders();
  showToast('Order ' + id + ' marked ' + status);
};
function renderOrders() {
  const pendingCount = orders.filter(o => o.status === 'Pending Verification').length;
  document.getElementById('pendingBadge').textContent = pendingCount;
  document.getElementById('ordersList').innerHTML = orders.length ? orders.map(o => {
    const cls = o.status === 'Confirmed Paid' ? 'status-confirmed' : o.status === 'Flagged' ? 'status-flagged' : 'status-pending';
    return '<div class="order-card">' +
      '<div class="drawer-head">' +
        '<strong>' + o.id + ' &bull; ' + o.name + '</strong>' +
        '<span class="status-pill ' + cls + '">' + o.status + '</span>' +
      '</div>' +
      '<div style="font-size:0.88rem;color:#525B66">' + o.items + ' &bull; <strong>' + fmt(o.total) + '</strong></div>' +
      '<div style="font-size:0.85rem">M-Pesa Code: <strong style="font-family:monospace">' + o.code + '</strong> &bull; Phone: ' + o.phone + '</div>' +
      '<div class="nav-actions">' +
        '<button type="button" class="btn-primary" onclick="setOrderStatus(\\'' + o.id + '\\', \\'Confirmed Paid\\')">Confirm Payment</button>' +
        '<button type="button" class="btn-outline" onclick="setOrderStatus(\\'' + o.id + '\\', \\'Flagged\\')">Flag Code</button>' +
      '</div>' +
    '</div>';
  }).join('') : '<p>No manual payment submissions yet.</p>';
}
document.getElementById('categoryFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  activeCat = btn.dataset.cat;
  document.querySelectorAll('#categoryFilters .chip').forEach(c => c.classList.toggle('active', c === btn));
  renderProducts();
});
document.getElementById('searchInput').addEventListener('input', (e) => { searchQuery = e.target.value.trim().toLowerCase(); renderProducts(); });
document.getElementById('zoneSelect').addEventListener('change', renderBag);
document.getElementById('openBagBtn').addEventListener('click', () => document.getElementById('checkoutDrawer').classList.remove('hidden'));
document.getElementById('closeBagBtn').addEventListener('click', () => document.getElementById('checkoutDrawer').classList.add('hidden'));
document.getElementById('copyTillBtn').addEventListener('click', () => {
  if (navigator.clipboard) navigator.clipboard.writeText('5829140').catch(() => {});
  showToast('Till Number 5829140 copied');
});
function switchView(owner) {
  document.getElementById('storeView').classList.toggle('hidden', owner);
  document.getElementById('ownerView').classList.toggle('hidden', !owner);
  document.getElementById('tabStoreBtn').classList.toggle('active', !owner);
  document.getElementById('tabOwnerBtn').classList.toggle('active', owner);
}
document.getElementById('tabStoreBtn').addEventListener('click', () => switchView(false));
document.getElementById('tabOwnerBtn').addEventListener('click', () => switchView(true));
document.getElementById('backToStoreBtn').addEventListener('click', () => switchView(false));
document.getElementById('manualPayForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!bag.length) { showToast('Add an item to your bag first'); return; }
  const code = document.getElementById('mpesaCode').value.trim().toUpperCase();
  const phone = document.getElementById('custPhone').value.trim();
  const name = document.getElementById('custName').value.trim();
  if (code.length < 8) { showToast('Enter a valid M-Pesa confirmation code'); return; }
  const del = Number(document.getElementById('zoneSelect').value || 0);
  const total = bag.reduce((s, x) => s + x.price * x.qty, 0) + del;
  const order = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    name, phone, code, total,
    items: bag.map(i => i.name + ' x' + i.qty).join(', '),
    status: 'Pending Verification'
  };
  orders.unshift(order);
  saveOrders();
  bag = [];
  e.target.reset();
  renderBag();
  renderOrders();
  document.getElementById('checkoutDrawer').classList.add('hidden');
  switchView(true);
  showToast('Submitted ' + order.code + ' for manual verification');
});
renderProducts();
renderBag();
renderOrders();`,
  };
}

function atelierEditorialBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'Maison Vesper',
    description: 'Quiet luxury fashion editorial storefront with lookbook filters, size quick-view & shopping bag.',
    summary:
      'Loaded Maison Vesper Atelier — editorial luxury layout with serif/sans pairing, collection filters, quick-view size selection, and interactive bag drawer.',
    designStrategy: 'template_foundation',
    templateId: 'atelier_editorial',
    designDirection:
      'Warm Alabaster (#FAF8F5) canvas, Deep Espresso (#181615) ink, and Champagne Gold (#B8924A) accents for quiet luxury restraint.',
    qaSummary:
      'QA Audit (6/6 checks passed): structure, typography tokens, responsive CSS, self-contained SVGs, JS syntax, and market context verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Customize brand name & pieces',
      'Add private appointment booking',
      'Switch to dark velvet palette',
    ],
    htmlCode: `<header class="header">
  <div class="container nav-row">
    <a href="#lookbook" class="logo">MAISON VESPER</a>
    <nav class="nav-links">
      <button type="button" class="nav-filter active" data-cat="All">All</button>
      <button type="button" class="nav-filter" data-cat="Tailoring">Tailoring</button>
      <button type="button" class="nav-filter" data-cat="Silk">Silk</button>
    </nav>
    <button id="openBagBtn" type="button" class="bag-trigger">Bag (<span id="bagCount">0</span>)</button>
  </div>
</header>
<main class="container">
  <section class="hero">
    <div class="hero-copy">
      <span class="kicker">AUTUMN CAPSULE &bull; EDITION 04</span>
      <h1>Architectural Form in Quiet Natural Fibers</h1>
      <p>Cut in small numbered runs using raw mulberry silk and brushed merino wool with hand-finished interior seams.</p>
      <a href="#lookbook" class="cta-btn">Explore Lookbook</a>
    </div>
    <div class="hero-art">
      <svg viewBox="0 0 240 260" width="240" height="260" aria-hidden="true">
        <rect width="240" height="260" fill="#F2EDE4"/>
        <path d="M85 48 L155 48 L175 112 L152 118 L150 218 L90 218 L88 118 L65 112 Z" fill="#181615"/>
        <path d="M108 48 L120 76 L132 48" fill="none" stroke="#B8924A" stroke-width="2"/>
      </svg>
    </div>
  </section>
  <section id="lookbook" class="lookbook">
    <div class="section-title">
      <h2>Curated Lookbook</h2>
      <span>Numbered Atelier Release</span>
    </div>
    <div id="catalogGrid" class="catalog-grid"></div>
  </section>
</main>
<div id="quickModal" class="modal hidden" role="dialog" aria-modal="true">
  <div class="modal-card">
    <div class="modal-head">
      <h3 id="modalTitle">Piece</h3>
      <button id="closeModalBtn" type="button" class="close-btn">&times;</button>
    </div>
    <p id="modalDesc" class="muted"></p>
    <p id="modalPrice" class="price-lg"></p>
    <div class="sizes" id="sizePicker">
      <button type="button" class="size-btn active" data-size="S">S</button>
      <button type="button" class="size-btn" data-size="M">M</button>
      <button type="button" class="size-btn" data-size="L">L</button>
    </div>
    <button id="modalAddBtn" type="button" class="cta-btn full">Add to Shopping Bag</button>
  </div>
</div>
<aside id="bagDrawer" class="modal hidden">
  <div class="bag-panel">
    <div class="modal-head">
      <h3>Shopping Bag</h3>
      <button id="closeBagBtn" type="button" class="close-btn">&times;</button>
    </div>
    <div id="bagList" class="bag-list"></div>
    <div class="bag-total"><span>Total</span><strong id="bagTotal">$0</strong></div>
  </div>
</aside>
<div id="toast" class="toast hidden"></div>`,
    cssCode: `:root {
  --bg: #FAF8F5; --surface: #FFFFFF; --ink: #181615; --muted: #6C655D; --gold: #B8924A; --border: #EAE5DD;
  --serif: Georgia, 'Times New Roman', serif; --sans: system-ui, -apple-system, sans-serif;
}
body { background: var(--bg); color: var(--ink); font-family: var(--sans); line-height: 1.55; }
.hidden { display: none !important; }
.container { max-width: 1020px; margin: 0 auto; padding: 16px; }
.header { position: sticky; top: 0; background: rgba(250,248,245,0.95); border-bottom: 1px solid var(--border); z-index: 20; }
.nav-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.logo { font-family: var(--serif); letter-spacing: 0.16em; text-decoration: none; color: var(--ink); font-size: 0.95rem; font-weight: 700; }
.nav-links { display: flex; gap: 6px; }
.nav-filter, .bag-trigger, .size-btn {
  background: transparent; border: 1px solid var(--border); color: var(--ink); padding: 6px 12px; cursor: pointer; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase;
}
.nav-filter.active, .size-btn.active { background: var(--ink); color: #FAF8F5; border-color: var(--ink); }
.hero { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: center; padding: 28px 0; border-bottom: 1px solid var(--border); }
.kicker { font-size: 0.72rem; letter-spacing: 0.14em; color: var(--gold); font-weight: 700; }
h1 { font-family: var(--serif); font-weight: 400; font-size: clamp(1.7rem, 3.8vw, 2.8rem); line-height: 1.1; margin: 10px 0 12px; }
.hero p { color: var(--muted); max-width: 46ch; }
.hero-art { display: flex; justify-content: center; }
.cta-btn { display: inline-block; background: var(--ink); color: #FAF8F5; border: none; padding: 12px 20px; text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase; font-size: 0.78rem; cursor: pointer; margin-top: 10px; }
.cta-btn.full { width: 100%; }
.section-title { display: flex; justify-content: space-between; align-items: baseline; margin: 24px 0 14px; }
.section-title h2 { font-family: var(--serif); font-weight: 400; margin: 0; }
.section-title span, .muted { color: var(--muted); font-size: 0.85rem; }
.catalog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.look-card { background: var(--surface); border: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; }
.look-card h3 { font-family: var(--serif); font-weight: 400; margin: 4px 0; font-size: 1.15rem; }
.price-lg { font-variant-numeric: tabular-nums; font-weight: 600; }
.modal { position: fixed; inset: 0; background: rgba(24,22,21,0.48); display: flex; align-items: center; justify-content: center; z-index: 40; padding: 16px; }
.modal-card, .bag-panel { background: var(--surface); border: 1px solid var(--border); width: 100%; max-width: 380px; padding: 20px; }
.modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.close-btn { border: 1px solid var(--border); background: none; width: 32px; height: 32px; cursor: pointer; font-size: 1.1rem; }
.sizes { display: flex; gap: 8px; margin: 12px 0; }
.bag-list { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
.bag-row { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 8px; font-size: 0.9rem; }
.bag-total { display: flex; justify-content: space-between; border-top: 1px solid var(--ink); padding-top: 10px; }
.toast { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%); background: var(--ink); color: #FAF8F5; padding: 10px 18px; font-size: 0.82rem; z-index: 60; }
@media (max-width: 680px) { .hero { grid-template-columns: 1fr; } }`,
    jsCode: `const PIECES = [
  { id: 'v1', name: 'Draped Mulberry Coat', cat: 'Tailoring', price: 890, desc: 'Double-faced wool & silk overcoat with concealed horn buttons.' },
  { id: 'v2', name: 'Pleated Column Trouser', cat: 'Tailoring', price: 420, desc: 'High-waisted wide-leg trouser in crisp virgin wool.' },
  { id: 'v3', name: 'Bias-Cut Evening Slip', cat: 'Silk', price: 640, desc: 'Fluid 22-momme washed silk with delicate shoulder straps.' },
  { id: 'v4', name: 'Structured Atelier Blazer', cat: 'Tailoring', price: 760, desc: 'Softly padded architectural shoulder and hand-basted lapel.' }
];
let cat = 'All', selectedPiece = null, selectedSize = 'S', bag = [];
function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2200); }
function renderCatalog() {
  const items = PIECES.filter(p => cat === 'All' || p.cat === cat);
  document.getElementById('catalogGrid').innerHTML = items.map(p =>
    '<article class="look-card">' +
      '<div>' +
        '<span class="kicker">' + p.cat + '</span>' +
        '<h3>' + p.name + '</h3>' +
        '<p class="muted">' + p.desc + '</p>' +
      '</div>' +
      '<div class="modal-head" style="margin:0">' +
        '<span class="price-lg">$' + p.price + '</span>' +
        '<button type="button" class="nav-filter" onclick="openQuickView(\\'' + p.id + '\\')">Quick View</button>' +
      '</div>' +
    '</article>'
  ).join('');
}
window.openQuickView = function(id) {
  selectedPiece = PIECES.find(p => p.id === id);
  if (!selectedPiece) return;
  document.getElementById('modalTitle').textContent = selectedPiece.name;
  document.getElementById('modalDesc').textContent = selectedPiece.desc;
  document.getElementById('modalPrice').textContent = '$' + selectedPiece.price;
  document.getElementById('quickModal').classList.remove('hidden');
};
function renderBag() {
  document.getElementById('bagCount').textContent = bag.length;
  const total = bag.reduce((s, x) => s + x.price, 0);
  document.getElementById('bagTotal').textContent = '$' + total;
  document.getElementById('bagList').innerHTML = bag.length ? bag.map(b =>
    '<div class="bag-row"><span>' + b.name + ' (' + b.size + ')</span><strong>$' + b.price + '</strong></div>'
  ).join('') : '<p class="muted">Your atelier bag is empty.</p>';
}
document.querySelectorAll('.nav-filter').forEach(btn => btn.addEventListener('click', () => {
  cat = btn.dataset.cat;
  document.querySelectorAll('.nav-filter').forEach(b => b.classList.toggle('active', b === btn));
  renderCatalog();
}));
document.querySelectorAll('.size-btn').forEach(btn => btn.addEventListener('click', () => {
  selectedSize = btn.dataset.size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', b === btn));
}));
document.getElementById('modalAddBtn').addEventListener('click', () => {
  if (!selectedPiece) return;
  bag.push({ ...selectedPiece, size: selectedSize });
  renderBag();
  document.getElementById('quickModal').classList.add('hidden');
  toast(selectedPiece.name + ' (' + selectedSize + ') added');
});
document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('quickModal').classList.add('hidden'));
document.getElementById('openBagBtn').addEventListener('click', () => document.getElementById('bagDrawer').classList.remove('hidden'));
document.getElementById('closeBagBtn').addEventListener('click', () => document.getElementById('bagDrawer').classList.add('hidden'));
renderCatalog();
renderBag();`,
  };
}

function precisionTechBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'PulseMetrics SaaS',
    description: 'Precision SaaS analytics dashboard with interactive SVG trend chart and pricing calculator.',
    summary:
      'Loaded PulseMetrics SaaS — dark slate analytics dashboard with timeframe chart switching and live monthly/annual seat estimator.',
    designStrategy: 'template_foundation',
    templateId: 'precision_tech',
    designDirection:
      'Deep Slate (#0B0F19) base with Indigo (#4F46E5) actions and tabular numerals for engineered SaaS clarity.',
    qaSummary:
      'QA Audit (6/6 checks passed): structure, tokens, responsive CSS, inline SVG chart, balanced JS, and market context verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Add daylight light mode toggle',
      'Add cohort retention table',
      'Customize SaaS brand name',
    ],
    htmlCode: `<header class="nav">
  <div class="wrap nav-in">
    <div class="brand"><span class="dot"></span> PulseMetrics</div>
    <div class="seg" id="rangeSwitch">
      <button type="button" class="seg-btn active" data-range="30d">30D</button>
      <button type="button" class="seg-btn" data-range="90d">90D</button>
      <button type="button" class="seg-btn" data-range="12m">12M</button>
    </div>
  </div>
</header>
<main class="wrap">
  <section class="kpis">
    <article class="kpi"><span>Monthly Recurring</span><strong id="kpiMrr">$84,200</strong><em class="up">+14.2%</em></article>
    <article class="kpi"><span>Net Retention</span><strong id="kpiNrr">118%</strong><em class="up">+3.1%</em></article>
    <article class="kpi"><span>Active Teams</span><strong id="kpiTeams">1,420</strong><em class="up">+9.8%</em></article>
  </section>
  <section class="panel">
    <div class="panel-head">
      <h2>Revenue Trajectory</h2>
      <span id="rangeLabel" class="mono">Last 30 days</span>
    </div>
    <svg id="trendSvg" viewBox="0 0 600 180" width="100%" height="180" aria-label="Revenue chart"></svg>
  </section>
  <section class="panel">
    <div class="panel-head">
      <h2>Plan Calculator</h2>
      <button id="billingToggle" type="button" class="toggle-btn">Billing: Annual (20% off)</button>
    </div>
    <div class="calc-row">
      <label>Seats: <strong id="seatCount" class="mono">15</strong>
        <input id="seatSlider" type="range" min="5" max="100" value="15" />
      </label>
      <div class="price-out">
        <span class="muted">Estimated Total</span>
        <strong id="calcPrice" class="mono">$288 / mo</strong>
      </div>
    </div>
  </section>
</main>`,
    cssCode: `:root { --bg: #0B0F19; --card: #111827; --border: #1E293B; --ink: #F8FAFC; --muted: #94A3B8; --accent: #4F46E5; --ok: #10B981; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; }
.wrap { max-width: 960px; margin: 0 auto; padding: 16px; }
.nav { border-bottom: 1px solid var(--border); background: rgba(11,15,25,0.92); position: sticky; top: 0; }
.nav-in, .panel-head, .calc-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1.05rem; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ok); }
.seg { display: flex; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 3px; }
.seg-btn, .toggle-btn { background: transparent; border: none; color: var(--muted); padding: 6px 12px; border-radius: 7px; cursor: pointer; font-weight: 600; }
.seg-btn.active { background: var(--accent); color: #FFF; }
.toggle-btn { border: 1px solid var(--border); color: var(--ink); background: var(--bg); }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 14px 0; }
.kpi, .panel { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
.kpi { display: flex; flex-direction: column; gap: 4px; }
.kpi span, .muted { color: var(--muted); font-size: 0.82rem; }
.kpi strong { font-size: 1.5rem; font-variant-numeric: tabular-nums; }
.up { color: var(--ok); font-style: normal; font-size: 0.8rem; font-weight: 600; }
.panel { margin-bottom: 14px; }
h2 { font-size: 1.05rem; margin: 0; }
.mono { font-family: ui-monospace, monospace; font-variant-numeric: tabular-nums; color: var(--muted); font-size: 0.85rem; }
.price-out strong { display: block; font-size: 1.4rem; color: var(--ink); }
input[type="range"] { width: 220px; accent-color: var(--accent); display: block; margin-top: 8px; }
@media (max-width: 600px) { input[type="range"] { width: 100%; } }`,
    jsCode: `const DATA = {
  '30d': { label: 'Last 30 days', mrr: '$84,200', nrr: '118%', teams: '1,420', pts: [120, 110, 95, 102, 78, 65, 42] },
  '90d': { label: 'Last 90 days', mrr: '$241,900', nrr: '121%', teams: '1,680', pts: [145, 128, 115, 96, 82, 58, 32] },
  '12m': { label: 'Last 12 months', mrr: '$980,400', nrr: '126%', teams: '2,190', pts: [155, 140, 125, 104, 88, 52, 20] }
};
let isAnnual = true;
function drawChart(range) {
  const d = DATA[range];
  document.getElementById('kpiMrr').textContent = d.mrr;
  document.getElementById('kpiNrr').textContent = d.nrr;
  document.getElementById('kpiTeams').textContent = d.teams;
  document.getElementById('rangeLabel').textContent = d.label;
  const xs = [20, 110, 200, 290, 380, 470, 560];
  const points = d.pts.map((y, i) => xs[i] + ',' + y).join(' ');
  document.getElementById('trendSvg').innerHTML =
    '<polyline fill="none" stroke="#4F46E5" stroke-width="3" points="' + points + '"/>' +
    d.pts.map((y, i) => '<circle cx="' + xs[i] + '" cy="' + y + '" r="4.5" fill="#10B981"/>').join('');
}
function updatePrice() {
  const seats = Number(document.getElementById('seatSlider').value);
  document.getElementById('seatCount').textContent = seats;
  const rate = isAnnual ? 19.2 : 24;
  document.getElementById('calcPrice').textContent = '$' + Math.round(seats * rate) + ' / mo';
}
document.getElementById('rangeSwitch').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-range]');
  if (!btn) return;
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
  drawChart(btn.dataset.range);
});
document.getElementById('billingToggle').addEventListener('click', (e) => {
  isAnnual = !isAnnual;
  e.target.textContent = isAnnual ? 'Billing: Annual (20% off)' : 'Billing: Monthly';
  updatePrice();
});
document.getElementById('seatSlider').addEventListener('input', updatePrice);
drawChart('30d');
updatePrice();`,
  };
}

function culinaryBistroBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'Osteria Solis',
    description: 'Warm editorial bistro with dietary filter menu, order tray, and table booking.',
    summary:
      'Loaded Osteria Solis Bistro — filterable seasonal dishes, live order tray, and instant table reservation confirmation.',
    designStrategy: 'template_foundation',
    templateId: 'culinary_bistro',
    designDirection: 'Warm Cream (#FCF9F3) canvas, Roasted Espresso (#231914) ink, and Terracotta (#B45309) accents.',
    qaSummary:
      'QA Audit (6/6 checks passed): structure, tokens, responsive CSS, inline SVG, JS interactivity, and market fit verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Customize dishes & prices',
      'Add private dining inquiry',
      'Switch currency & city',
    ],
    htmlCode: `<header class="nav">
  <div class="wrap row">
    <span class="brand">Osteria Solis</span>
    <a href="#reserve" class="btn">Book Table</a>
  </div>
</header>
<main class="wrap">
  <section class="hero">
    <span class="pill">Open Tue&ndash;Sun &bull; 12:00 &ndash; 22:30</span>
    <h1>Wood-Fired Seasonal Kitchen &amp; Natural Cellar</h1>
    <p>Handmade pastas, hearth-roasted vegetables, and coastal seafood prepared daily from local farms.</p>
  </section>
  <section class="menu-sec">
    <div class="row">
      <h2>Seasonal Menu</h2>
      <div id="menuTabs" class="tabs">
        <button type="button" class="tab active" data-course="All">All</button>
        <button type="button" class="tab" data-course="Mains">Mains</button>
        <button type="button" class="tab" data-course="Vegan">Vegan</button>
      </div>
    </div>
    <div id="menuList" class="grid"></div>
  </section>
  <section id="reserve" class="reserve-card">
    <h2>Reserve a Table</h2>
    <form id="reserveForm" class="form-grid">
      <input id="guestName" type="text" required placeholder="Full name" />
      <input id="guestCount" type="number" min="1" max="12" value="2" required />
      <input id="guestTime" type="time" value="19:30" required />
      <button type="submit" class="btn">Confirm Reservation</button>
    </form>
    <div id="reserveNote" class="note hidden"></div>
  </section>
</main>`,
    cssCode: `:root { --bg: #FCF9F3; --card: #FFFFFF; --ink: #231914; --muted: #6E5D53; --accent: #B45309; --border: #E7DFD3; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif; line-height: 1.55; }
.hidden { display: none; }
.wrap { max-width: 920px; margin: 0 auto; padding: 16px; }
.nav { border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 0; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.brand { font-family: Georgia, serif; font-size: 1.2rem; font-weight: 700; }
.btn { background: var(--accent); color: #FFF; border: none; border-radius: 999px; padding: 9px 16px; text-decoration: none; font-weight: 600; cursor: pointer; }
.hero { padding: 24px 0; border-bottom: 1px solid var(--border); }
.pill { font-size: 0.78rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
h1 { font-family: Georgia, serif; font-size: clamp(1.7rem, 3.5vw, 2.5rem); margin: 8px 0; line-height: 1.15; }
.hero p { color: var(--muted); max-width: 52ch; }
.tabs { display: flex; gap: 6px; }
.tab { border: 1px solid var(--border); background: var(--card); padding: 6px 12px; border-radius: 999px; cursor: pointer; }
.tab.active { background: var(--ink); color: #FFF; border-color: var(--ink); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 14px 0 24px; }
.dish, .reserve-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; }
.dish h3 { font-family: Georgia, serif; margin: 0 0 6px; font-size: 1.05rem; }
.dish p { color: var(--muted); font-size: 0.86rem; margin: 0 0 8px; }
.tag { font-size: 0.72rem; color: #3F6212; font-weight: 700; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-top: 10px; }
input { padding: 10px; border: 1px solid var(--border); border-radius: 10px; font-size: 0.92rem; }
.note { margin-top: 12px; padding: 10px 12px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; color: #065F46; }
@media (max-width: 600px) { .wrap { padding: 14px; } }`,
    jsCode: `const DISHES = [
  { name: 'Roasted Maitake Polenta', course: 'Vegan', price: '$22', desc: 'Crisp hearth mushrooms, rosemary oil & charred scallion.' },
  { name: 'Tagliolini al Limone', course: 'Mains', price: '$26', desc: 'Hand-cut egg pasta, Meyer lemon butter & aged pecorino.' },
  { name: 'Charred Sea Bass', course: 'Mains', price: '$34', desc: 'Fennel pollen crust, blistered tomatoes & olive jus.' },
  { name: 'Sicilian Citrus Salad', course: 'Vegan', price: '$17', desc: 'Blood orange, shaved fennel & toasted pistachios.' }
];
let course = 'All';
function renderMenu() {
  const list = DISHES.filter(d => course === 'All' || d.course === course);
  document.getElementById('menuList').innerHTML = list.map(d =>
    '<article class="dish">' +
      '<span class="tag">' + d.course + '</span>' +
      '<h3>' + d.name + ' &mdash; ' + d.price + '</h3>' +
      '<p>' + d.desc + '</p>' +
    '</article>'
  ).join('');
}
document.getElementById('menuTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-course]');
  if (!btn) return;
  course = btn.dataset.course;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
  renderMenu();
});
document.getElementById('reserveForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('guestName').value.trim();
  const count = document.getElementById('guestCount').value;
  const time = document.getElementById('guestTime').value;
  const note = document.getElementById('reserveNote');
  note.textContent = 'Table confirmed for ' + name + ' (' + count + ' guests at ' + time + ').';
  note.classList.remove('hidden');
  e.target.reset();
});
renderMenu();`,
  };
}

function corporateAdvisoryBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'Meridian Advisory',
    description: 'Corporate consulting practice site with service pillars, impact KPIs, and consultation booking.',
    summary:
      'Loaded Meridian Advisory — structured ivory & navy B2B consulting layout with service switcher and consultation scheduler.',
    designStrategy: 'template_foundation',
    templateId: 'corporate_advisory',
    designDirection:
      'Crisp Ivory (#FFFFFF) and Cool Off-White (#F4F6FA) paired with Deep Navy (#0F172A) and Cobalt (#1D4ED8).',
    qaSummary:
      'QA Audit (6/6 checks passed): semantic structure, tokens, responsive layout, clean visuals, JS logic, and market alignment verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Add client case studies',
      'Localize to Kenyan corporate firms',
      'Add downloadable brief summary',
    ],
    htmlCode: `<header class="bar">
  <div class="wrap row">
    <strong>Meridian Advisory</strong>
    <a href="#consult" class="cta">Request Consultation</a>
  </div>
</header>
<main class="wrap">
  <section class="hero">
    <span class="eyebrow">Strategic Finance &amp; Operations</span>
    <h1>Clarity for High-Stakes Capital &amp; Growth Decisions</h1>
    <p>We partner with leadership teams on unit economics, treasury governance, and operational scale.</p>
    <div class="stats">
      <div><strong>$2.4B</strong><span>Capital Advised</span></div>
      <div><strong>94%</strong><span>Client Retention</span></div>
      <div><strong>18 wks</strong><span>Avg. ROI Horizon</span></div>
    </div>
  </section>
  <section class="pillars">
    <div id="pillarTabs" class="tabs">
      <button type="button" class="tab active" data-idx="0">Capital Strategy</button>
      <button type="button" class="tab" data-idx="1">Risk &amp; Compliance</button>
      <button type="button" class="tab" data-idx="2">M&amp;A Readiness</button>
    </div>
    <div id="pillarBody" class="card"></div>
  </section>
  <section id="consult" class="card">
    <h2>Book an Executive Briefing</h2>
    <form id="consultForm" class="form">
      <input id="orgInput" type="text" required placeholder="Company or organization" />
      <input id="emailInput" type="email" required placeholder="Work email" />
      <button type="submit" class="cta">Schedule Briefing</button>
    </form>
    <p id="consultConfirm" class="ok hidden"></p>
  </section>
</main>`,
    cssCode: `:root { --bg: #F4F6FA; --card: #FFFFFF; --ink: #0F172A; --muted: #475569; --accent: #1D4ED8; --border: #E2E8F0; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif; line-height: 1.6; }
.hidden { display: none; }
.wrap { max-width: 960px; margin: 0 auto; padding: 16px; }
.bar { background: var(--card); border-bottom: 1px solid var(--border); position: sticky; top: 0; }
.row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.cta { background: var(--accent); color: #FFF; border: none; border-radius: 8px; padding: 9px 16px; text-decoration: none; font-weight: 600; cursor: pointer; }
.hero { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 24px; margin: 12px 0; }
.eyebrow { color: var(--accent); font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; }
h1 { font-size: clamp(1.6rem, 3.2vw, 2.3rem); line-height: 1.15; margin: 8px 0; }
.hero p { color: var(--muted); max-width: 56ch; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 18px; border-top: 1px solid var(--border); padding-top: 14px; }
.stats strong { display: block; font-size: 1.4rem; }
.stats span { color: var(--muted); font-size: 0.84rem; }
.tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.tab { border: 1px solid var(--border); background: var(--card); color: var(--ink); padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.tab.active { background: var(--ink); color: #FFF; border-color: var(--ink); }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
.form { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-top: 10px; }
input { padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.92rem; }
.ok { color: #166534; background: #DCFCE7; padding: 10px; border-radius: 8px; margin-top: 10px; }
@media (max-width: 600px) { .hero { padding: 18px; } }`,
    jsCode: `const PILLARS = [
  { title: 'Capital Allocation & Runway Modeling', body: 'Board-ready 36-month scenario models, working capital optimization, and structured debt advisory.' },
  { title: 'Enterprise Risk & Regulatory Controls', body: 'Automated audit readiness, internal control frameworks, and regional compliance playbooks.' },
  { title: 'Cross-Border M&A Diligence', body: 'Commercial quality-of-earnings reviews and 100-day post-merger integration blueprints.' }
];
function selectPillar(idx) {
  const p = PILLARS[idx] || PILLARS[0];
  document.getElementById('pillarBody').innerHTML = '<h3>' + p.title + '</h3><p style="color:#475569;margin:6px 0 0">' + p.body + '</p>';
}
document.getElementById('pillarTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-idx]');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
  selectPillar(Number(btn.dataset.idx));
});
document.getElementById('consultForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const org = document.getElementById('orgInput').value.trim();
  const el = document.getElementById('consultConfirm');
  el.textContent = 'Briefing scheduled for ' + org + '. Our senior partner team will respond within 1 business day.';
  el.classList.remove('hidden');
  e.target.reset();
});
selectPillar(0);`,
  };
}

function tactileUtilityBundle(): GeneratedAppBundle {
  return {
    projectTitle: 'FlowLedger Tool',
    description: 'Focused bill & expense tracker utility with instant category breakdown and local persistence.',
    summary: 'Loaded FlowLedger Utility — fast add/delete expense rows, live totals, and localStorage persistence.',
    designStrategy: 'template_foundation',
    templateId: 'tactile_utility',
    designDirection: 'Soft Neutral (#F5F6F8) workspace with Cobalt (#2563EB) actions and crisp tabular totals.',
    qaSummary:
      'QA Audit (6/6 checks passed): structure, tokens, responsive CSS, self-contained visuals, JS syntax, and market context verified.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Switch currency to KSh',
      'Add CSV export download',
      'Add monthly budget target',
    ],
    htmlCode: `<header class="head">
  <div class="wrap row">
    <h1>FlowLedger</h1>
    <button id="clearAllBtn" type="button" class="ghost">Reset</button>
  </div>
</header>
<main class="wrap">
  <section class="summary">
    <div><span>Total Logged</span><strong id="totalAmount">$0.00</strong></div>
    <div><span>Entries</span><strong id="entryCount">0</strong></div>
  </section>
  <section class="panel">
    <form id="entryForm" class="entry-form">
      <input id="labelInput" type="text" required placeholder="Expense or split description" />
      <input id="amountInput" type="number" step="0.01" min="0.01" required placeholder="Amount" />
      <select id="catInput">
        <option value="Operations">Operations</option>
        <option value="Supplies">Supplies</option>
        <option value="Travel">Travel</option>
      </select>
      <button type="submit" class="primary">Add Entry</button>
    </form>
  </section>
  <section id="listWrap" class="list"></section>
</main>`,
    cssCode: `:root { --bg: #F5F6F8; --card: #FFFFFF; --ink: #0F172A; --muted: #64748B; --accent: #2563EB; --border: #E2E8F0; }
body { background: var(--bg); color: var(--ink); font-family: system-ui, sans-serif; }
.wrap { max-width: 720px; margin: 0 auto; padding: 16px; }
.head { background: var(--card); border-bottom: 1px solid var(--border); }
.row { display: flex; justify-content: space-between; align-items: center; }
h1 { font-size: 1.2rem; margin: 0; }
.ghost { border: 1px solid var(--border); background: transparent; padding: 6px 12px; border-radius: 8px; cursor: pointer; }
.summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
.summary > div, .panel, .item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
.summary span { display: block; color: var(--muted); font-size: 0.82rem; }
.summary strong { font-size: 1.4rem; font-variant-numeric: tabular-nums; }
.entry-form { display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 8px; }
input, select { padding: 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 0.92rem; }
.primary { background: var(--accent); color: #FFF; border: none; border-radius: 8px; padding: 10px 14px; font-weight: 600; cursor: pointer; }
.list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.item { display: flex; justify-content: space-between; align-items: center; }
.del { border: 1px solid var(--border); background: #FFF; color: #DC2626; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
@media (max-width: 640px) { .entry-form { grid-template-columns: 1fr; } }`,
    jsCode: `let items = JSON.parse(localStorage.getItem('flowledger_items') || 'null') || [
  { id: 1, label: 'Studio Packaging Roll', amount: 42.50, cat: 'Supplies' },
  { id: 2, label: 'Courier Dispatch Batch', amount: 18.00, cat: 'Operations' }
];
function save() { localStorage.setItem('flowledger_items', JSON.stringify(items)); }
function render() {
  const total = items.reduce((s, x) => s + Number(x.amount), 0);
  document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
  document.getElementById('entryCount').textContent = items.length;
  document.getElementById('listWrap').innerHTML = items.length ? items.map(i =>
    '<div class="item">' +
      '<div><strong>' + i.label + '</strong><div style="font-size:0.8rem;color:#64748B">' + i.cat + '</div></div>' +
      '<div class="row" style="gap:10px">' +
        '<strong>$' + Number(i.amount).toFixed(2) + '</strong>' +
        '<button type="button" class="del" onclick="removeItem(' + i.id + ')">Remove</button>' +
      '</div>' +
    '</div>'
  ).join('') : '<div class="item">No entries yet. Add your first expense above.</div>';
}
window.removeItem = function(id) { items = items.filter(i => i.id !== id); save(); render(); };
document.getElementById('entryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  items.unshift({
    id: Date.now(),
    label: document.getElementById('labelInput').value.trim(),
    amount: Number(document.getElementById('amountInput').value),
    cat: document.getElementById('catInput').value
  });
  save(); e.target.reset(); render();
});
document.getElementById('clearAllBtn').addEventListener('click', () => { items = []; save(); render(); });
render();`,
  };
}

function gameStudio3DBundle(): GeneratedAppBundle {
  return {
    projectTitle: '3D Game Studio',
    description:
      'Indie 3D game engine with real Z-depth perspective projection, directional lighting, distance fog, 3D particles, procedural SFX, and 4 playable 3D modes.',
    summary:
      'Loaded 3D Game Studio — featuring a real perspective 3D projection engine with shaded 3D geometry, atmospheric fog, depth sorting, 3D particle bursts, Web Audio SFX, and 4 playable 3D modes (Sky Obby, Neon Trench Run, Starfighter Trench, and 3D Tower Stack).',
    designStrategy: 'template_foundation',
    templateId: '3d_game_studio',
    designDirection:
      'Synchronized Cyber Grid 3D / Solar Canyon 3D / Void Nebula 3D themes pairing glassmorphic HUD controls with true 3D Z-depth perspective rendering.',
    qaSummary:
      'QA Audit (6/6 checks passed): semantic structure, theme tokens, responsive 16:10 3D canvas, zero external CDNs, balanced JS + Web Audio SFX, and polished Title/Game Over cards.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Add a 3D boss ship with shield rings to Starfighter Trench',
      'Add moving 3D bounce pads to 3D Sky Obby',
      'Customize the 3D world theme and hero vehicle colors',
    ],
    htmlCode: `<header class="studio-bar">
  <div class="container bar-inner">
    <div class="brand-wrap">
      <div class="brand-badge" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.5L20 7v10l-8 4.5L4 17V7l8-4.5z" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>
          <path d="M12 11.5L20 7M12 11.5V21.5M12 11.5L4 7" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>
        <h1>3D Game Studio</h1>
        <span class="sub">Zuno AI 3D Engine &bull; Keyboard + Touch</span>
      </div>
    </div>
    <div class="controls-inline">
      <button id="soundToggleBtn" type="button" class="icon-pill" aria-label="Toggle sound effects">SFX: ON</button>
      <select id="difficultySelect" aria-label="Difficulty">
        <option value="easy">Easy</option>
        <option value="normal" selected>Normal</option>
        <option value="hard">Hard</option>
      </select>
      <select id="paletteSelect" aria-label="3D World Theme">
        <option value="cyber" selected>Cyber Grid 3D</option>
        <option value="solar">Solar Canyon 3D</option>
        <option value="nebula">Void Nebula 3D</option>
      </select>
    </div>
  </div>
</header>

<main class="container game-shell">
  <section class="mode-strip" aria-label="3D Game mode selector">
    <div id="modeTabs" class="mode-tabs" role="tablist">
      <button type="button" class="mode-btn active" data-mode="obby">3D Sky Obby</button>
      <button type="button" class="mode-btn" data-mode="runner">3D Neon Run</button>
      <button type="button" class="mode-btn" data-mode="arcade">3D Star Trench</button>
      <button type="button" class="mode-btn" data-mode="stack">3D Tower Stack</button>
    </div>
    <div class="hud-pills">
      <div class="hud-pill">
        <span class="hud-label">Score</span>
        <strong id="scoreVal" class="hud-num">0</strong>
      </div>
      <div class="hud-pill">
        <span class="hud-label">Best</span>
        <strong id="bestVal" class="hud-num gold">0</strong>
      </div>
      <div class="hud-pill">
        <span id="statusLabel" class="hud-label">Lives</span>
        <strong id="livesVal" class="hud-num">&#9829; &#9829; &#9829;</strong>
      </div>
      <div class="hud-pill compact">
        <span class="hud-label">Lvl</span>
        <strong id="levelVal" class="hud-num">1</strong>
      </div>
    </div>
  </section>

  <section class="stage-card">
    <div class="canvas-frame" id="canvasFrame" tabindex="0">
      <canvas id="gameCanvas" width="640" height="380" aria-label="3D Perspective Game Canvas"></canvas>
      <div id="stageOverlay" class="stage-overlay">
        <div class="overlay-card">
          <div class="overlay-badges">
            <span id="overlayTag" class="overlay-tag">3D SKY OBBY</span>
            <span id="recordBadge" class="record-badge hidden">NEW RECORD!</span>
          </div>
          <h2 id="overlayTitle">Apex Sky Obby 3D</h2>
          <p id="overlayDesc">Pilot your 3D hover-runner down floating sky islands, gather spinning 3D crystals, dodge sentinel drones, and enter the warp gate.</p>
          <div id="summaryStats" class="summary-stats hidden">
            <div class="stat-box"><span>Score</span><strong id="sumScore">0</strong></div>
            <div class="stat-box"><span>Best</span><strong id="sumBest">0</strong></div>
            <div class="stat-box"><span id="sumMetaLabel">Level</span><strong id="sumMetaVal">1</strong></div>
          </div>
          <div class="key-hints">
            <span class="key-chip">Arrows / WASD</span>
            <span class="key-chip">Space: 3D Action</span>
            <span class="key-chip">Touch D-Pad</span>
          </div>
          <div class="overlay-actions">
            <button id="primaryPlayBtn" type="button" class="btn-play">Launch 3D Game</button>
            <button id="restartBtn" type="button" class="btn-ghost">Restart</button>
          </div>
        </div>
      </div>
    </div>
    <div class="stage-footer">
      <span id="hintText" class="hint-text">Desktop: Arrows / WASD + Space &bull; P to Pause &bull; Tap stage to focus</span>
      <div class="footer-btns">
        <button id="pauseBtn" type="button" class="btn-small">Pause</button>
        <button id="quickResetBtn" type="button" class="btn-small">Reset</button>
      </div>
    </div>
  </section>

  <section class="touch-deck" aria-label="Mobile touch controls">
    <div class="dpad" aria-label="3D directional pad">
      <span class="dpad-spacer"></span>
      <button type="button" class="pad-btn" data-key="up" aria-label="Forward or Up">&#9650;</button>
      <span class="dpad-spacer"></span>
      <button type="button" class="pad-btn" data-key="left" aria-label="Strafe Left">&#9664;</button>
      <button type="button" class="pad-btn" data-key="down" aria-label="Back or Down">&#9660;</button>
      <button type="button" class="pad-btn" data-key="right" aria-label="Strafe Right">&#9654;</button>
    </div>
    <div class="action-cluster">
      <button id="actionBtn" type="button" class="action-btn">
        <span id="actionLabel">JUMP 3D</span>
        <small>TAP / HOLD</small>
      </button>
    </div>
  </section>
</main>`,
    cssCode: `:root {
  --bg: #070B18;
  --surface: #11182D;
  --surface-2: #1B2544;
  --ink: #F8FAFC;
  --muted: #94A3B8;
  --accent: #38BDF8;
  --accent-glow: rgba(56, 189, 248, 0.38);
  --cta: #FF5E5B;
  --cta-glow: rgba(255, 94, 91, 0.38);
  --gold: #FBBF24;
  --border: rgba(148, 163, 184, 0.2);
}
body[data-theme="solar"] {
  --bg: #140B0A;
  --surface: #231412;
  --surface-2: #361F1B;
  --accent: #FB923C;
  --accent-glow: rgba(251, 146, 60, 0.38);
  --cta: #F59E0B;
  --cta-glow: rgba(245, 158, 11, 0.38);
}
body[data-theme="nebula"] {
  --bg: #090616;
  --surface: #140F2B;
  --surface-2: #221A46;
  --accent: #A78BFA;
  --accent-glow: rgba(167, 139, 250, 0.38);
  --cta: #EC4899;
  --cta-glow: rgba(236, 72, 153, 0.4);
}
body {
  background: radial-gradient(circle at 50% -10%, var(--surface-2) 0%, var(--bg) 64%);
  color: var(--ink);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.45;
  min-height: 100vh;
  user-select: none;
}
.hidden { display: none !important; }
.container { max-width: 860px; margin: 0 auto; padding: 12px 14px; }
.studio-bar {
  background: rgba(7, 11, 24, 0.84);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 25;
}
.bar-inner { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.brand-wrap { display: flex; align-items: center; gap: 10px; }
.brand-badge {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, var(--accent), #6366F1);
  color: #06101D;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px var(--accent-glow);
}
h1 { margin: 0; font-size: clamp(1rem, 2.3vw, 1.18rem); font-weight: 800; letter-spacing: -0.02em; }
.sub { display: block; font-size: 0.72rem; color: var(--muted); }
.controls-inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
select, .icon-pill {
  min-height: 38px; padding: 6px 10px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--ink);
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.icon-pill.muted { color: var(--muted); opacity: 0.78; }
.game-shell { display: flex; flex-direction: column; gap: 12px; }
.mode-strip { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.mode-tabs {
  display: flex; gap: 5px; flex-wrap: wrap;
  background: var(--surface); border: 1px solid var(--border); padding: 4px; border-radius: 13px;
}
.mode-btn {
  min-height: 38px; padding: 7px 11px; border-radius: 9px; border: none;
  background: transparent; color: var(--muted); font-size: 0.8rem; font-weight: 700;
  cursor: pointer; transition: all 140ms ease;
}
.mode-btn.active {
  background: var(--accent); color: #05131E;
  box-shadow: 0 3px 12px var(--accent-glow);
}
.hud-pills { display: flex; gap: 7px; flex-wrap: wrap; }
.hud-pill {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 5px 11px; display: flex; align-items: baseline; gap: 6px;
}
.hud-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 700; }
.hud-num { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.98rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.hud-num.gold { color: var(--gold); }
.stage-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
  padding: 10px; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.42);
}
.canvas-frame {
  position: relative; width: 100%; border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12); background: #040712; outline: none;
}
canvas { display: block; width: 100%; height: auto; aspect-ratio: 640 / 380; touch-action: none; }
.stage-overlay {
  position: absolute; inset: 0; background: rgba(5, 8, 18, 0.7); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 14px;
}
.overlay-card {
  width: 100%; max-width: 440px;
  background: rgba(15, 22, 42, 0.92); border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px; padding: 18px 20px; text-align: center;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.58);
  display: flex; flex-direction: column; align-items: center; gap: 9px;
}
.overlay-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.overlay-tag {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; color: var(--accent);
  background: rgba(56, 189, 248, 0.14); border: 1px solid var(--accent-glow);
  padding: 3px 10px; border-radius: 999px;
}
.record-badge {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; color: #1F1400;
  background: var(--gold); padding: 3px 10px; border-radius: 999px;
}
.overlay-card h2 { margin: 0; font-size: clamp(1.15rem, 3vw, 1.55rem); font-weight: 800; letter-spacing: -0.02em; }
.overlay-card p { margin: 0; font-size: 0.86rem; color: var(--muted); max-width: 40ch; }
.summary-stats { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 2px 0; }
.stat-box { background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border); border-radius: 12px; padding: 8px 6px; }
.stat-box span { display: block; font-size: 0.68rem; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.stat-box strong { font-family: ui-monospace, monospace; font-size: 1.05rem; }
.key-hints { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.key-chip { font-size: 0.7rem; font-weight: 600; color: var(--muted); background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 3px 8px; border-radius: 7px; }
.overlay-actions { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; justify-content: center; }
.btn-play {
  min-height: 44px; padding: 10px 24px; border-radius: 12px; border: none;
  background: var(--cta); color: #FFFFFF; font-weight: 800; font-size: 0.94rem;
  cursor: pointer; box-shadow: 0 8px 22px var(--cta-glow);
}
.btn-ghost, .btn-small {
  min-height: 40px; padding: 8px 14px; border-radius: 11px;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--ink);
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.stage-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 9px; flex-wrap: wrap; }
.hint-text { font-size: 0.75rem; color: var(--muted); }
.footer-btns { display: flex; gap: 6px; margin-left: auto; }
.touch-deck {
  background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
  padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px;
}
.dpad { display: grid; grid-template-columns: repeat(3, 48px); grid-template-rows: repeat(2, 46px); gap: 6px; }
.dpad-spacer { pointer-events: none; }
.pad-btn {
  min-height: 46px; border-radius: 13px; border: 1px solid var(--border);
  background: linear-gradient(180deg, var(--surface-2), var(--bg)); color: var(--ink);
  font-size: 1rem; font-weight: 700; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.35);
}
.pad-btn:active, .pad-btn.pressed { background: var(--accent); color: #05131C; transform: translateY(2px); box-shadow: none; }
.action-btn {
  min-width: 136px; min-height: 64px; padding: 10px 18px; border-radius: 18px; border: none;
  background: linear-gradient(135deg, var(--cta), #FF7A59); color: #FFFFFF;
  font-weight: 800; font-size: 0.96rem; cursor: pointer; touch-action: manipulation;
  box-shadow: 0 8px 24px var(--cta-glow); display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.action-btn small { font-size: 0.62rem; letter-spacing: 0.08em; opacity: 0.85; font-weight: 700; }
.action-btn:active { transform: scale(0.96); }
@media (max-width: 620px) {
  .container { padding: 10px; }
  .overlay-card { padding: 14px; }
  .key-hints { display: none; }
  .dpad { grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(2, 44px); }
  .action-btn { min-width: 112px; min-height: 56px; font-size: 0.88rem; }
  .hint-text { display: none; }
}`,
    jsCode: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 640, H = 380;
const FOV = 370;

const PALETTES = {
  cyber: {
    skyTop: '#050816', skyBot: '#141B3A', sun: '#38BDF8', grid: 'rgba(56, 189, 248, 0.22)',
    platTop: '#38BDF8', platFront: '#1E3A5F', platSide: '#0F233D',
    heroTop: '#7DD3FC', heroFront: '#0284C7', heroSide: '#0369A1',
    enemyTop: '#FB7185', enemyFront: '#E11D48', enemySide: '#9F1239',
    crystal: '#FBBF24', portal: '#10B981', stackColors: ['#38BDF8','#818CF8','#C084FC','#F472B6','#FB7185','#FBBF24','#34D399']
  },
  solar: {
    skyTop: '#160908', skyBot: '#3A1B14', sun: '#FDBA74', grid: 'rgba(251, 146, 60, 0.22)',
    platTop: '#F59E0B', platFront: '#7C2D12', platSide: '#431407',
    heroTop: '#FEF08A', heroFront: '#EA580C', heroSide: '#9A3412',
    enemyTop: '#F43F5E', enemyFront: '#BE123C', enemySide: '#881337',
    crystal: '#38BDF8', portal: '#34D399', stackColors: ['#F59E0B','#FB923C','#F43F5E','#EC4899','#A855F7','#38BDF8','#22C55E']
  },
  nebula: {
    skyTop: '#070415', skyBot: '#1E113E', sun: '#C084FC', grid: 'rgba(167, 139, 250, 0.24)',
    platTop: '#A78BFA', platFront: '#3B236E', platSide: '#231347',
    heroTop: '#F9A8D4', heroFront: '#DB2777', heroSide: '#9D174D',
    enemyTop: '#FB923C', enemyFront: '#EA580C', enemySide: '#9A3412',
    crystal: '#FDE047', portal: '#2DD4BF', stackColors: ['#A78BFA','#EC4899','#38BDF8','#34D399','#FBBF24','#F87171','#818CF8']
  }
};

const DIFFICULTY = {
  easy: { speed: 0.82, enemySpeed: 0.78 },
  normal: { speed: 1.0, enemySpeed: 1.0 },
  hard: { speed: 1.24, enemySpeed: 1.3 }
};

const MODE_INFO = {
  obby: { tag: '3D SKY OBBY', title: 'Apex Sky Obby 3D', desc: 'Move forward & sideways across 3D floating sky islands, jump gaps, grab 3D crystals, and reach the emerald warp gate!', action: 'JUMP 3D' },
  runner: { tag: '3D NEON RUN', title: 'Hyper Trench Runner 3D', desc: 'Dash down the 3D neon track! Weave across 3 lanes, leap barriers, and collect spinning 3D gems.', action: 'JUMP 3D' },
  arcade: { tag: '3D STAR TRENCH', title: 'Nebula Starfighter 3D', desc: 'Fly your 3D starfighter in X/Y space and fire twin 3D plasma bolts down the Z-trench at incoming meteors!', action: 'FIRE 3D' },
  stack: { tag: '3D TOWER STACK', title: 'Skyline 3D Stacker', desc: 'Time each drop with Space or the Action button to stack shaded 3D slabs sky-high and build your tower!', action: 'DROP 3D' }
};

const STARS_3D = Array.from({ length: 42 }, (_, i) => ({
  x: ((i * 73) % 440) - 220,
  y: ((i * 41) % 220) - 110,
  z: 8 + ((i * 19) % 120)
}));

const keys = { left: false, right: false, up: false, down: false, action: false };
let mode = 'obby';
let difficulty = 'normal';
let paletteKey = 'cyber';
let status = 'ready';
let soundEnabled = true;
let score = 0;
let lives = 3;
let level = 1;
let elapsed = 0;
let shakeTime = 0;
let shakeMag = 0;
let lastTime = 0;
let audioCtx = null;
let bestScores = {};
try { bestScores = JSON.parse(localStorage.getItem('zuno_3d_best') || '{}'); } catch (e) { bestScores = {}; }

let particles3D = [];
let popups3D = [];
let obbyState = null;
let runnerState = null;
let arcadeState = null;
let stackState = null;

const scoreEl = document.getElementById('scoreVal');
const bestEl = document.getElementById('bestVal');
const livesEl = document.getElementById('livesVal');
const levelEl = document.getElementById('levelVal');
const statusLabelEl = document.getElementById('statusLabel');
const overlayEl = document.getElementById('stageOverlay');
const overlayTagEl = document.getElementById('overlayTag');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlayDescEl = document.getElementById('overlayDesc');
const recordBadgeEl = document.getElementById('recordBadge');
const summaryStatsEl = document.getElementById('summaryStats');
const sumScoreEl = document.getElementById('sumScore');
const sumBestEl = document.getElementById('sumBest');
const sumMetaLabelEl = document.getElementById('sumMetaLabel');
const sumMetaValEl = document.getElementById('sumMetaVal');
const playBtn = document.getElementById('primaryPlayBtn');
const actionLabelEl = document.getElementById('actionLabel');
const soundToggleBtn = document.getElementById('soundToggleBtn');

function playSfx(type) {
  if (!soundEnabled) return;
  try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) audioCtx = new AudioCtor();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.11);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.setValueAtTime(980, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.09);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'portal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(587, now + 0.06);
      osc.frequency.setValueAtTime(784, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now); osc.stop(now + 0.24);
    }
  } catch (e) {}
}

function addBurst3D(x, y, z, color, count) {
  for (let i = 0; i < count; i++) {
    particles3D.push({
      x, y, z,
      vx: (Math.random() - 0.5) * 8,
      vy: 1.5 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 8,
      life: 0.5 + Math.random() * 0.25,
      maxLife: 0.75,
      color
    });
  }
}

function addPopup3D(x, y, z, text, color) {
  popups3D.push({ x, y, z, text, color, life: 0.9, maxLife: 0.9 });
}

function triggerShake(mag, dur) {
  shakeMag = mag;
  shakeTime = dur;
}

function saveBest() {
  const prev = bestScores[mode] || 0;
  if (score > prev) {
    bestScores[mode] = score;
    try { localStorage.setItem('zuno_3d_best', JSON.stringify(bestScores)); } catch (e) {}
    return true;
  }
  return false;
}

function updateHud() {
  scoreEl.textContent = score;
  bestEl.textContent = Math.max(score, bestScores[mode] || 0);
  levelEl.textContent = level;
  if (mode === 'stack') {
    statusLabelEl.textContent = 'Streak';
    livesEl.textContent = stackState ? stackState.streak + 'x' : '0x';
  } else {
    statusLabelEl.textContent = 'Lives';
    livesEl.textContent = lives > 0 ? Array.from({ length: lives }, () => '\u2665').join(' ') : '0';
  }
  actionLabelEl.textContent = MODE_INFO[mode].action;
}

function showOverlay(tag, title, desc, btnLabel, showStats, isNewRecord) {
  overlayTagEl.textContent = tag;
  overlayTitleEl.textContent = title;
  overlayDescEl.textContent = desc;
  playBtn.textContent = btnLabel;
  recordBadgeEl.classList.toggle('hidden', !isNewRecord);
  summaryStatsEl.classList.toggle('hidden', !showStats);
  if (showStats) {
    sumScoreEl.textContent = score;
    sumBestEl.textContent = Math.max(score, bestScores[mode] || 0);
    sumMetaLabelEl.textContent = mode === 'stack' ? 'Height' : 'Level';
    sumMetaValEl.textContent = mode === 'stack' && stackState ? stackState.blocks.length : level;
  }
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

function project(wx, wy, wz, cam) {
  const dz = wz - cam.z;
  if (dz <= 0.35) return null;
  const dx = wx - cam.x;
  const dy = wy - cam.y;
  const pitchOffset = (cam.pitch || 0) * dz;
  const scale = FOV / dz;
  return {
    sx: W / 2 + dx * scale,
    sy: H * 0.56 - (dy - pitchOffset) * scale,
    scale,
    dz
  };
}

function fillPoly(pts, color, strokeColor) {
  ctx.beginPath();
  ctx.moveTo(pts[0].sx, pts[0].sy);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawBox3D(x, y, z, w, h, d, cam, topCol, frontCol, sideCol, edgeCol) {
  const hw = w / 2, hd = d / 2;
  const corners = [
    project(x - hw, y + h, z - hd, cam),
    project(x + hw, y + h, z - hd, cam),
    project(x + hw, y + h, z + hd, cam),
    project(x - hw, y + h, z + hd, cam),
    project(x - hw, y, z - hd, cam),
    project(x + hw, y, z - hd, cam),
    project(x + hw, y, z + hd, cam),
    project(x - hw, y, z + hd, cam)
  ];
  if (corners.some((c) => !c)) return;
  const distAlpha = Math.max(0.18, Math.min(1, 1 - (z - cam.z) / 95));
  ctx.save();
  ctx.globalAlpha *= distAlpha;
  if (x > cam.x + hw * 0.4) {
    fillPoly([corners[0], corners[3], corners[7], corners[4]], sideCol, edgeCol);
  } else if (x < cam.x - hw * 0.4) {
    fillPoly([corners[1], corners[2], corners[6], corners[5]], sideCol, edgeCol);
  }
  if (cam.y > y + h * 0.5) {
    fillPoly([corners[0], corners[1], corners[2], corners[3]], topCol, edgeCol);
  }
  fillPoly([corners[0], corners[1], corners[5], corners[4]], frontCol, edgeCol);
  ctx.restore();
}

function drawCrystal3D(x, y, z, cam, col) {
  const bob = Math.sin(elapsed * 4.5 + z) * 0.25;
  const spin = elapsed * 2.8 + x;
  const r = 0.55;
  const top = project(x, y + 0.9 + bob, z, cam);
  const bot = project(x, y - 0.7 + bob, z, cam);
  const left = project(x + Math.cos(spin) * r, y + 0.1 + bob, z + Math.sin(spin) * r, cam);
  const right = project(x - Math.cos(spin) * r, y + 0.1 + bob, z - Math.sin(spin) * r, cam);
  const front = project(x - Math.sin(spin) * r, y + 0.1 + bob, z + Math.cos(spin) * r, cam);
  if (!top || !bot || !left || !right || !front) return;
  fillPoly([top, left, front], col, '#FEF9C3');
  fillPoly([top, front, right], '#FDE047', '#FEF9C3');
  fillPoly([bot, left, front], '#D97706', null);
  fillPoly([bot, front, right], '#B45309', null);
}

function initObby(keepScore) {
  if (!keepScore) { score = 0; lives = 3; level = 1; }
  const zigzag = (level % 2 === 0 ? -1 : 1);
  obbyState = {
    x: 0, y: 0.4, z: 4, vx: 0, vy: 0, vz: 0, onGround: true, invuln: 0,
    platforms: [
      { x: 0, y: -0.6, z: 7, w: 6.5, h: 0.9, d: 11 },
      { x: 1.8 * zigzag, y: 0.4, z: 18, w: 4.8, h: 0.9, d: 8 },
      { x: -1.6 * zigzag, y: 1.4, z: 28, w: 4.8, h: 0.9, d: 8 },
      { x: 1.4 * zigzag, y: 2.3, z: 38, w: 5.2, h: 0.9, d: 9 },
      { x: 0, y: 3.1, z: 50, w: 6.5, h: 1.0, d: 10 }
    ],
    crystals: [
      { x: 0, y: 1.2, z: 10, got: false },
      { x: 1.8 * zigzag, y: 2.2, z: 18, got: false },
      { x: -1.6 * zigzag, y: 3.1, z: 28, got: false },
      { x: 1.4 * zigzag, y: 4.0, z: 38, got: false }
    ],
    drones: [
      { x: 1.8 * zigzag, y: 1.7, z: 19, minX: 1.8 * zigzag - 2.1, maxX: 1.8 * zigzag + 2.1, dir: 1 },
      { x: 1.4 * zigzag, y: 3.6, z: 39, minX: 1.4 * zigzag - 2.2, maxX: 1.4 * zigzag + 2.2, dir: -1 }
    ],
    portal: { x: 0, y: 4.2, z: 53 }
  };
}

function initRunner() {
  score = 0; lives = 3; level = 1;
  runnerState = {
    laneX: 0, x: 0, y: 0, vy: 0, onGround: true, duckTimer: 0, invuln: 0,
    speed: 22, scrollZ: 0, spawnZ: 34, obstacles: [], crystals: []
  };
}

function initArcade() {
  score = 0; lives = 3; level = 1;
  arcadeState = {
    x: 0, y: 0, vx: 0, vy: 0, fireCooldown: 0, spawnTimer: 0.4,
    bullets: [], meteors: [], stars: []
  };
}

function initStack() {
  score = 0; lives = 1; level = 1;
  stackState = {
    blocks: [{ x: 0, z: 0, w: 4.4, d: 4.4, colorIdx: 0 }],
    active: { x: -4.2, z: 0, w: 4.4, d: 4.4, dir: 1, axis: 'x', speed: 4.8 },
    camY: 2.8,
    streak: 0,
    dropLock: false
  };
}

function resetGame(autoPlay) {
  particles3D = [];
  popups3D = [];
  shakeTime = 0;
  if (mode === 'obby') initObby(false);
  else if (mode === 'runner') initRunner();
  else if (mode === 'arcade') initArcade();
  else initStack();
  updateHud();
  if (autoPlay) {
    status = 'playing';
    hideOverlay();
    document.getElementById('canvasFrame').focus();
  } else {
    status = 'ready';
    const info = MODE_INFO[mode];
    showOverlay(info.tag, info.title, info.desc, 'Launch 3D Game', false, false);
  }
}

function triggerGameOver(reason) {
  status = 'gameover';
  const prevBest = bestScores[mode] || 0;
  const isNew = score > 0 && score > prevBest;
  saveBest();
  updateHud();
  showOverlay('GAME OVER', '3D Run Complete', reason, 'Play Again', true, isNew);
}

function dropStackBlock() {
  if (status !== 'playing' || mode !== 'stack' || !stackState) return;
  const s = stackState;
  const top = s.blocks[s.blocks.length - 1];
  const cur = s.active;
  const diffX = cur.x - top.x;
  const diffZ = cur.z - top.z;
  const overlapW = Math.min(cur.x + cur.w / 2, top.x + top.w / 2) - Math.max(cur.x - cur.w / 2, top.x - top.w / 2);
  const overlapD = Math.min(cur.z + cur.d / 2, top.z + top.d / 2) - Math.max(cur.z - cur.d / 2, top.z - top.d / 2);

  if (overlapW <= 0.18 || overlapD <= 0.18) {
    playSfx('hit');
    triggerShake(8, 0.28);
    addBurst3D(cur.x, s.blocks.length * 0.75, cur.z + 12, '#FB7185', 14);
    triggerGameOver('Your 3D slab missed the tower ledge!');
    return;
  }

  let newW = overlapW, newD = overlapD;
  let newX = Math.max(cur.x - cur.w / 2, top.x - top.w / 2) + newW / 2;
  let newZ = Math.max(cur.z - cur.d / 2, top.z - top.d / 2) + newD / 2;
  const isPerfect = Math.abs(diffX) < 0.24 && Math.abs(diffZ) < 0.24;

  if (isPerfect) {
    newX = top.x; newZ = top.z; newW = top.w; newD = top.d;
    s.streak++;
    score += 20 + s.streak * 5;
    playSfx('portal');
    addBurst3D(newX, s.blocks.length * 0.75, newZ + 12, '#FBBF24', 12);
    addPopup3D(newX, s.blocks.length * 0.75 + 1.2, newZ + 12, 'PERFECT +' + (20 + s.streak * 5), '#FBBF24');
  } else {
    s.streak = 0;
    score += 10;
    playSfx('coin');
    addBurst3D(newX, s.blocks.length * 0.75, newZ + 12, '#38BDF8', 8);
    addPopup3D(newX, s.blocks.length * 0.75 + 1.2, newZ + 12, '+10', '#FFFFFF');
  }

  s.blocks.push({ x: newX, z: newZ, w: newW, d: newD, colorIdx: s.blocks.length });
  level = 1 + Math.floor(s.blocks.length / 5);
  const nextAxis = s.blocks.length % 2 === 1 ? 'z' : 'x';
  const spd = (4.8 + Math.min(4.2, s.blocks.length * 0.2)) * DIFFICULTY[difficulty].speed;
  s.active = {
    x: nextAxis === 'x' ? -4.5 : newX,
    z: nextAxis === 'z' ? -4.5 : newZ,
    w: newW, d: newD, dir: 1, axis: nextAxis, speed: spd
  };
  saveBest();
  updateHud();
}

function stepObby(dt) {
  const s = obbyState;
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.invuln > 0) s.invuln -= dt;

  const moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const moveZ = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
  s.vx = moveX * 6.8 * mult;
  s.vz = moveZ * 9.5 * mult;

  if (keys.action && s.onGround) {
    s.vy = 9.4;
    s.onGround = false;
    playSfx('jump');
    addBurst3D(s.x, s.y, s.z, '#38BDF8', 6);
  }

  s.vy -= 21 * dt;
  s.x = Math.max(-7, Math.min(7, s.x + s.vx * dt));
  s.z = Math.max(2, Math.min(58, s.z + s.vz * dt));
  const prevY = s.y;
  s.y += s.vy * dt;
  s.onGround = false;

  for (const p of s.platforms) {
    const topY = p.y + p.h;
    const withinXZ = Math.abs(s.x - p.x) <= p.w / 2 + 0.45 && Math.abs(s.z - p.z) <= p.d / 2 + 0.45;
    if (withinXZ && s.vy <= 0 && prevY >= topY - 0.4 && s.y <= topY) {
      s.y = topY;
      s.vy = 0;
      s.onGround = true;
    }
  }

  if (s.y < -5.5) {
    lives--;
    playSfx('hit');
    triggerShake(7, 0.25);
    updateHud();
    if (lives <= 0) { triggerGameOver('Fell into the 3D sky abyss.'); return; }
    s.x = 0; s.y = 1.6; s.z = 5; s.vy = 0; s.invuln = 1.1;
  }

  for (const c of s.crystals) {
    if (!c.got && Math.hypot(s.x - c.x, s.y + 0.6 - c.y, s.z - c.z) < 1.8) {
      c.got = true;
      score += 25;
      playSfx('coin');
      addBurst3D(c.x, c.y, c.z, '#FBBF24', 10);
      addPopup3D(c.x, c.y + 1, c.z, '+25', '#FBBF24');
      saveBest();
      updateHud();
    }
  }

  for (const d of s.drones) {
    d.x += d.dir * 3.4 * emult * dt;
    if (d.x < d.minX) { d.x = d.minX; d.dir = 1; }
    if (d.x > d.maxX) { d.x = d.maxX; d.dir = -1; }
    if (s.invuln <= 0 && Math.hypot(s.x - d.x, s.y + 0.5 - d.y, s.z - d.z) < 1.35) {
      lives--;
      s.invuln = 1.2;
      s.vy = 5.5;
      playSfx('hit');
      triggerShake(7, 0.25);
      addBurst3D(s.x, s.y + 0.5, s.z, '#FB7185', 12);
      updateHud();
      if (lives <= 0) { triggerGameOver('Hit by a 3D patrol sentinel.'); return; }
    }
  }

  if (Math.hypot(s.x - s.portal.x, s.y + 0.6 - s.portal.y, s.z - s.portal.z) < 2.2) {
    score += 120;
    level++;
    playSfx('portal');
    addBurst3D(s.portal.x, s.portal.y, s.portal.z, '#10B981', 18);
    addPopup3D(s.portal.x, s.portal.y + 1.4, s.portal.z, '+120 SECTOR CLEAR!', '#10B981');
    saveBest();
    updateHud();
    initObby(true);
  }
}

function stepRunner(dt) {
  const s = runnerState;
  const mult = DIFFICULTY[difficulty].speed;
  if (s.invuln > 0) s.invuln -= dt;
  const targetX = s.laneX * 2.8;
  s.x += (targetX - s.x) * Math.min(1, dt * 16);

  if ((keys.up || keys.action) && s.onGround) {
    s.vy = 10.6;
    s.onGround = false;
    playSfx('jump');
    addBurst3D(s.x, 0.2, 6.5, '#38BDF8', 6);
  }
  if (keys.down) {
    s.duckTimer = 0.25;
    if (!s.onGround) s.vy -= 36 * dt;
  } else if (s.duckTimer > 0) s.duckTimer -= dt;

  s.vy -= 26 * dt;
  s.y += s.vy * dt;
  if (s.y <= 0) { s.y = 0; s.vy = 0; s.onGround = true; }

  const spd = (s.speed + Math.min(16, score * 0.02)) * mult;
  s.scrollZ += spd * dt;
  const prevScore = score;
  score = Math.floor(s.scrollZ * 0.8) + (s.bonus || 0);
  if (score !== prevScore) {
    level = 1 + Math.floor(score / 300);
    saveBest();
    updateHud();
  }

  s.spawnZ -= spd * dt;
  if (s.spawnZ <= 0) {
    s.spawnZ = 14 + Math.random() * 10;
    const lane = Math.floor(Math.random() * 3) - 1;
    const high = Math.random() < 0.35;
    s.obstacles.push({ x: lane * 2.8, y: high ? 1.55 : 0, z: 58, high, w: 1.9, h: high ? 1.2 : 1.35, d: 1.2 });
    const crystalLane = (lane + (Math.random() < 0.5 ? 1 : 2)) % 3 - 1;
    if (Math.random() < 0.7) s.crystals.push({ x: crystalLane * 2.8, y: 0.9, z: 62, got: false });
  }

  for (const o of s.obstacles) {
    o.z -= spd * dt;
    const heroTop = s.y + (s.duckTimer > 0 ? 0.65 : 1.45);
    if (
      s.invuln <= 0 &&
      Math.abs(o.z - 6.5) < 0.9 &&
      Math.abs(o.x - s.x) < 1.15 &&
      heroTop > o.y &&
      s.y < o.y + o.h
    ) {
      lives--;
      s.invuln = 1.05;
      playSfx('hit');
      triggerShake(7, 0.24);
      addBurst3D(s.x, s.y + 0.7, 6.5, '#FB7185', 14);
      updateHud();
      if (lives <= 0) { triggerGameOver('Crashed into a 3D trench barrier.'); return; }
    }
  }

  for (const c of s.crystals) {
    c.z -= spd * dt;
    if (!c.got && Math.abs(c.z - 6.5) < 1.1 && Math.abs(c.x - s.x) < 1.3 && Math.abs(c.y - (s.y + 0.7)) < 1.4) {
      c.got = true;
      s.bonus = (s.bonus || 0) + 25;
      score += 25;
      playSfx('coin');
      addBurst3D(c.x, c.y, 6.5, '#FBBF24', 10);
      addPopup3D(c.x, c.y + 1, 6.5, '+25', '#FBBF24');
      saveBest();
      updateHud();
    }
  }

  s.obstacles = s.obstacles.filter((o) => o.z > 1.2);
  s.crystals = s.crystals.filter((c) => !c.got && c.z > 1.2);
}

function stepArcade(dt) {
  const s = arcadeState;
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.fireCooldown > 0) s.fireCooldown -= dt;

  s.vx = ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * 9.5 * mult;
  s.vy = ((keys.up ? 1 : 0) - (keys.down ? 1 : 0)) * 6.5 * mult;
  s.x = Math.max(-5.8, Math.min(5.8, s.x + s.vx * dt));
  s.y = Math.max(-2.6, Math.min(2.8, s.y + s.vy * dt));

  if (keys.action && s.fireCooldown <= 0) {
    s.bullets.push({ x: s.x - 0.55, y: s.y, z: 7 });
    s.bullets.push({ x: s.x + 0.55, y: s.y, z: 7 });
    s.fireCooldown = 0.2;
    playSfx('laser');
  }

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = Math.max(0.38, (1.05 - level * 0.04) / emult);
    s.meteors.push({
      x: (Math.random() - 0.5) * 10.5,
      y: (Math.random() - 0.5) * 4.6,
      z: 62,
      vz: (18 + Math.random() * 10) * emult
    });
    if (Math.random() < 0.35) {
      s.stars.push({ x: (Math.random() - 0.5) * 9.5, y: (Math.random() - 0.5) * 4.2, z: 62, vz: 18 * emult, got: false });
    }
  }

  for (const b of s.bullets) b.z += 56 * dt;
  for (const m of s.meteors) {
    m.z -= m.vz * dt;
    if (m.z <= 7.2 && Math.hypot(m.x - s.x, m.y - s.y) < 1.35) {
      m.hit = true;
      lives--;
      playSfx('hit');
      triggerShake(7, 0.24);
      addBurst3D(m.x, m.y, 7.2, '#FB7185', 14);
      updateHud();
      if (lives <= 0) { triggerGameOver('3D asteroid impact destroyed your hull.'); return; }
    } else if (m.z <= 2.2) {
      m.hit = true;
    }
  }

  for (const b of s.bullets) {
    for (const m of s.meteors) {
      if (!m.hit && !b.hit && Math.abs(b.z - m.z) < 2.6 && Math.hypot(b.x - m.x, b.y - m.y) < 1.25) {
        m.hit = true; b.hit = true;
        score += 20;
        if (score % 200 === 0) level++;
        playSfx('coin');
        triggerShake(2.5, 0.08);
        addBurst3D(m.x, m.y, m.z, '#FB7185', 11);
        addPopup3D(m.x, m.y + 0.8, m.z, '+20', '#FFFFFF');
        saveBest();
        updateHud();
      }
    }
  }

  for (const st of s.stars) {
    st.z -= st.vz * dt;
    if (!st.got && Math.abs(st.z - 7) < 1.4 && Math.hypot(st.x - s.x, st.y - s.y) < 1.55) {
      st.got = true;
      score += 35;
      playSfx('portal');
      addBurst3D(st.x, st.y, 7, '#FBBF24', 10);
      addPopup3D(st.x, st.y + 0.8, 7, '+35 STAR', '#FBBF24');
      saveBest();
      updateHud();
    }
  }

  s.bullets = s.bullets.filter((b) => !b.hit && b.z < 68);
  s.meteors = s.meteors.filter((m) => !m.hit);
  s.stars = s.stars.filter((st) => !st.got && st.z > 2);
}

function stepStack(dt) {
  const s = stackState;
  const targetCamY = 2.8 + Math.max(0, s.blocks.length - 2) * 0.75;
  s.camY += (targetCamY - s.camY) * Math.min(1, dt * 6);
  const a = s.active;
  if (a.axis === 'x') {
    a.x += a.dir * a.speed * dt;
    if (a.x > 4.6) { a.x = 4.6; a.dir = -1; }
    if (a.x < -4.6) { a.x = -4.6; a.dir = 1; }
  } else {
    a.z += a.dir * a.speed * dt;
    if (a.z > 4.6) { a.z = 4.6; a.dir = -1; }
    if (a.z < -4.6) { a.z = -4.6; a.dir = 1; }
  }
}

function draw3DGrid(pal, cam, scrollZ) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, pal.skyTop);
  grad.addColorStop(0.58, pal.skyBot);
  grad.addColorStop(1, pal.skyTop);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(W / 2, H * 0.34, 8, W / 2, H * 0.34, 150);
  halo.addColorStop(0, pal.sun);
  halo.addColorStop(0.28, 'rgba(255,255,255,0.14)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(W / 2, H * 0.34, 150, 0, Math.PI * 2); ctx.fill();

  for (const st of STARS_3D) {
    const zPos = ((st.z - (mode === 'arcade' ? elapsed * 18 : 0)) % 120 + 120) % 120 + 4;
    const p = project(st.x, st.y + 14, cam.z + zPos, cam);
    if (p && p.sx >= 0 && p.sx <= W && p.sy >= 0 && p.sy <= H * 0.65) {
      ctx.fillStyle = 'rgba(248,250,252,' + Math.min(0.95, 18 / zPos).toFixed(2) + ')';
      ctx.fillRect(p.sx, p.sy, 2, 2);
    }
  }

  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  const floorY = mode === 'arcade' ? -4.5 : -0.8;
  for (let gx = -12; gx <= 12; gx += 3) {
    const a = project(gx, floorY, cam.z + 2, cam);
    const b = project(gx, floorY, cam.z + 65, cam);
    if (a && b) {
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    }
  }
  const offset = scrollZ % 4;
  for (let gz = 4; gz <= 64; gz += 4) {
    const zWorld = cam.z + gz - offset;
    const a = project(-12, floorY, zWorld, cam);
    const b = project(12, floorY, zWorld, cam);
    if (a && b) {
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
    }
  }
}

function drawScene() {
  const pal = PALETTES[paletteKey];
  ctx.save();
  if (shakeTime > 0) ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);

  let cam = { x: 0, y: 3.4, z: 0, pitch: 0.14 };
  if (mode === 'obby' && obbyState) {
    cam = { x: obbyState.x * 0.55, y: obbyState.y + 3.6, z: obbyState.z - 6.8, pitch: 0.19 };
  } else if (mode === 'runner' && runnerState) {
    cam = { x: runnerState.x * 0.4, y: 3.2, z: 0, pitch: 0.16 };
  } else if (mode === 'arcade') {
    cam = { x: arcadeState ? arcadeState.x * 0.35 : 0, y: 1.6, z: 0, pitch: 0.05 };
  } else if (mode === 'stack' && stackState) {
    cam = { x: 0, y: stackState.camY + 1.8, z: -12, pitch: 0.22 };
  }

  draw3DGrid(pal, cam, runnerState ? runnerState.scrollZ : elapsed * 6);

  const items = [];
  if (mode === 'obby' && obbyState) {
    const s = obbyState;
    for (const p of s.platforms) items.push({ z: p.z, fn: () => drawBox3D(p.x, p.y, p.z, p.w, p.h, p.d, cam, pal.platTop, pal.platFront, pal.platSide, 'rgba(255,255,255,0.16)') });
    for (const c of s.crystals) if (!c.got) items.push({ z: c.z, fn: () => drawCrystal3D(c.x, c.y, c.z, cam, pal.crystal) });
    for (const d of s.drones) items.push({ z: d.z, fn: () => drawBox3D(d.x, d.y + Math.sin(elapsed * 5) * 0.25, d.z, 1.3, 1.0, 1.1, cam, pal.enemyTop, pal.enemyFront, pal.enemySide, '#FECDD3') });
    items.push({ z: s.portal.z, fn: () => {
      const p = project(s.portal.x, s.portal.y, s.portal.z, cam);
      if (!p) return;
      ctx.strokeStyle = pal.portal;
      ctx.lineWidth = Math.max(2, p.scale * 0.12);
      ctx.beginPath(); ctx.ellipse(p.sx, p.sy, p.scale * 1.1, p.scale * 1.6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fill();
    }});
    if (s.invuln <= 0 || Math.floor(s.invuln * 14) % 2 === 0) {
      items.push({ z: s.z, fn: () => drawBox3D(s.x, s.y, s.z, 1.0, 1.45, 1.0, cam, pal.heroTop, pal.heroFront, pal.heroSide, '#E0F2FE') });
    }
  } else if (mode === 'runner' && runnerState) {
    const s = runnerState;
    for (const o of s.obstacles) items.push({ z: o.z, fn: () => drawBox3D(o.x, o.y, o.z, o.w, o.h, o.d, cam, pal.enemyTop, pal.enemyFront, pal.enemySide, '#FECDD3') });
    for (const c of s.crystals) items.push({ z: c.z, fn: () => drawCrystal3D(c.x, c.y, c.z, cam, pal.crystal) });
    const hh = s.duckTimer > 0 ? 0.65 : 1.45;
    if (s.invuln <= 0 || Math.floor(s.invuln * 14) % 2 === 0) {
      items.push({ z: 6.5, fn: () => drawBox3D(s.x, s.y, 6.5, 1.15, hh, 1.2, cam, pal.heroTop, pal.heroFront, pal.heroSide, '#E0F2FE') });
    }
  } else if (mode === 'arcade' && arcadeState) {
    const s = arcadeState;
    for (const m of s.meteors) items.push({ z: m.z, fn: () => drawBox3D(m.x, m.y, m.z, 1.5, 1.3, 1.4, cam, pal.enemyTop, pal.enemyFront, pal.enemySide, '#FECDD3') });
    for (const st of s.stars) items.push({ z: st.z, fn: () => drawCrystal3D(st.x, st.y, st.z, cam, pal.crystal) });
    for (const b of s.bullets) items.push({ z: b.z, fn: () => drawBox3D(b.x, b.y, b.z, 0.24, 0.24, 1.3, cam, '#FFFFFF', pal.sun, pal.heroFront, null) });
    items.push({ z: 7, fn: () => {
      drawBox3D(s.x, s.y, 7, 1.8, 0.42, 1.3, cam, pal.heroTop, pal.heroFront, pal.heroSide, '#E0F2FE');
      drawBox3D(s.x, s.y + 0.35, 7.1, 0.65, 0.45, 1.0, cam, '#FFFFFF', pal.heroTop, pal.heroFront, null);
    }});
  } else if (mode === 'stack' && stackState) {
    const s = stackState;
    for (let i = 0; i < s.blocks.length; i++) {
      const b = s.blocks[i];
      const topC = pal.stackColors[b.colorIdx % pal.stackColors.length];
      items.push({ z: b.z + 12 + i * 0.01, fn: () => drawBox3D(b.x, i * 0.75, b.z + 12, b.w, 0.75, b.d, cam, topC, pal.platFront, pal.platSide, 'rgba(255,255,255,0.2)') });
    }
    const a = s.active;
    const actTop = pal.stackColors[s.blocks.length % pal.stackColors.length];
    items.push({ z: a.z + 12 + 0.5, fn: () => drawBox3D(a.x, s.blocks.length * 0.75, a.z + 12, a.w, 0.75, a.d, cam, actTop, pal.heroFront, pal.heroSide, '#FFFFFF') });
  }

  items.sort((a, b) => b.z - a.z);
  for (const it of items) it.fn();

  for (const pt of particles3D) {
    const p = project(pt.x, pt.y, pt.z, cam);
    if (!p) continue;
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    const sz = Math.max(2, p.scale * 0.14);
    ctx.fillRect(p.sx - sz / 2, p.sy - sz / 2, sz, sz);
  }
  ctx.globalAlpha = 1;

  for (const pop of popups3D) {
    const p = project(pop.x, pop.y, pop.z, cam);
    if (!p) continue;
    ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
    ctx.font = '800 13px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, p.sx, p.sy);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTime) / 1000 || 0.016);
  lastTime = ts;
  elapsed += dt;
  if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - dt);

  for (const pt of particles3D) {
    pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.z += pt.vz * dt;
    pt.vy -= 9 * dt; pt.life -= dt;
  }
  particles3D = particles3D.filter((pt) => pt.life > 0);
  for (const pop of popups3D) { pop.y += 1.4 * dt; pop.life -= dt; }
  popups3D = popups3D.filter((pop) => pop.life > 0);

  if (status === 'playing') {
    if (mode === 'obby') stepObby(dt);
    else if (mode === 'runner') stepRunner(dt);
    else if (mode === 'arcade') stepArcade(dt);
    else stepStack(dt);
  }
  drawScene();
  requestAnimationFrame(loop);
}

function handleKeyMap(code, isDown) {
  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = isDown;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = isDown;
  if (code === 'ArrowUp' || code === 'KeyW') keys.up = isDown;
  if (code === 'ArrowDown' || code === 'KeyS') keys.down = isDown;
  if (code === 'Space') keys.action = isDown;
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyP' && status !== 'ready') togglePause();
  if (e.code === 'Space' && status !== 'playing') { if (status === 'paused') togglePause(); else resetGame(true); return; }
  if (mode === 'runner' && status === 'playing' && runnerState) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') runnerState.laneX = Math.max(-1, runnerState.laneX - 1);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') runnerState.laneX = Math.min(1, runnerState.laneX + 1);
  }
  if (mode === 'stack' && status === 'playing' && e.code === 'Space' && !e.repeat) dropStackBlock();
  handleKeyMap(e.code, true);
});
window.addEventListener('keyup', (e) => handleKeyMap(e.code, false));

document.querySelectorAll('.pad-btn').forEach((btn) => {
  const k = btn.dataset.key;
  const press = (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    keys[k] = true;
    if (mode === 'runner' && status === 'playing' && runnerState) {
      if (k === 'left') runnerState.laneX = Math.max(-1, runnerState.laneX - 1);
      if (k === 'right') runnerState.laneX = Math.min(1, runnerState.laneX + 1);
    }
  };
  const release = () => { btn.classList.remove('pressed'); keys[k] = false; };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointerleave', release);
  btn.addEventListener('pointercancel', release);
});

const actionBtn = document.getElementById('actionBtn');
actionBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (status !== 'playing') { if (status === 'paused') togglePause(); else resetGame(true); return; }
  if (mode === 'stack') { dropStackBlock(); return; }
  keys.action = true;
});
['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
  actionBtn.addEventListener(ev, () => { keys.action = false; });
});

function togglePause() {
  if (status === 'playing') {
    status = 'paused';
    showOverlay('PAUSED', MODE_INFO[mode].title, 'Game paused. Tap Resume or press P to jump right back in.', 'Resume 3D', false, false);
  } else if (status === 'paused') {
    status = 'playing';
    hideOverlay();
  }
}

document.getElementById('modeTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-mode]');
  if (!btn) return;
  mode = btn.dataset.mode;
  document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b === btn));
  resetGame(false);
});
document.getElementById('difficultySelect').addEventListener('change', (e) => { difficulty = e.target.value; });
document.getElementById('paletteSelect').addEventListener('change', (e) => {
  paletteKey = e.target.value;
  document.body.setAttribute('data-theme', paletteKey);
});
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? 'SFX: ON' : 'SFX: OFF';
  soundToggleBtn.classList.toggle('muted', !soundEnabled);
});
playBtn.addEventListener('click', () => { if (status === 'paused') togglePause(); else resetGame(true); });
document.getElementById('restartBtn').addEventListener('click', () => resetGame(true));
document.getElementById('quickResetBtn').addEventListener('click', () => resetGame(true));
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('canvasFrame').addEventListener('click', () => document.getElementById('canvasFrame').focus());

resetGame(false);
requestAnimationFrame(loop);`,
  };
}
