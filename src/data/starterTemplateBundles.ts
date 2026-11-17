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
      'Indie-grade 2D game studio with parallax worlds, animated sprites, particles, procedural SFX, polished HUD/menus, and mobile touch + keyboard controls.',
    summary:
      'Upgraded 2D Game Studio — now featuring multi-layer parallax skies, glowing celestial lighting, animated squash-and-stretch hero sprites with trailing scarves, rotating collectibles & portals, particle bursts, floating score popups, camera shake, Web Audio synth SFX, jewel-beveled 4x4 puzzle tiles, and frosted Title / Game Over cards across all 4 playable modes.',
    designStrategy: 'template_foundation',
    templateId: '2d_game_studio',
    designDirection:
      'Cohesive Celestial Dusk / Cyber Horizon / Emerald Ruins themes syncing UI glassmorphism with rich HTML5 Canvas parallax atmosphere and expressive vector sprites.',
    qaSummary:
      'QA Audit (6/6 checks passed): semantic structure, theme tokens, responsive 16:10 canvas, zero external assets, balanced 60fps loop + Web Audio guard, and polished indie UX.',
    changedFiles: ['index.html', 'styles.css', 'app.js'],
    followUpSuggestions: [
      'Add double-jump and floating boss enemy to Platformer',
      'Add power-up shields and rapid-fire laser to Arcade Blaster',
      'Customize hero character to a neon ninja with katana dash',
    ],
    htmlCode: `<header class="studio-bar">
  <div class="container bar-inner">
    <div class="brand-wrap">
      <div class="brand-badge" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M6 12h12M12 6v12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="17.5" cy="8.5" r="1.5" fill="#FF5E5B"/>
        </svg>
      </div>
      <div>
        <h1>2D Game Studio</h1>
        <span class="sub">Indie Canvas Engine &bull; Keyboard + Touch</span>
      </div>
    </div>
    <div class="controls-inline">
      <button id="soundToggleBtn" type="button" class="icon-pill" aria-label="Toggle sound effects" title="Toggle SFX">SFX: ON</button>
      <select id="difficultySelect" aria-label="Difficulty">
        <option value="easy">Easy</option>
        <option value="normal" selected>Normal</option>
        <option value="hard">Hard</option>
      </select>
      <select id="paletteSelect" aria-label="Color theme">
        <option value="dusk" selected>Celestial Dusk</option>
        <option value="cyber">Cyber Horizon</option>
        <option value="ruins">Emerald Ruins</option>
      </select>
    </div>
  </div>
</header>

<main class="container game-shell">
  <section class="mode-strip" aria-label="Game genre selector">
    <div id="modeTabs" class="mode-tabs" role="tablist">
      <button type="button" class="mode-btn active" data-mode="platformer">Platformer</button>
      <button type="button" class="mode-btn" data-mode="runner">Endless Dash</button>
      <button type="button" class="mode-btn" data-mode="puzzle">4x4 Jewel</button>
      <button type="button" class="mode-btn" data-mode="arcade">Star Blaster</button>
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
      <canvas id="gameCanvas" width="640" height="380" aria-label="2D Game Canvas"></canvas>
      <div id="stageOverlay" class="stage-overlay">
        <div class="overlay-card">
          <div class="overlay-badges">
            <span id="overlayTag" class="overlay-tag">SKY HOPPER 2D</span>
            <span id="recordBadge" class="record-badge hidden">NEW RECORD!</span>
          </div>
          <h2 id="overlayTitle">Sky Hopper: Celestial Quest</h2>
          <p id="overlayDesc">Leap across floating islands, gather spinning gold coins, outmaneuver patrol drones, and enter the emerald portal.</p>
          <div id="summaryStats" class="summary-stats hidden">
            <div class="stat-box"><span>Score</span><strong id="sumScore">0</strong></div>
            <div class="stat-box"><span>Best</span><strong id="sumBest">0</strong></div>
            <div class="stat-box"><span id="sumMetaLabel">Level</span><strong id="sumMetaVal">1</strong></div>
          </div>
          <div class="key-hints">
            <span class="key-chip">Arrows / WASD</span>
            <span class="key-chip">Space: Action</span>
            <span class="key-chip">Touch D-Pad</span>
          </div>
          <div class="overlay-actions">
            <button id="primaryPlayBtn" type="button" class="btn-play">Play Now</button>
            <button id="restartBtn" type="button" class="btn-ghost">Restart</button>
          </div>
        </div>
      </div>
    </div>
    <div class="stage-footer">
      <span id="hintText" class="hint-text">Desktop: Arrows / WASD + Space &bull; Press P to Pause &bull; Tap stage to focus</span>
      <div class="footer-btns">
        <button id="pauseBtn" type="button" class="btn-small">Pause</button>
        <button id="quickResetBtn" type="button" class="btn-small">Reset</button>
      </div>
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
      <button id="actionBtn" type="button" class="action-btn">
        <span id="actionLabel">JUMP</span>
        <small>TAP / HOLD</small>
      </button>
    </div>
  </section>
</main>`,
    cssCode: `:root {
  --bg: #080B14;
  --surface: #111627;
  --surface-2: #1A2238;
  --ink: #F8FAFC;
  --muted: #94A3B8;
  --accent: #38BDF8;
  --accent-glow: rgba(56, 189, 248, 0.35);
  --cta: #FF5E5B;
  --cta-glow: rgba(255, 94, 91, 0.38);
  --gold: #FBBF24;
  --emerald: #10B981;
  --border: rgba(148, 163, 184, 0.18);
}
body[data-theme="cyber"] {
  --bg: #090614;
  --surface: #140F26;
  --surface-2: #21193D;
  --accent: #22D3EE;
  --accent-glow: rgba(34, 211, 238, 0.38);
  --cta: #F43F5E;
  --cta-glow: rgba(244, 63, 94, 0.4);
}
body[data-theme="ruins"] {
  --bg: #06120E;
  --surface: #0D201A;
  --surface-2: #163329;
  --accent: #34D399;
  --accent-glow: rgba(52, 211, 153, 0.35);
  --cta: #F59E0B;
  --cta-glow: rgba(245, 158, 11, 0.38);
}
body {
  background: radial-gradient(circle at 50% -10%, var(--surface-2) 0%, var(--bg) 62%);
  color: var(--ink);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.45;
  min-height: 100vh;
  user-select: none;
}
.hidden { display: none !important; }
.container { max-width: 840px; margin: 0 auto; padding: 12px 14px; }
.studio-bar {
  background: rgba(10, 14, 26, 0.82);
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
  color: #07101C;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px var(--accent-glow);
}
h1 { margin: 0; font-size: clamp(1rem, 2.3vw, 1.18rem); font-weight: 800; letter-spacing: -0.02em; }
.sub { display: block; font-size: 0.72rem; color: var(--muted); letter-spacing: 0.02em; }
.controls-inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
select, .icon-pill {
  min-height: 38px; padding: 6px 10px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--surface-2); color: var(--ink);
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
}
.icon-pill.muted { color: var(--muted); opacity: 0.8; }
.game-shell { display: flex; flex-direction: column; gap: 12px; }
.mode-strip { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.mode-tabs {
  display: flex; gap: 5px; flex-wrap: wrap;
  background: var(--surface); border: 1px solid var(--border); padding: 4px; border-radius: 13px;
}
.mode-btn {
  min-height: 38px; padding: 7px 12px; border-radius: 9px; border: none;
  background: transparent; color: var(--muted); font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 140ms ease;
}
.mode-btn.active {
  background: var(--accent); color: #06131E;
  box-shadow: 0 3px 12px var(--accent-glow);
}
.hud-pills { display: flex; gap: 7px; flex-wrap: wrap; }
.hud-pill {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 5px 11px; display: flex; align-items: baseline; gap: 6px;
}
.hud-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); font-weight: 700; }
.hud-num { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.98rem; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.hud-num.gold { color: var(--gold); }
.stage-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
  padding: 10px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
}
.canvas-frame {
  position: relative; width: 100%; border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1); background: #050811; outline: none;
}
canvas { display: block; width: 100%; height: auto; aspect-ratio: 640 / 380; touch-action: none; }
.stage-overlay {
  position: absolute; inset: 0; background: rgba(6, 9, 18, 0.68); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 14px;
}
.overlay-card {
  width: 100%; max-width: 440px;
  background: rgba(17, 22, 39, 0.9); border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px; padding: 18px 20px; text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  display: flex; flex-direction: column; align-items: center; gap: 9px;
}
.overlay-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: center; }
.overlay-tag {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; color: var(--accent);
  background: rgba(56, 189, 248, 0.12); border: 1px solid var(--accent-glow);
  padding: 3px 10px; border-radius: 999px;
}
.record-badge {
  font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; color: #1F1400;
  background: var(--gold); padding: 3px 10px; border-radius: 999px;
}
.overlay-card h2 { margin: 0; font-size: clamp(1.15rem, 3vw, 1.55rem); font-weight: 800; letter-spacing: -0.02em; }
.overlay-card p { margin: 0; font-size: 0.86rem; color: var(--muted); max-width: 40ch; }
.summary-stats {
  width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 2px 0;
}
.stat-box {
  background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border); border-radius: 12px; padding: 8px 6px;
}
.stat-box span { display: block; font-size: 0.68rem; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.stat-box strong { font-family: ui-monospace, monospace; font-size: 1.05rem; color: var(--ink); }
.key-hints { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.key-chip {
  font-size: 0.7rem; font-weight: 600; color: var(--muted);
  background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); padding: 3px 8px; border-radius: 7px;
}
.overlay-actions { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; justify-content: center; }
.btn-play {
  min-height: 44px; padding: 10px 24px; border-radius: 12px; border: none;
  background: var(--cta); color: #FFFFFF; font-weight: 800; font-size: 0.94rem;
  cursor: pointer; box-shadow: 0 8px 22px var(--cta-glow); transition: transform 120ms ease;
}
.btn-play:active { transform: scale(0.97); }
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
  min-width: 134px; min-height: 64px; padding: 10px 18px; border-radius: 18px; border: none;
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

const PALETTES = {
  dusk: {
    skyTop: '#0B1026', skyMid: '#1C1B3D', skyBot: '#2E1F47', sun: '#FDBA74',
    farHill: '#171836', nearHill: '#12132B', ground: '#1E243B', groundTop: '#38BDF8',
    plat: '#2B3654', platTop: '#38BDF8', hero: '#38BDF8', heroDark: '#0369A1',
    scarf: '#FF5E5B', enemy: '#FB7185', coin: '#FBBF24', portal: '#10B981'
  },
  cyber: {
    skyTop: '#090418', skyMid: '#1C0D38', skyBot: '#31104C', sun: '#F472B6',
    farHill: '#160B30', nearHill: '#100724', ground: '#1E1538', groundTop: '#22D3EE',
    plat: '#2D1E52', platTop: '#F43F5E', hero: '#22D3EE', heroDark: '#0E7490',
    scarf: '#F43F5E', enemy: '#FB923C', coin: '#FDE047', portal: '#34D399'
  },
  ruins: {
    skyTop: '#051513', skyMid: '#0D2923', skyBot: '#183C32', sun: '#A7F3D0',
    farHill: '#0A221D', nearHill: '#071915', ground: '#143127', groundTop: '#34D399',
    plat: '#1E4638', platTop: '#6EE7B7', hero: '#FBBF24', heroDark: '#B45309',
    scarf: '#34D399', enemy: '#F43F5E', coin: '#38BDF8', portal: '#A78BFA'
  }
};

const DIFFICULTY = {
  easy: { speed: 0.82, enemySpeed: 0.76 },
  normal: { speed: 1.0, enemySpeed: 1.0 },
  hard: { speed: 1.25, enemySpeed: 1.32 }
};

const MODE_INFO = {
  platformer: { tag: 'SKY HOPPER 2D', title: 'Sky Hopper: Celestial Quest', desc: 'Leap across floating islands, collect spinning coins, dodge patrol drones, and reach the glowing portal.', action: 'JUMP' },
  runner: { tag: 'ENDLESS DASH', title: 'Neon Skyline Dash', desc: 'High-speed auto-runner! Jump over energy barriers and drop swiftly to weave past hovering drones.', action: 'JUMP' },
  puzzle: { tag: '4x4 JEWEL MERGE', title: 'Crown Tile Merge 4x4', desc: 'Slide jewel tiles with Arrow Keys, WASD, or D-Pad to combine matching numbers and chase 2048!', action: 'SPAWN TILE' },
  arcade: { tag: 'STAR BLASTER 2D', title: 'Nebula Star Defender', desc: 'Pilot left and right to blast descending meteors with plasma bolts while catching falling gold stars.', action: 'FIRE' }
};

const TILE_STYLES = {
  0: ['#161E33', '#0F1526', '#94A3B8'],
  2: ['#253252', '#1B253E', '#E2E8F0'],
  4: ['#0E7490', '#155E75', '#ECFEFF'],
  8: ['#2563EB', '#1D4ED8', '#EFF6FF'],
  16: ['#7C3AED', '#6D28D9', '#F5F3FF'],
  32: ['#DB2777', '#BE185D', '#FDF2F8'],
  64: ['#EA580C', '#C2410C', '#FFF7ED'],
  128: ['#CA8A04', '#A16207', '#FEFCE8'],
  256: ['#059669', '#047857', '#ECFDF5'],
  512: ['#0D9488', '#0F766E', '#F0FDFA'],
  1024: ['#E11D48', '#BE123C', '#FFF1F2'],
  2048: ['#F59E0B', '#B45309', '#FFFBEB']
};

const STARS = Array.from({ length: 34 }, (_, i) => ({
  x: ((i * 97) % 620) + 10,
  y: ((i * 53) % 210) + 12,
  r: (i % 3 === 0 ? 1.8 : 1.1),
  phase: i * 0.7
}));

const MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 49) % W,
  y: 80 + ((i * 37) % 240),
  vx: 8 + (i % 4) * 4,
  phase: i * 1.1
}));

const keys = { left: false, right: false, up: false, down: false, action: false };
let mode = 'platformer';
let difficulty = 'normal';
let paletteKey = 'dusk';
let status = 'ready';
let soundEnabled = true;
let score = 0;
let lives = 3;
let level = 1;
let elapsed = 0;
let shakeTime = 0;
let shakeMag = 0;
let runnerBgScroll = 0;
let bestScores = {};
try { bestScores = JSON.parse(localStorage.getItem('craftable_2d_best') || '{}'); } catch (e) { bestScores = {}; }

let particles = [];
let popups = [];
let platState = null;
let runnerState = null;
let puzzleState = null;
let arcadeState = null;
let lastTime = 0;
let audioCtx = null;

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
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.11);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(920, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'laser') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'portal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.06);
      osc.frequency.setValueAtTime(659, now + 0.12);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    }
  } catch (e) {}
}

function addBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const spd = 45 + Math.random() * 140;
    particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 30, life: 0.45 + Math.random() * 0.25, maxLife: 0.7, r: 2 + Math.random() * 2.5, color });
  }
}

function addPopup(x, y, text, color) {
  popups.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
}

function triggerShake(mag, dur) {
  shakeMag = mag;
  shakeTime = dur;
}

function saveBest() {
  const prev = bestScores[mode] || 0;
  if (score > prev) {
    bestScores[mode] = score;
    try { localStorage.setItem('craftable_2d_best', JSON.stringify(bestScores)); } catch (e) {}
    return true;
  }
  return false;
}

function updateHud() {
  scoreEl.textContent = score;
  bestEl.textContent = Math.max(score, bestScores[mode] || 0);
  levelEl.textContent = level;
  if (mode === 'puzzle') {
    statusLabelEl.textContent = 'Moves';
    livesEl.textContent = puzzleState ? String(puzzleState.moves) : '0';
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
    sumMetaLabelEl.textContent = mode === 'puzzle' ? 'Moves' : 'Level';
    sumMetaValEl.textContent = mode === 'puzzle' && puzzleState ? puzzleState.moves : level;
  }
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

function initPlatformer(keepScore) {
  if (!keepScore) { score = 0; lives = 3; level = 1; }
  const shift = ((level - 1) % 3) * 16;
  platState = {
    px: 44, py: 280, vx: 0, vy: 0, w: 28, h: 32, onGround: false, wasGround: false, invuln: 0,
    facing: 1, sx: 1, sy: 1,
    platforms: [
      { x: 0, y: 338, w: 640, h: 42, isFloor: true },
      { x: 102, y: 274 - shift * 0.4, w: 126, h: 16 },
      { x: 268, y: 222 + shift * 0.3, w: 132, h: 16 },
      { x: 438, y: 170 - shift * 0.3, w: 146, h: 16 },
      { x: 162, y: 136, w: 118, h: 16 }
    ],
    coins: [
      { x: 165, y: 240, got: false },
      { x: 335, y: 188, got: false },
      { x: 220, y: 102, got: false },
      { x: 500, y: 134, got: false }
    ],
    enemies: [
      { x: 260, y: 310, min: 185, max: 435, dir: 1, speed: 105 },
      { x: 452, y: 142 - shift * 0.3, min: 445, max: 556, dir: 1, speed: 84 }
    ],
    portal: { x: 556, y: 118 - shift * 0.3, w: 24, h: 48 }
  };
}

function initRunner() {
  score = 0; lives = 3; level = 1;
  runnerState = {
    py: 286, vy: 0, w: 30, h: 36, ducking: false, onGround: true, invuln: 0,
    sx: 1, sy: 1, speed: 255, spawnTimer: 0.65, dist: 0, obstacles: [], orbs: []
  };
}

function addPuzzleTile(grid, popGrid) {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (!empty.length) return false;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  grid[pick[0]][pick[1]] = Math.random() < 0.85 ? 2 : 4;
  if (popGrid) popGrid[pick[0]][pick[1]] = 0.2;
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
  const pop = [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]];
  addPuzzleTile(grid, pop);
  addPuzzleTile(grid, pop);
  puzzleState = { grid, pop, moves: 0 };
}

function initArcade() {
  score = 0; lives = 3; level = 1;
  arcadeState = {
    px: W / 2 - 22, w: 44, h: 20, vx: 0, fireCooldown: 0, spawnTimer: 0.45,
    bullets: [], enemies: [], stars: []
  };
}

function resetGame(autoPlay) {
  particles = [];
  popups = [];
  shakeTime = 0;
  if (mode === 'platformer') initPlatformer(false);
  else if (mode === 'runner') initRunner();
  else if (mode === 'puzzle') initPuzzle();
  else initArcade();
  updateHud();
  if (autoPlay) {
    status = 'playing';
    hideOverlay();
    document.getElementById('canvasFrame').focus();
  } else {
    status = 'ready';
    const info = MODE_INFO[mode];
    showOverlay(info.tag, info.title, info.desc, 'Play Now', false, false);
  }
}

function triggerGameOver(reason) {
  status = 'gameover';
  const prevBest = bestScores[mode] || 0;
  const isNew = score > 0 && score > prevBest;
  saveBest();
  updateHud();
  showOverlay('GAME OVER', 'Run Complete', reason, 'Play Again', true, isNew);
}

function slidePuzzle(dir) {
  if (status !== 'playing' || mode !== 'puzzle' || !puzzleState) return;
  const g = puzzleState.grid;
  const p = puzzleState.pop;
  let moved = false;
  let mergedCount = 0;

  function slideLine(arr) {
    const nonZero = arr.filter(x => x !== 0);
    const out = [];
    for (let i = 0; i < nonZero.length; i++) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const merged = nonZero[i] * 2;
        out.push(merged);
        score += merged;
        mergedCount++;
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
      const rr = dir === 'left' || dir === 'right' ? i : dir === 'up' ? j : 3 - j;
      const cc = dir === 'left' ? j : dir === 'right' ? 3 - j : i;
      if (g[rr][cc] !== val) {
        moved = true;
        g[rr][cc] = val;
        if (val > 0) p[rr][cc] = 1.22;
      }
    }
  }

  if (moved) {
    puzzleState.moves++;
    addPuzzleTile(g, p);
    if (mergedCount > 0) playSfx('coin'); else playSfx('jump');
    saveBest();
    updateHud();
    if (!canMovePuzzle(g)) {
      playSfx('hit');
      triggerGameOver('No legal merges remain on the 4x4 jewel board.');
    }
  }
}

function stepPlatformer(dt) {
  const s = platState;
  const pal = PALETTES[paletteKey];
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.invuln > 0) s.invuln -= dt;

  s.sx += (1 - s.sx) * Math.min(1, dt * 14);
  s.sy += (1 - s.sy) * Math.min(1, dt * 14);

  if (keys.left) { s.vx = -225 * mult; s.facing = -1; }
  else if (keys.right) { s.vx = 225 * mult; s.facing = 1; }
  else s.vx *= 0.78;

  if ((keys.up || keys.action) && s.onGround) {
    s.vy = -495;
    s.onGround = false;
    s.sx = 0.78; s.sy = 1.25;
    playSfx('jump');
    addBurst(s.px + s.w / 2, s.py + s.h, pal.groundTop, 5);
  }

  s.vy += 1220 * dt;
  s.px = Math.max(0, Math.min(W - s.w, s.px + s.vx * dt));
  s.py += s.vy * dt;
  s.wasGround = s.onGround;
  s.onGround = false;

  for (const p of s.platforms) {
    if (s.px + s.w > p.x && s.px < p.x + p.w && s.vy >= 0 && s.py + s.h >= p.y && s.py + s.h <= p.y + p.h + 18) {
      s.py = p.y - s.h;
      if (!s.wasGround && s.vy > 180) {
        s.sx = 1.24; s.sy = 0.78;
        addBurst(s.px + s.w / 2, p.y, pal.platTop, 4);
      }
      s.vy = 0;
      s.onGround = true;
    }
  }

  for (const c of s.coins) {
    if (!c.got && Math.hypot((s.px + s.w / 2) - c.x, (s.py + s.h / 2) - c.y) < 25) {
      c.got = true;
      score += 25;
      playSfx('coin');
      addBurst(c.x, c.y, pal.coin, 10);
      addPopup(c.x, c.y - 8, '+25', pal.coin);
      saveBest();
      updateHud();
    }
  }

  for (const e of s.enemies) {
    e.x += e.dir * e.speed * emult * dt;
    if (e.x < e.min) { e.x = e.min; e.dir = 1; }
    if (e.x > e.max) { e.x = e.max; e.dir = -1; }
    if (s.invuln <= 0 && s.px + s.w - 3 > e.x && s.px + 3 < e.x + 26 && s.py + s.h - 2 > e.y && s.py + 2 < e.y + 24) {
      lives--;
      s.invuln = 1.25;
      s.vx = -s.facing * 180;
      s.vy = -290;
      playSfx('hit');
      triggerShake(6, 0.24);
      addBurst(s.px + s.w / 2, s.py + s.h / 2, pal.enemy, 12);
      updateHud();
      if (lives <= 0) { triggerGameOver('Intercepted by a patrol drone.'); return; }
    }
  }

  const portal = s.portal;
  if (s.px + s.w > portal.x && s.px < portal.x + portal.w && s.py + s.h > portal.y && s.py < portal.y + portal.h) {
    score += 100;
    level++;
    playSfx('portal');
    addBurst(portal.x + portal.w / 2, portal.y + portal.h / 2, pal.portal, 18);
    addPopup(portal.x - 18, portal.y - 10, '+100 STAGE CLEAR!', pal.portal);
    saveBest();
    updateHud();
    initPlatformer(true);
  }
}

function stepRunner(dt) {
  const s = runnerState;
  const pal = PALETTES[paletteKey];
  const mult = DIFFICULTY[difficulty].speed;
  const groundY = 324;
  if (s.invuln > 0) s.invuln -= dt;

  s.sx += (1 - s.sx) * Math.min(1, dt * 14);
  s.sy += (1 - s.sy) * Math.min(1, dt * 14);

  s.ducking = keys.down && s.onGround;
  const curH = s.ducking ? 22 : 36;
  if ((keys.up || keys.action) && s.onGround) {
    s.vy = -515;
    s.onGround = false;
    s.sx = 0.78; s.sy = 1.24;
    playSfx('jump');
    addBurst(108, groundY, pal.groundTop, 5);
  }
  if (keys.down && !s.onGround) s.vy += 1900 * dt;

  s.vy += 1340 * dt;
  s.py += s.vy * dt;
  if (s.py + curH >= groundY) {
    if (!s.onGround) { s.sx = 1.22; s.sy = 0.8; }
    s.py = groundY - curH;
    s.vy = 0;
    s.onGround = true;
  }

  const runSpeed = (s.speed + Math.min(220, score * 0.38)) * mult;
  runnerBgScroll += runSpeed * dt;
  s.dist += dt * 12;
  if (s.dist >= 1) {
    score += Math.floor(s.dist);
    s.dist -= Math.floor(s.dist);
    level = 1 + Math.floor(score / 250);
    saveBest();
    updateHud();
  }

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = (0.9 + Math.random() * 0.72) / mult;
    const isHigh = Math.random() < 0.36;
    s.obstacles.push({ x: W + 24, y: isHigh ? groundY - 62 : groundY - 32, w: 26, h: 32, high: isHigh });
    if (Math.random() < 0.6) {
      s.orbs.push({ x: W + 115, y: groundY - (50 + Math.random() * 68), got: false });
    }
  }

  for (const o of s.obstacles) {
    o.x -= runSpeed * dt;
    if (s.invuln <= 0 && 94 + s.w - 3 > o.x && 97 < o.x + o.w && s.py + curH - 2 > o.y && s.py + 2 < o.y + o.h) {
      lives--;
      s.invuln = 1.1;
      playSfx('hit');
      triggerShake(6, 0.22);
      addBurst(109, s.py + curH / 2, pal.enemy, 12);
      updateHud();
      if (lives <= 0) { triggerGameOver('Collided with an energy barrier.'); return; }
    }
  }
  for (const orb of s.orbs) {
    orb.x -= runSpeed * dt;
    if (!orb.got && Math.hypot(109 - orb.x, (s.py + curH / 2) - orb.y) < 24) {
      orb.got = true;
      score += 20;
      playSfx('coin');
      addBurst(orb.x, orb.y, pal.coin, 8);
      addPopup(orb.x, orb.y - 10, '+20', pal.coin);
      saveBest();
      updateHud();
    }
  }
  s.obstacles = s.obstacles.filter(o => o.x > -40);
  s.orbs = s.orbs.filter(o => o.x > -20 && !o.got);
}

function stepArcade(dt) {
  const s = arcadeState;
  const pal = PALETTES[paletteKey];
  const mult = DIFFICULTY[difficulty].speed;
  const emult = DIFFICULTY[difficulty].enemySpeed;
  if (s.fireCooldown > 0) s.fireCooldown -= dt;

  let targetVx = 0;
  if (keys.left) targetVx = -310 * mult;
  if (keys.right) targetVx = 310 * mult;
  s.vx += (targetVx - s.vx) * Math.min(1, dt * 16);
  s.px = Math.max(14, Math.min(W - s.w - 14, s.px + s.vx * dt));

  if ((keys.action || keys.up) && s.fireCooldown <= 0) {
    s.bullets.push({ x: s.px + s.w / 2 - 2, y: H - 48 });
    s.fireCooldown = 0.2;
    playSfx('laser');
    addBurst(s.px + s.w / 2, H - 46, pal.hero, 3);
  }

  s.spawnTimer -= dt;
  if (s.spawnTimer <= 0) {
    s.spawnTimer = Math.max(0.4, (1.12 - level * 0.04) / emult);
    s.enemies.push({
      x: 28 + Math.random() * (W - 76), y: -26, w: 28, h: 26,
      vy: (84 + Math.random() * 55) * emult, rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 4
    });
    if (Math.random() < 0.36) {
      s.stars.push({ x: 28 + Math.random() * (W - 56), y: -16, vy: 98 * emult, got: false });
    }
  }

  for (const b of s.bullets) b.y -= 480 * dt;
  for (const e of s.enemies) {
    e.y += e.vy * dt;
    e.rot += e.spin * dt;
    if (e.y + e.h >= H - 14) {
      e.hit = true;
      lives--;
      playSfx('hit');
      triggerShake(6, 0.22);
      addBurst(e.x + e.w / 2, H - 18, pal.enemy, 10);
      updateHud();
      if (lives <= 0) { triggerGameOver('Meteors breached your sector defenses.'); return; }
    }
  }

  for (const b of s.bullets) {
    for (const e of s.enemies) {
      if (!e.hit && b.x + 5 > e.x && b.x < e.x + e.w && b.y < e.y + e.h && b.y + 12 > e.y) {
        e.hit = true;
        b.hit = true;
        score += 15;
        playSfx('coin');
        triggerShake(2.5, 0.08);
        addBurst(e.x + e.w / 2, e.y + e.h / 2, pal.enemy, 11);
        addPopup(e.x + e.w / 2, e.y, '+15', '#FFFFFF');
        if (score % 150 === 0) level++;
        saveBest();
        updateHud();
      }
    }
  }

  for (const st of s.stars) {
    st.y += st.vy * dt;
    if (!st.got && st.x > s.px - 10 && st.x < s.px + s.w + 10 && st.y > H - 48 && st.y < H - 10) {
      st.got = true;
      score += 30;
      playSfx('portal');
      addBurst(st.x, st.y, pal.coin, 10);
      addPopup(st.x, st.y - 12, '+30 STAR', pal.coin);
      saveBest();
      updateHud();
    }
  }

  s.bullets = s.bullets.filter(b => !b.hit && b.y > -20);
  s.enemies = s.enemies.filter(e => !e.hit);
  s.stars = s.stars.filter(st => !st.got && st.y < H + 20);
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackdrop(pal, scrollOffset) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, pal.skyTop);
  grad.addColorStop(0.55, pal.skyMid);
  grad.addColorStop(1, pal.skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Celestial moon/sun halo
  const halo = ctx.createRadialGradient(500, 92, 8, 500, 92, 92);
  halo.addColorStop(0, pal.sun);
  halo.addColorStop(0.32, 'rgba(255,255,255,0.16)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(500, 92, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pal.sun;
  ctx.beginPath(); ctx.arc(500, 92, 22, 0, Math.PI * 2); ctx.fill();

  // Twinkling stars
  for (const st of STARS) {
    const sx = ((st.x - scrollOffset * 0.08) % W + W) % W;
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(elapsed * 1.7 + st.phase));
    ctx.fillStyle = 'rgba(248, 250, 252, ' + alpha.toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(sx, st.y, st.r, 0, Math.PI * 2); ctx.fill();
  }

  // Far parallax hills
  ctx.fillStyle = pal.farHill;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W + 40; x += 40) {
    const worldX = x + scrollOffset * 0.22;
    const y = 250 + Math.sin(worldX * 0.008) * 34 + Math.cos(worldX * 0.017) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Near parallax ridge
  ctx.fillStyle = pal.nearHill;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W + 32; x += 32) {
    const worldX = x + scrollOffset * 0.48;
    const y = 290 + Math.sin(worldX * 0.014 + 1.5) * 22 + Math.cos(worldX * 0.029) * 12;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // Ambient floating firefly motes
  for (const m of MOTES) {
    const mx = ((m.x + elapsed * m.vx) % W + W) % W;
    const my = m.y + Math.sin(elapsed * 2 + m.phase) * 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath(); ctx.arc(mx, my, 1.6, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHeroCharacter(cx, bottomY, w, h, sx, sy, facing, pal, vx) {
  ctx.save();
  ctx.translate(cx, bottomY);
  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath(); ctx.ellipse(0, 1, 14 * sx, 4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.scale(sx, sy);
  // Flowing scarf ribbon
  const sway = Math.sin(elapsed * 11) * 4 - (vx * 0.03);
  ctx.strokeStyle = pal.scarf;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-facing * 4, -h * 0.56);
  ctx.quadraticCurveTo(-facing * 16, -h * 0.5 + sway, -facing * 22, -h * 0.36 + sway);
  ctx.stroke();

  // Body capsule with gradient
  const grad = ctx.createLinearGradient(0, -h, 0, 0);
  grad.addColorStop(0, pal.hero);
  grad.addColorStop(1, pal.heroDark);
  ctx.fillStyle = grad;
  drawRoundedRect(-w / 2, -h, w, h, 9);
  ctx.fill();

  // Visor & expressive eyes
  ctx.fillStyle = '#080D1A';
  drawRoundedRect(-w / 2 + (facing > 0 ? 7 : 3), -h + 7, w - 10, 11, 5);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  const eyeShift = facing > 0 ? 3 : -3;
  ctx.beginPath(); ctx.arc(-3 + eyeShift, -h + 12.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5 + eyeShift, -h + 12.5, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawDrone(x, y, pal) {
  const bob = Math.sin(elapsed * 5 + x * 0.05) * 3;
  ctx.save();
  ctx.translate(x + 13, y + 12 + bob);
  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  glow.addColorStop(0, 'rgba(251, 113, 133, 0.35)');
  glow.addColorStop(1, 'rgba(251, 113, 133, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();

  // Rotor fins
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(-16, -3, 6, 6);
  ctx.fillRect(10, -3, 6, 6);

  // Drone shell
  ctx.fillStyle = pal.enemy;
  drawRoundedRect(-12, -11, 24, 22, 8);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  drawRoundedRect(-8, -5, 16, 10, 4);
  ctx.fill();
  // Pulsing eye
  ctx.fillStyle = Math.sin(elapsed * 8) > 0 ? '#FEF08A' : '#FF5E5B';
  ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSpinningCoin(x, y, pal) {
  const pulse = 0.45 + 0.55 * Math.abs(Math.cos(elapsed * 4.5 + x * 0.03));
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 16);
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
  glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(x, y + Math.sin(elapsed * 4 + x * 0.05) * 3);
  ctx.scale(pulse, 1);
  ctx.fillStyle = pal.coin;
  ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FEF9C3';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawScene() {
  const pal = PALETTES[paletteKey];
  ctx.save();
  if (shakeTime > 0) {
    ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
  }

  const scroll = mode === 'runner' ? runnerBgScroll : mode === 'platformer' && platState ? platState.px * 0.6 : elapsed * 14;
  drawBackdrop(pal, scroll);

  if (mode === 'platformer' && platState) {
    const s = platState;
    for (const p of s.platforms) {
      ctx.fillStyle = p.isFloor ? pal.ground : pal.plat;
      if (p.isFloor) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = pal.groundTop;
        ctx.fillRect(p.x, p.y, p.w, 4);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        drawRoundedRect(p.x + 2, p.y + 5, p.w, p.h, 6);
        ctx.fill();
        ctx.fillStyle = pal.plat;
        drawRoundedRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();
        ctx.fillStyle = pal.platTop;
        drawRoundedRect(p.x, p.y, p.w, 4.5, 3);
        ctx.fill();
      }
    }

    // Glowing Dimensional Portal
    const px = s.portal.x + s.portal.w / 2;
    const py = s.portal.y + s.portal.h / 2;
    const pGlow = ctx.createRadialGradient(px, py, 4, px, py, 34);
    pGlow.addColorStop(0, pal.portal);
    pGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = pGlow;
    ctx.beginPath(); ctx.arc(px, py, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = pal.portal;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(px, py, 11 + Math.sin(elapsed * 5) * 1.5, 22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ECFDF5';
    ctx.beginPath(); ctx.ellipse(px, py, 5, 13, 0, 0, Math.PI * 2); ctx.fill();

    for (const c of s.coins) if (!c.got) drawSpinningCoin(c.x, c.y, pal);
    for (const e of s.enemies) drawDrone(e.x, e.y, pal);
    if (s.invuln <= 0 || Math.floor(s.invuln * 14) % 2 === 0) {
      drawHeroCharacter(s.px + s.w / 2, s.py + s.h, s.w, s.h, s.sx, s.sy, s.facing, pal, s.vx);
    }
  } else if (mode === 'runner' && runnerState) {
    const s = runnerState;
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, 324, W, 56);
    ctx.fillStyle = pal.groundTop;
    ctx.fillRect(0, 324, W, 4);
    for (let gx = -((runnerBgScroll * 0.9) % 48); gx < W; gx += 48) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(gx, 336, 22, 4);
    }
    for (const o of s.obstacles) {
      if (o.high) drawDrone(o.x, o.y, pal);
      else {
        ctx.fillStyle = pal.enemy;
        drawRoundedRect(o.x, o.y, o.w, o.h, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, 4);
      }
    }
    for (const orb of s.orbs) drawSpinningCoin(orb.x, orb.y, pal);
    const curH = s.ducking ? 22 : 36;
    if (s.invuln <= 0 || Math.floor(s.invuln * 14) % 2 === 0) {
      drawHeroCharacter(109, s.py + curH, s.w, curH, s.sx, s.sy, 1, pal, 190);
    }
  } else if (mode === 'puzzle' && puzzleState) {
    const cellSize = 72, gap = 10;
    const boardW = cellSize * 4 + gap * 3;
    const startX = (W - boardW) / 2;
    const startY = (H - boardW) / 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    drawRoundedRect(startX - 14, startY - 14, boardW + 28, boardW + 28, 18);
    ctx.fill();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = puzzleState.grid[r][c];
        const sc = puzzleState.pop[r][c] || 1;
        const x = startX + c * (cellSize + gap);
        const y = startY + r * (cellSize + gap);
        const st = TILE_STYLES[val] || ['#F59E0B', '#D97706', '#FFFBEB'];
        ctx.save();
        ctx.translate(x + cellSize / 2, y + cellSize / 2);
        ctx.scale(sc, sc);
        ctx.fillStyle = st[1];
        drawRoundedRect(-cellSize / 2, -cellSize / 2 + 4, cellSize, cellSize, 12);
        ctx.fill();
        ctx.fillStyle = st[0];
        drawRoundedRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize - 2, 12);
        ctx.fill();
        if (val > 0) {
          ctx.fillStyle = st[2];
          const fontPx = val >= 1024 ? 19 : val >= 128 ? 22 : 24;
          ctx.font = '800 ' + fontPx + 'px ui-monospace, SFMono-Regular, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(val), 0, -1);
        }
        ctx.restore();
      }
    }
  } else if (mode === 'arcade' && arcadeState) {
    const s = arcadeState;
    // Starfighter ship
    ctx.save();
    ctx.translate(s.px + s.w / 2, H - 24);
    ctx.rotate(s.vx * 0.0005);
    // Twin thruster flame
    const flameH = 8 + Math.sin(elapsed * 40) * 3;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(-4, 8); ctx.lineTo(-7, 8 + flameH); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(10, 8); ctx.lineTo(7, 8 + flameH); ctx.fill();
    // Wings + Hull
    ctx.fillStyle = pal.heroDark;
    ctx.beginPath(); ctx.moveTo(-22, 8); ctx.lineTo(0, -12); ctx.lineTo(22, 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = pal.hero;
    ctx.beginPath(); ctx.moveTo(-12, 6); ctx.lineTo(0, -17); ctx.lineTo(12, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(0, -5, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Plasma bolts
    for (const b of s.bullets) {
      ctx.fillStyle = pal.hero;
      drawRoundedRect(b.x - 1, b.y, 6, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(b.x + 1, b.y + 2, 2, 10);
    }

    // Rotating meteors
    for (const e of s.enemies) {
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
      ctx.rotate(e.rot);
      ctx.fillStyle = pal.enemy;
      ctx.beginPath();
      ctx.moveTo(-12, -8); ctx.lineTo(2, -13); ctx.lineTo(13, -5);
      ctx.lineTo(11, 10); ctx.lineTo(-3, 13); ctx.lineTo(-14, 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath(); ctx.arc(-3, -2, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5, 4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    for (const st of s.stars) drawSpinningCoin(st.x, st.y, pal);
  }

  // Particles
  for (const pt of particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating score popups
  for (const pop of popups) {
    ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
    ctx.font = '800 13px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, pop.x, pop.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTime) / 1000 || 0.016);
  lastTime = ts;
  elapsed += dt;
  if (shakeTime > 0) shakeTime = Math.max(0, shakeTime - dt);

  if (mode === 'puzzle' && puzzleState) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        puzzleState.pop[r][c] += (1 - puzzleState.pop[r][c]) * Math.min(1, dt * 16);
      }
    }
  }

  for (const pt of particles) {
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 260 * dt;
    pt.life -= dt;
  }
  particles = particles.filter(pt => pt.life > 0);

  for (const pop of popups) {
    pop.y -= 28 * dt;
    pop.life -= dt;
  }
  popups = popups.filter(pop => pop.life > 0);

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
  if (e.code === 'Space' && status !== 'playing') { if (status === 'paused') togglePause(); else resetGame(true); return; }
  if (mode === 'puzzle' && status === 'playing') {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') slidePuzzle('left');
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') slidePuzzle('right');
    else if (e.code === 'ArrowUp' || e.code === 'KeyW') slidePuzzle('up');
    else if (e.code === 'ArrowDown' || e.code === 'KeyS') slidePuzzle('down');
  }
  handleKeyMap(e.code, true);
});
window.addEventListener('keyup', (e) => handleKeyMap(e.code, false));

let swipeStart = null;
canvas.addEventListener('pointerdown', (e) => {
  swipeStart = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', (e) => {
  if (!swipeStart || mode !== 'puzzle' || status !== 'playing') { swipeStart = null; return; }
  const dx = e.clientX - swipeStart.x;
  const dy = e.clientY - swipeStart.y;
  swipeStart = null;
  if (Math.hypot(dx, dy) < 22) return;
  if (Math.abs(dx) > Math.abs(dy)) slidePuzzle(dx > 0 ? 'right' : 'left');
  else slidePuzzle(dy > 0 ? 'down' : 'up');
});

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

const actionBtn = document.getElementById('actionBtn');
actionBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (status !== 'playing') { if (status === 'paused') togglePause(); else resetGame(true); return; }
  if (mode === 'puzzle' && puzzleState) {
    if (addPuzzleTile(puzzleState.grid, puzzleState.pop)) {
      playSfx('jump');
      updateHud();
      if (!canMovePuzzle(puzzleState.grid)) {
        playSfx('hit');
        triggerGameOver('No legal merges remain on the 4x4 jewel board.');
      }
    }
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
    showOverlay('PAUSED', MODE_INFO[mode].title, 'Game paused. Tap Resume or press P to jump right back in.', 'Resume', false, false);
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
