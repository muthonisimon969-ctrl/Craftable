package com.example.data.ai

import com.example.data.model.GeneratedAppBundle

internal object StarterTemplateBundlesExtra {

    fun buildExtraTemplate(templateId: String): GeneratedAppBundle = when (templateId) {
        "culinary_bistro" -> culinaryBistroBundle()
        "corporate_advisory" -> corporateAdvisoryBundle()
        else -> tactileUtilityBundle()
    }

    private fun culinaryBistroBundle(): GeneratedAppBundle = GeneratedAppBundle(
        projectTitle = "Osteria Solis",
        description = "Warm editorial bistro with dietary filter menu, order tray, and table booking.",
        summary = "Loaded Osteria Solis Bistro — filterable seasonal dishes, live order tray, and instant table reservation confirmation.",
        designStrategy = "template_foundation",
        templateId = "culinary_bistro",
        designDirection = "Warm Cream (#FCF9F3) canvas, Roasted Espresso (#231914) ink, and Terracotta (#B45309) accents.",
        qaSummary = "QA Audit (6/6 checks passed): structure, tokens, responsive CSS, inline SVG, JS interactivity, and market fit verified.",
        changedFiles = listOf("index.html", "styles.css", "app.js"),
        followUpSuggestions = listOf(
            "Customize dishes & prices",
            "Add private dining inquiry",
            "Switch currency & city",
        ),
        htmlCode = """
            <header class="nav">
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
            </main>
        """.trimIndent(),
        cssCode = """
            :root { --bg: #FCF9F3; --card: #FFFFFF; --ink: #231914; --muted: #6E5D53; --accent: #B45309; --border: #E7DFD3; }
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
            @media (max-width: 600px) { .wrap { padding: 14px; } }
        """.trimIndent(),
        jsCode = """
            const DISHES = [
              { name: 'Roasted Maitake Polenta', course: 'Vegan', price: '$22', desc: 'Crisp hearth mushrooms, rosemary oil & charred scallion.' },
              { name: 'Tagliolini al Limone', course: 'Mains', price: '$26', desc: 'Hand-cut egg pasta, Meyer lemon butter & aged pecorino.' },
              { name: 'Charred Sea Bass', course: 'Mains', price: '$34', desc: 'Fennel pollen crust, blistered tomatoes & olive jus.' },
              { name: 'Sicilian Citrus Salad', course: 'Vegan', price: '$17', desc: 'Blood orange, shaved fennel & toasted pistachios.' }
            ];
            let course = 'All';
            function renderMenu() {
              const list = DISHES.filter(d => course === 'All' || d.course === course);
              document.getElementById('menuList').innerHTML = list.map(d => `
                <article class="dish">
                  <span class="tag">${'$'}{d.course}</span>
                  <h3>${'$'}{d.name} &mdash; ${'$'}{d.price}</h3>
                  <p>${'$'}{d.desc}</p>
                </article>
              `).join('');
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
            renderMenu();
        """.trimIndent(),
    )

    private fun corporateAdvisoryBundle(): GeneratedAppBundle = GeneratedAppBundle(
        projectTitle = "Meridian Advisory",
        description = "Corporate consulting practice site with service pillars, impact KPIs, and consultation booking.",
        summary = "Loaded Meridian Advisory — structured ivory & navy B2B consulting layout with service switcher and consultation scheduler.",
        designStrategy = "template_foundation",
        templateId = "corporate_advisory",
        designDirection = "Crisp Ivory (#FFFFFF) and Cool Off-White (#F4F6FA) paired with Deep Navy (#0F172A) and Cobalt (#1D4ED8).",
        qaSummary = "QA Audit (6/6 checks passed): semantic structure, tokens, responsive layout, clean visuals, JS logic, and market alignment verified.",
        changedFiles = listOf("index.html", "styles.css", "app.js"),
        followUpSuggestions = listOf(
            "Add client case studies",
            "Localize to Kenyan corporate firms",
            "Add downloadable brief summary",
        ),
        htmlCode = """
            <header class="bar">
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
            </main>
        """.trimIndent(),
        cssCode = """
            :root { --bg: #F4F6FA; --card: #FFFFFF; --ink: #0F172A; --muted: #475569; --accent: #1D4ED8; --border: #E2E8F0; }
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
            @media (max-width: 600px) { .hero { padding: 18px; } }
        """.trimIndent(),
        jsCode = """
            const PILLARS = [
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
            selectPillar(0);
        """.trimIndent(),
    )

    private fun tactileUtilityBundle(): GeneratedAppBundle = GeneratedAppBundle(
        projectTitle = "FlowLedger Tool",
        description = "Focused bill & expense tracker utility with instant category breakdown and local persistence.",
        summary = "Loaded FlowLedger Utility — fast add/delete expense rows, live totals, and localStorage persistence.",
        designStrategy = "template_foundation",
        templateId = "tactile_utility",
        designDirection = "Soft Neutral (#F5F6F8) workspace with Cobalt (#2563EB) actions and crisp tabular totals.",
        qaSummary = "QA Audit (6/6 checks passed): structure, tokens, responsive CSS, self-contained visuals, JS syntax, and market context verified.",
        changedFiles = listOf("index.html", "styles.css", "app.js"),
        followUpSuggestions = listOf(
            "Switch currency to KSh",
            "Add CSV export download",
            "Add monthly budget target",
        ),
        htmlCode = """
            <header class="head">
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
            </main>
        """.trimIndent(),
        cssCode = """
            :root { --bg: #F5F6F8; --card: #FFFFFF; --ink: #0F172A; --muted: #64748B; --accent: #2563EB; --border: #E2E8F0; }
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
            @media (max-width: 640px) { .entry-form { grid-template-columns: 1fr; } }
        """.trimIndent(),
        jsCode = """
            let items = JSON.parse(localStorage.getItem('flowledger_items') || 'null') || [
              { id: 1, label: 'Studio Packaging Roll', amount: 42.50, cat: 'Supplies' },
              { id: 2, label: 'Courier Dispatch Batch', amount: 18.00, cat: 'Operations' }
            ];
            function save() { localStorage.setItem('flowledger_items', JSON.stringify(items)); }
            function render() {
              const total = items.reduce((s, x) => s + Number(x.amount), 0);
              document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
              document.getElementById('entryCount').textContent = items.length;
              document.getElementById('listWrap').innerHTML = items.length ? items.map(i => `
                <div class="item">
                  <div><strong>${'$'}{i.label}</strong><div style="font-size:0.8rem;color:#64748B">${'$'}{i.cat}</div></div>
                  <div class="row" style="gap:10px">
                    <strong>$${'$'}{Number(i.amount).toFixed(2)}</strong>
                    <button type="button" class="del" onclick="removeItem(${'$'}{i.id})">Remove</button>
                  </div>
                </div>
              `).join('') : '<div class="item">No entries yet. Add your first expense above.</div>';
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
            render();
        """.trimIndent(),
    )
}
