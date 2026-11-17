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
    case '2d_game_studio':
      return gameStudio2DBundle();
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

function gameStudio2DBundle(): GeneratedAppBundle {
  return {
    projectTitle: '2D Game Studio',
    description:
      'Playable 2D browser game studio with Platformer, Endless Runner, Puzzle, and Arcade modes plus keyboard & mobile touch controls.',
    summary:
      'Loaded 2D Game Studio — switch between 4 playable games (Platformer, Endless Runner, 4x4 Puzzle, and Arcade Blaster) with keyboard & mobile touch controls, live scoring, difficulty levels, color themes, and instant restart. Ask Craft AI in chat to customize characters, levels, physics, or rules.',
    designStrategy: 'template_foundation',
    templateId: '2d_game_studio',
    designDirection:
      'Arcade Midnight (#090D16) canvas stage with crisp HUD badges, selectable color palettes, responsive 16:10 canvas, and tactile touch D-pad + action deck.',
    qaSummary:
      'QA Audit (6/6 checks passed): structure, tokens, responsive canvas, zero external assets, balanced 60fps JS game loop, and genre customization ready.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Make a Mario-style 2D platformer with coins & enemies',
      'Turn this into a cyber neon endless runner',
      'Create a harder 2D arcade boss shooter',
    ],
    htmlCode: `<header class="studio-bar">
  <div class="container bar-inner">
    <div class="brand-wrap">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="7" fill="#06B6D4"/>
        <rect x="6" y="11" width="14" height="4" rx="2" fill="#090D16"/>
        <rect x="11" y="6" width="4" height="14" rx="2" fill="#090D16"/>
      </svg>
      <div>
        <h1>2D Game Studio</h1>
        <span class="sub">Playable Engine &bull; Keyboard + Touch</span>
      </div>
    </div>
    <div class="controls-inline">
      <select id="difficultySelect" aria-label="Difficulty">
        <option value="easy">Easy</option>
        <option value="normal" selected>Normal</option>
        <option value="hard">Hard</option>
      </select>
      <select id="paletteSelect" aria-label="Color theme">
        <option value="midnight" selected>Cyan Midnight</option>
        <option value="sunset">Sunset Retro</option>
        <option value="forest">Emerald Quest</option>
      </select>
    </div>
  </div>
</header>

<main class="container game-shell">
  <section class="mode-strip" aria-label="Game genre selector">
    <div id="modeTabs" class="mode-tabs" role="tablist">
      <button type="button" class="mode-btn active" data-mode="platformer">Platformer</button>
      <button type="button" class="mode-btn" data-mode="runner">Endless Runner</button>
      <button type="button" class="mode-btn" data-mode="puzzle">4x4 Puzzle</button>
      <button type="button" class="mode-btn" data-mode="arcade">Arcade Blaster</button>
    </div>
    <div class="hud-pills">
      <div class="hud-pill"><span>Score</span><strong id="scoreVal">0</strong></div>
      <div class="hud-pill"><span>Best</span><strong id="bestVal">0</strong></div>
      <div class="hud-pill"><span>Lives</span><strong id="livesVal">3</strong></div>
    </div>
  </section>

  <section class="stage-card">
    <div class="canvas-frame" id="canvasFrame" tabindex="0">
      <canvas id="gameCanvas" width="640" height="380" aria-label="2D Game Canvas"></canvas>
      <div id="stageOverlay" class="stage-overlay">
        <span id="overlayTag" class="overlay-tag">READY TO PLAY</span>
        <h2 id="overlayTitle">Sky Hopper 2D</h2>
        <p id="overlayDesc">Move with Arrow Keys / WASD or the on-screen D-Pad. Collect coins, dodge patrol drones, and reach the emerald portal!</p>
        <div class="overlay-actions">
          <button id="primaryPlayBtn" type="button" class="btn-play">Start Game</button>
          <button id="restartBtn" type="button" class="btn-ghost">Restart</button>
        </div>
      </div>
    </div>
    <div class="stage-footer">
      <span id="hintText" class="hint-text">Keys: Arrows / WASD to move &bull; Space to Jump/Action &bull; Tap canvas to focus</span>
      <button id="pauseBtn" type="button" class="btn-small">Pause</button>
    </div>
  </section>

  <section class="touch-deck" aria-label="Mobile touch controls">
    <div class="dpad" aria-label="Directional pad">
      <span class="dpad-spacer"></span>
      <button type="button" class="pad-btn" data-key="up" aria-label="Up">&#9650;</button>
      <span class="dpad-spacer"></span>
      <button type="button" class="pad-btn" data-key="left" aria-label="Left">&#9664;</button>
      <button type="button" class="pad-btn" data-key="down" aria-label="Down">&#9660;</button>
      <button type="button" class="pad-btn" data-key="right" aria-label="Right">&#9654;</button>
    </div>
    <div class="action-cluster">
      <button id="actionBtn" type="button" class="action-btn">JUMP / FIRE</button>
      <button id="quickResetBtn" type="button" class="btn-ghost">Reset</button>
    </div>
  </section>
</main>`,
    cssCode: `:root {
  --bg: #090D16;
  --surface: #121826;
  --surface-2: #1B2438;
  --ink: #F8FAFC;
  --muted: #94A3B8;
  --accent: #06B6D4;
  --coral: #FF5E5B;
  --emerald: #10B981;
  --border: #26324A;
}
body {
  background: var(--bg);
  color: var(--ink);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.45;
  user-select: none;
}
.hidden { display: none !important; }
.container { max-width: 820px; margin: 0 auto; padding: 12px 14px; }
.studio-bar {
  background: rgba(18, 24, 38, 0.95);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
}
.bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.brand-wrap { display: flex; align-items: center; gap: 10px; }
h1 { margin: 0; font-size: clamp(1rem, 2.4vw, 1.2rem); font-weight: 700; }
.sub { display: block; font-size: 0.74rem; color: var(--muted); }
.controls-inline { display: flex; gap: 8px; }
select {
  min-height: 40px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 0.85rem;
  font-weight: 600;
}
.game-shell { display: flex; flex-direction: column; gap: 12px; }
.mode-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.mode-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.mode-btn, .btn-small, .btn-ghost {
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}
.mode-btn.active {
  background: var(--accent);
  color: #06121A;
  border-color: var(--accent);
}
.hud-pills { display: flex; gap: 8px; }
.hud-pill {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 5px 11px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.hud-pill span { font-size: 0.72rem; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.hud-pill strong { font-family: ui-monospace, monospace; font-size: 1rem; color: var(--ink); }
.stage-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 10px;
}
.canvas-frame {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #060911;
  outline: none;
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 640 / 380;
  touch-action: none;
}
.stage-overlay {
  position: absolute;
  inset: 0;
  background: rgba(9, 13, 22, 0.84);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px;
  gap: 8px;
}
.overlay-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--accent);
}
.stage-overlay h2 { margin: 0; font-size: clamp(1.2rem, 3vw, 1.65rem); }
.stage-overlay p { margin: 0; max-width: 44ch; font-size: 0.88rem; color: var(--muted); }
.overlay-actions { display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap; justify-content: center; }
.btn-play {
  min-height: 44px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: var(--coral);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
.stage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}
.hint-text { font-size: 0.76rem; color: var(--muted); }
.touch-deck {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.dpad {
  display: grid;
  grid-template-columns: repeat(3, 48px);
  grid-template-rows: repeat(2, 46px);
  gap: 6px;
}
.dpad-spacer { pointer-events: none; }
.pad-btn {
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--ink);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}
.pad-btn:active, .pad-btn.pressed { background: var(--accent); color: #06121A; }
.action-cluster { display: flex; align-items: center; gap: 8px; }
.action-btn {
  min-width: 122px;
  min-height: 60px;
  padding: 10px 16px;
  border-radius: 16px;
  border: none;
  background: var(--coral);
  color: #FFFFFF;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  touch-action: manipulation;
}
.action-btn:active { transform: scale(0.97); }
@media (max-width: 600px) {
  .container { padding: 10px; }
  .dpad { grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(2, 44px); }
  .action-btn { min-width: 104px; min-height: 54px; font-size: 0.85rem; }
  .hint-text { display: none; }
}`,
    jsCode: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = 640, H = 380;

const PALETTES = {
  midnight: { bgTop: '#0B1224', bgBot: '#060911', ground: '#1E293B', plat: '#334155', hero: '#06B6D4', enemy: '#FF5E5B', coin: '#FBBF24', portal: '#10B981' },
  sunset: { bgTop: '#24112E', bgBot: '#120819', ground: '#3B1D4A', plat: '#5B2A6E', hero: '#FF9F43', enemy: '#F43F5E', coin: '#FDE047', portal: '#34D399' },
  forest: { bgTop: '#0B1F1A', bgBot: '#06120F', ground: '#163B30', plat: '#1E5242', hero: '#34D399', enemy: '#FB7185', coin: '#FBBF24', portal: '#38BDF8' }
};

const DIFFICULTY = {
  easy: { speed: 0.78, enemySpeed: 0.75, label: 'Easy' },
  normal: { speed: 1.0, enemySpeed: 1.0, label: 'Normal' },
  hard: { speed: 1.28, enemySpeed: 1.32, label: 'Hard' }
};

const MODE_INFO = {
  platformer: { title: 'Sky Hopper 2D', desc: 'Run and jump across floating platforms, collect gold coins, dodge patrol drones, and reach the emerald portal.', action: 'JUMP' },
  runner: { title: 'Neon Endless Dash', desc: 'Auto-running challenge! Tap JUMP (Space/Up) to clear ground crates and DOWN to drop quickly past drones.', action: 'JUMP' },
  puzzle: { title: 'Grid Merge 4x4', desc: 'Slide numbered tiles with Arrow Keys, WASD, or the D-Pad. Merge matching numbers to reach higher scores!', action: 'NEW TILE' },
  arcade: { title: 'Star Defender 2D', desc: 'Pilot left/right and press FIRE (Space) to blast falling meteors while catching bonus gold stars.', action: 'FIRE' }
};

const keys = { left: false, right: false, up: false, down: false, action: false };
let mode = 'platformer';
let difficulty = 'normal';
let paletteKey = 'midnight';
let status = 'ready';
let score = 0;
let lives = 3;
let level = 1;
let bestScores = {};
try { bestScores = JSON.parse(localStorage.getItem('craftable_2d_best') || '{}'); } catch (e) { bestScores = {}; }

let platState = null;
let runnerState = null;
let puzzleState = null;
let arcadeState = null;
let lastTime = 0;

const scoreEl = document.getElementById('scoreVal');
const bestEl = document.getElementById('bestVal');
const livesEl = document.getElementById('livesVal');
const overlayEl = document.getElementById('stageOverlay');
const overlayTagEl = document.getElementById('overlayTag');
const overlayTitleEl = document.getElementById('overlayTitle');
const overlayDescEl = document.getElementById('overlayDesc');
const playBtn = document.getElementById('primaryPlayBtn');
const actionBtn = document.getElementById('actionBtn');

function saveBest() {
  const prev = bestScores[mode] || 0;
  if (score > prev) {
    bestScores[mode] = score;
    try { localStorage.setItem('craftable_2d_best', JSON.stringify(bestScores)); } catch (e) {}
  }
}

function updateHud() {
  scoreEl.textContent = score;
  bestEl.textContent = Math.max(score, bestScores[mode] || 0);
  livesEl.textContent = mode === 'puzzle' ? (puzzleState ? puzzleState.moves + 'm' : '0m') : lives;
  actionBtn.textContent = MODE_INFO[mode].action;
}

function showOverlay(tag, title, desc, btnLabel) {
  overlayTagEl.textContent = tag;
  overlayTitleEl.textContent = title;
  overlayDescEl.textContent = desc;
  playBtn.textContent = btnLabel;
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

function initPlatformer(keepScore) {
  if (!keepScore) { score = 0; lives = 3; level = 1; }
  const shift = ((level - 1) % 3) * 18;
  platState = {
    px: 44, py: 280, vx: 0, vy: 0, w: 28, h: 32, onGround: false, invuln: 0,
    platforms: [
      { x: 0, y: 340, w: 640, h: 40 },
      { x: 110, y: 274 - shift * 0.4, w: 120, h: 14 },
      { x: 275, y: 222 + shift * 0.3, w: 125, h: 14 },
      { x: 445, y: 170 - shift * 0.3, w: 135, h: 14 },
      { x: 170, y: 136, w: 110, h: 14 }
    ],
    coins: [
      { x: 165, y: 242, got: false },
      { x: 335, y: 190, got: false },
      { x: 220, y: 102, got: false },
      { x: 500, y: 136, got: false }
    ],
    enemies: [
      { x: 260, y: 316, min: 190, max: 430, dir: 1, speed: 105 },
      { x: 455, y: 146 - shift * 0.3, min: 450, max: 556, dir: 1, speed: 80 }
    ],
    portal: { x: 556, y: 122 - shift * 0.3, w: 22, h: 46 }
  };
}

function initRunner() {
  score = 0; lives = 3; level = 1;
  runnerState = {
    py: 288, vy: 0, w: 30, h: 36, ducking: false, onGround: true, invuln: 0,
    speed: 250, spawnTimer: 0.7, dist: 0, obstacles: [], orbs: []
  };
}

function addPuzzleTile(grid) {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (!empty.length) return false;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  grid[pick[0]][pick[1]] = Math.random() < 0.85 ? 2 : 4;
  return true;
}

function canMovePuzzle(grid) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
}

function initPuzzle() {
  score = 0; lives = 1; level = 1;
  const grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  addPuzzleTile(grid);
  addPuzzleTile(grid);
  puzzleState = { grid, moves: 0 };
}

function initArcade() {
  score = 0; lives = 3; level = 1;
  arcadeState = {
    px: W / 2 - 20, w: 40, h: 18, fireCooldown: 0, spawnTimer: 0.5,
    bullets: [], enemies: [], stars: []
  };
}

function resetGame(autoPlay) {
  if (mode === 'platformer') initPlatformer(false);
  else if (mode === 'runner') initRunner();
  else if (mode === 'puzzle') initPuzzle();
  else initArcade();
  saveBest();
  updateHud();
  if (autoPlay) {
    status = 'playing';
    hideOverlay();
    document.getElementById('canvasFrame').focus();
  } else {
    status = 'ready';
    const info = MODE_INFO[mode];
    showOverlay('READY TO PLAY', info.title, info.desc, 'Start Game');
  }
}

function triggerGameOver(reason) {
  status = 'gameover';
  saveBest();
  updateHud();
  showOverlay('GAME OVER', 'Final Score: ' + score, reason + ' Best score: ' + Math.max(score, bestScores[mode] || 0) + '.', 'Play Again');
}

function slidePuzzle(dir) {
  if (status !== 'playing' || mode !== 'puzzle' || !puzzleState) return;
  const g = puzzleState.grid;
  let moved = false;

  function slideLine(arr) {
    const nonZero = arr.filter(x => x !== 0);
    const out = [];
    for (let i = 0; i < nonZero.length; i++) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const merged = nonZero[i] * 2;
        out.push(merged);
        score += merged;
        i++;
      } else {
        out.push(nonZero[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return out;
  }

  for (let i = 0; i < 4; i++) {
    let line = [];
    for (let j = 0; j < 4; j++) {
      if (dir === 'left') line.push(g[i][j]);
      else if (dir === 'right') line.push(g[i][3 - j]);
      else if (dir === 'up') line.push(g[j][i]);
      else line.push(g[3 - j][i]);
    }
    const next = slideLine(line);
    for (let j = 0; j < 4; j++) {
      const val = next[j];
      if (dir === 'left') { if (g[i][j] !== val) moved = true; g[i][j] = val; }
      else if (dir === 'right') { if (g[i][3 - j] !== val) moved = true; g[i][3 - j] = val; }
      else if (dir === 'up') { if (g[j][i] !== val) moved = true; g[j][i] = val; }
      else { if (g[3 - j][i] !== val) moved = true; g[3 - j][i] = val; }
    }
  }

  if (moved) {
    puzzleState.moves++;
    addPuzzleTile(g);
    saveBest();
    updateHud();
    if (!canMovePuzzle(g)) {
      triggerGameOver('No legal merges left on the 4x4 board.');
    }
  }
}

function stepPlatformer(dt) {
  const s = platState;
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.invuln > 0) s.invuln -= dt;

  if (keys.left) s.vx = -220 * mult;
  else if (keys.right) s.vx = 220 * mult;
  else s.vx *= 0.78;

  if ((keys.up || keys.action) && s.onGround) {
    s.vy = -490;
    s.onGround = false;
  }

  s.vy += 1200 * dt;
  s.px = Math.max(0, Math.min(W - s.w, s.px + s.vx * dt));
  s.py += s.vy * dt;
  s.onGround = false;

  for (const p of s.platforms) {
    if (s.px + s.w > p.x && s.px < p.x + p.w && s.vy >= 0 && s.py + s.h >= p.y && s.py + s.h <= p.y + p.h + 18) {
      s.py = p.y - s.h;
      s.vy = 0;
      s.onGround = true;
    }
  }

  for (const c of s.coins) {
    if (!c.got && Math.hypot((s.px + s.w / 2) - c.x, (s.py + s.h / 2) - c.y) < 24) {
      c.got = true;
      score += 25;
      saveBest();
      updateHud();
    }
  }

  for (const e of s.enemies) {
    e.x += e.dir * e.speed * emult * dt;
    if (e.x < e.min) { e.x = e.min; e.dir = 1; }
    if (e.x > e.max) { e.x = e.max; e.dir = -1; }
    if (s.invuln <= 0 && s.px + s.w > e.x && s.px < e.x + 24 && s.py + s.h > e.y && s.py < e.y + 24) {
      lives--;
      s.invuln = 1.2;
      s.vx = -s.vx;
      s.vy = -280;
      updateHud();
      if (lives <= 0) { triggerGameOver('Hit by a patrol drone.'); return; }
    }
  }

  const portal = s.portal;
  if (s.px + s.w > portal.x && s.px < portal.x + portal.w && s.py + s.h > portal.y && s.py < portal.y + portal.h) {
    score += 100;
    level++;
    saveBest();
    updateHud();
    initPlatformer(true);
  }
}

function stepRunner(dt) {
  const s = runnerState;
  const mult = DIFFICULTY[difficulty].speed;
  const groundY = 324;
  if (s.invuln > 0) s.invuln -= dt;

  s.ducking = keys.down && s.onGround;
  const curH = s.ducking ? 20 : 36;
  if ((keys.up || keys.action) && s.onGround) {
    s.vy = -510;
    s.onGround = false;
  }
  if (keys.down && !s.onGround) s.vy += 1800 * dt;

  s.vy += 1320 * dt;
  s.py += s.vy * dt;
  if (s.py + curH >= groundY) {
    s.py = groundY - curH;
    s.vy = 0;
    s.onGround = true;
  }

  const runSpeed = (s.speed + score * 0.4) * mult;
  s.dist += dt * 10;
  if (s.dist >= 1) {
    score += Math.floor(s.dist);
    s.dist -= Math.floor(s.dist);
    saveBest();
    updateHud();
  }

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = (0.95 + Math.random() * 0.75) / mult;
    const isHigh = Math.random() < 0.35;
    s.obstacles.push({ x: W + 20, y: isHigh ? groundY - 62 : groundY - 30, w: 24, h: 30 });
    if (Math.random() < 0.55) {
      s.orbs.push({ x: W + 110, y: groundY - (48 + Math.random() * 65), got: false });
    }
  }

  for (const o of s.obstacles) {
    o.x -= runSpeed * dt;
    if (s.invuln <= 0 && 94 + s.w > o.x && 94 < o.x + o.w && s.py + curH > o.y && s.py < o.y + o.h) {
      lives--;
      s.invuln = 1.0;
      updateHud();
      if (lives <= 0) { triggerGameOver('Crashed into an obstacle.'); return; }
    }
  }
  for (const orb of s.orbs) {
    orb.x -= runSpeed * dt;
    if (!orb.got && Math.hypot(109 - orb.x, (s.py + curH / 2) - orb.y) < 22) {
      orb.got = true;
      score += 20;
      saveBest();
      updateHud();
    }
  }
  s.obstacles = s.obstacles.filter(o => o.x > -40);
  s.orbs = s.orbs.filter(o => o.x > -20 && !o.got);
}

function stepArcade(dt) {
  const s = arcadeState;
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.fireCooldown > 0) s.fireCooldown -= dt;

  if (keys.left) s.px -= 290 * mult * dt;
  if (keys.right) s.px += 290 * mult * dt;
  s.px = Math.max(12, Math.min(W - s.w - 12, s.px));

  if ((keys.action || keys.up) && s.fireCooldown <= 0) {
    s.bullets.push({ x: s.px + s.w / 2 - 2, y: H - 46 });
    s.fireCooldown = 0.22;
  }

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = Math.max(0.42, (1.15 - level * 0.04) / emult);
    s.enemies.push({ x: 24 + Math.random() * (W - 68), y: -24, w: 26, h: 24, vy: (85 + Math.random() * 55) * emult });
    if (Math.random() < 0.35) {
      s.stars.push({ x: 24 + Math.random() * (W - 48), y: -16, vy: 95 * emult, got: false });
    }
  }

  for (const b of s.bullets) b.y -= 440 * dt;
  for (const e of s.enemies) {
    e.y += e.vy * dt;
    if (e.y + e.h >= H - 14) {
      e.hit = true;
      lives--;
      updateHud();
      if (lives <= 0) { triggerGameOver('Too many meteors broke through.'); return; }
    }
  }

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (!e.hit && b.x + 4 > e.x && b.x < e.x + e.w && b.y < e.y + e.h && b.y + 10 > e.y) {
        e.hit = true;
        b.hit = true;
        score += 15;
        if (score % 150 === 0) level++;
        saveBest();
        updateHud();
      }
    }
  }

  for (const st of s.stars) {
    st.y += st.vy * dt;
    if (!st.got && st.x > s.px - 10 && st.x < s.px + s.w + 10 && st.y > H - 44 && st.y < H - 12) {
      st.got = true;
      score += 30;
      saveBest();
      updateHud();
    }
  }

  s.bullets = s.bullets.filter(b => !b.hit && b.y > -20);
  s.enemies = s.enemies.filter(e => !e.hit);
  s.stars = s.stars.filter(st => !st.got && st.y < H + 20);
}

function drawScene() {
  const pal = PALETTES[paletteKey];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, pal.bgTop);
  grad.addColorStop(1, pal.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (mode === 'platformer' && platState) {
    const s = platState;
    for (const p of s.platforms) {
      ctx.fillStyle = p.y >= 340 ? pal.ground : pal.plat;
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    ctx.fillStyle = pal.portal;
    ctx.fillRect(s.portal.x, s.portal.y, s.portal.w, s.portal.h);
    for (const c of s.coins) {
      if (c.got) continue;
      ctx.fillStyle = pal.coin;
      ctx.beginPath(); ctx.arc(c.x, c.y, 9, 0, Math.PI * 2); ctx.fill();
    }
    for (const e of s.enemies) {
      ctx.fillStyle = pal.enemy;
      ctx.fillRect(e.x, e.y, 24, 24);
    }
    if (s.invuln <= 0 || Math.floor(s.invuln * 12) % 2 === 0) {
      ctx.fillStyle = pal.hero;
      ctx.fillRect(s.px, s.py, s.w, s.h);
      ctx.fillStyle = '#090D16';
      ctx.fillRect(s.px + 6, s.py + 8, 5, 5);
      ctx.fillRect(s.px + 17, s.py + 8, 5, 5);
    }
  } else if (mode === 'runner' && runnerState) {
    const s = runnerState;
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, 324, W, 56);
    for (const o of s.obstacles) {
      ctx.fillStyle = pal.enemy;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
    for (const orb of s.orbs) {
      ctx.fillStyle = pal.coin;
      ctx.beginPath(); ctx.arc(orb.x, orb.y, 8, 0, Math.PI * 2); ctx.fill();
    }
    const curH = s.ducking ? 20 : 36;
    if (s.invuln <= 0 || Math.floor(s.invuln * 12) % 2 === 0) {
      ctx.fillStyle = pal.hero;
      ctx.fillRect(94, s.py, s.w, curH);
      ctx.fillStyle = '#090D16';
      ctx.fillRect(112, s.py + 6, 6, 5);
    }
  } else if (mode === 'puzzle' && puzzleState) {
    const cellSize = 72, gap = 10;
    const startX = (W - (cellSize * 4 + gap * 3)) / 2;
    const startY = (H - (cellSize * 4 + gap * 3)) / 2;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = puzzleState.grid[r][c];
        const x = startX + c * (cellSize + gap);
        const y = startY + r * (cellSize + gap);
        ctx.fillStyle = val === 0 ? pal.ground : val <= 4 ? pal.plat : val <= 16 ? pal.hero : pal.coin;
        ctx.fillRect(x, y, cellSize, cellSize);
        if (val > 0) {
          ctx.fillStyle = val >= 8 ? '#090D16' : '#F8FAFC';
          ctx.font = 'bold 24px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(val), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  } else if (mode === 'arcade' && arcadeState) {
    const s = arcadeState;
    ctx.fillStyle = pal.hero;
    ctx.fillRect(s.px, H - 32, s.w, s.h);
    ctx.fillRect(s.px + s.w / 2 - 4, H - 40, 8, 8);
    ctx.fillStyle = '#FFFFFF';
    for (const b of s.bullets) ctx.fillRect(b.x, b.y, 4, 12);
    ctx.fillStyle = pal.enemy;
    for (const e of s.enemies) ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = pal.coin;
    for (const st of s.stars) { ctx.beginPath(); ctx.arc(st.x, st.y, 8, 0, Math.PI * 2); ctx.fill(); }
  }
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTime) / 1000 || 0.016);
  lastTime = ts;
  if (status === 'playing') {
    if (mode === 'platformer') stepPlatformer(dt);
    else if (mode === 'runner') stepRunner(dt);
    else if (mode === 'arcade') stepArcade(dt);
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
  if (e.code === 'Space' && status !== 'playing') { resetGame(true); return; }
  if (mode === 'puzzle' && status === 'playing') {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') slidePuzzle('left');
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') slidePuzzle('right');
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') slidePuzzle('up');
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') slidePuzzle('down');
  }
  handleKeyMap(e.code, true);
});
window.addEventListener('keyup', (e) => handleKeyMap(e.code, false));

document.querySelectorAll('.pad-btn').forEach((btn) => {
  const k = btn.dataset.key;
  const press = (e) => {
    e.preventDefault();
    btn.classList.add('pressed');
    keys[k] = true;
    if (mode === 'puzzle' && status === 'playing') slidePuzzle(k);
  };
  const release = () => { btn.classList.remove('pressed'); keys[k] = false; };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointerleave', release);
  btn.addEventListener('pointercancel', release);
});

actionBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (status !== 'playing') { resetGame(true); return; }
  if (mode === 'puzzle' && puzzleState) {
    addPuzzleTile(puzzleState.grid);
    updateHud();
    return;
  }
  keys.action = true;
});
['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
  actionBtn.addEventListener(ev, () => { keys.action = false; });
});

function togglePause() {
  if (status === 'playing') {
    status = 'paused';
    showOverlay('PAUSED', MODE_INFO[mode].title, 'Game paused. Tap Resume or press P to continue.', 'Resume');
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
document.getElementById('paletteSelect').addEventListener('change', (e) => { paletteKey = e.target.value; });
playBtn.addEventListener('click', () => { if (status === 'paused') togglePause(); else resetGame(true); });
document.getElementById('restartBtn').addEventListener('click', () => resetGame(true));
document.getElementById('quickResetBtn').addEventListener('click', () => resetGame(true));
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('canvasFrame').addEventListener('click', () => document.getElementById('canvasFrame').focus());

resetGame(false);
requestAnimationFrame(loop);`,
  };
}
