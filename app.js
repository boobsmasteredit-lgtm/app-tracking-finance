/* ============================================================
   COCKPIT FINANCIER — Application JavaScript
   Données stockées dans localStorage
   ============================================================ */

// ─── DATA STORE ─────────────────────────────────────────────
let DB = {
    revenus: [],
    depenses: [],
    comptes: [],
    activites: [],
    objectifs: [],
    revpotentiels: []
};

function loadDB() {
    const saved = localStorage.getItem('cockpitFinancier');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            DB = Object.assign({}, DB, loaded);
        } catch (e) { }
    } else {
        seedDemoData();
    }
}

function saveDB() {
    localStorage.setItem('cockpitFinancier', JSON.stringify(DB));
}

function seedDemoData() {
    const now = new Date();
    const m = now.getMonth(), y = now.getFullYear();
    const fmt = (mo, d) => `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    DB.activites = [
        { id: uid(), nom: 'Montage vidéo' },
        { id: uid(), nom: 'Produits digitaux' },
        { id: uid(), nom: 'SaaS' },
        { id: uid(), nom: 'Autres projets' }
    ];

    DB.comptes = [
        { id: uid(), nom: 'Banque CIH', type: 'Banque', solde: 4200 },
        { id: uid(), nom: 'Orange Money', type: 'Mobile Money', solde: 850 },
        { id: uid(), nom: 'Cash', type: 'Cash', solde: 300 },
        { id: uid(), nom: 'PayPal', type: 'Portefeuille en ligne', solde: 620 },
        { id: uid(), nom: 'Stripe', type: 'Portefeuille en ligne', solde: 1150 }
    ];

    const actIds = DB.activites.map(a => a.id);
    const cptIds = DB.comptes.map(c => c.id);

    // Revenus — 6 derniers mois
    const revenusData = [
        { offset: 5, source: 'Contrat montage client A', act: 0, montant: 900, type: 'Revenu actif' },
        { offset: 5, source: 'Vente formation vidéo', act: 1, montant: 450, type: 'Revenu passif' },
        { offset: 4, source: 'Contrat montage client B', act: 0, montant: 1100, type: 'Revenu actif' },
        { offset: 4, source: 'Abonnement SaaS', act: 2, montant: 380, type: 'Revenu passif' },
        { offset: 3, source: 'Contrat montage client C', act: 0, montant: 1300, type: 'Revenu actif' },
        { offset: 3, source: 'Vente ebook', act: 1, montant: 520, type: 'Revenu passif' },
        { offset: 2, source: 'Contrat montage client D', act: 0, montant: 1500, type: 'Revenu actif' },
        { offset: 2, source: 'Abonnement SaaS', act: 2, montant: 400, type: 'Revenu passif' },
        { offset: 1, source: 'Contrat montage client E', act: 0, montant: 1700, type: 'Revenu actif' },
        { offset: 1, source: 'Pack templates', act: 1, montant: 600, type: 'Revenu passif' },
        { offset: 0, source: 'Contrat montage client F', act: 0, montant: 1900, type: 'Revenu actif' },
        { offset: 0, source: 'Abonnement SaaS', act: 2, montant: 420, type: 'Revenu passif' },
        { offset: 0, source: 'Vente cours en ligne', act: 1, montant: 680, type: 'Revenu passif' }
    ];

    revenusData.forEach(r => {
        const mo = (m - r.offset + 12) % 12;
        const yr = y - (m - r.offset < 0 ? 1 : 0);
        DB.revenus.push({
            id: uid(),
            date: `${yr}-${String(mo + 1).padStart(2, '0')}-10`,
            source: r.source,
            activiteId: actIds[r.act],
            montant: r.montant,
            compteId: cptIds[Math.floor(Math.random() * cptIds.length)],
            type: r.type
        });
    });

    // Dépenses — 6 derniers mois
    const depData = [
        { offset: 0, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 0, cat: 'Publicité / Ads', montant: 250, type: 'Business', charge: 'Charge variable' },
        { offset: 0, cat: 'Nourriture', montant: 180, type: 'Personnel', charge: 'Charge variable' },
        { offset: 0, cat: 'Transport', montant: 60, type: 'Personnel', charge: 'Charge variable' },
        { offset: 0, cat: 'Abonnements', montant: 45, type: 'Business', charge: 'Coût fixe' },
        { offset: 0, cat: 'Éducation / Formation', montant: 199, type: 'Business', charge: 'Investissement' },
        { offset: 0, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' },
        { offset: 1, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 1, cat: 'Publicité / Ads', montant: 200, type: 'Business', charge: 'Charge variable' },
        { offset: 1, cat: 'Nourriture', montant: 165, type: 'Personnel', charge: 'Charge variable' },
        { offset: 1, cat: 'Freelancers', montant: 300, type: 'Business', charge: 'Charge variable' },
        { offset: 1, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' },
        { offset: 2, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 2, cat: 'Publicité / Ads', montant: 220, type: 'Business', charge: 'Charge variable' },
        { offset: 2, cat: 'Nourriture', montant: 170, type: 'Personnel', charge: 'Charge variable' },
        { offset: 2, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' },
        { offset: 2, cat: 'Équipement', montant: 350, type: 'Business', charge: 'Investissement' },
        { offset: 3, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 3, cat: 'Nourriture', montant: 160, type: 'Personnel', charge: 'Charge variable' },
        { offset: 3, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' },
        { offset: 4, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 4, cat: 'Nourriture', montant: 175, type: 'Personnel', charge: 'Charge variable' },
        { offset: 4, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' },
        { offset: 5, cat: 'Outils / Logiciels', montant: 89, type: 'Business', charge: 'Coût fixe' },
        { offset: 5, cat: 'Nourriture', montant: 150, type: 'Personnel', charge: 'Charge variable' },
        { offset: 5, cat: 'Logement', montant: 500, type: 'Personnel', charge: 'Coût fixe' }
    ];

    depData.forEach(d => {
        const mo = (m - d.offset + 12) % 12;
        const yr = y - (m - d.offset < 0 ? 1 : 0);
        DB.depenses.push({
            id: uid(),
            date: `${yr}-${String(mo + 1).padStart(2, '0')}-15`,
            categorie: d.cat,
            montant: d.montant,
            type: d.type,
            charge: d.charge,
            compteId: cptIds[0],
            notes: ''
        });
    });

    saveDB();
}

function uid() { return Math.random().toString(36).slice(2, 11); }

// ─── NAVIGATION ─────────────────────────────────────────────
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const pageEl = document.getElementById('page-' + page);
    const navEl = document.getElementById('nav-' + page);
    if (pageEl) pageEl.classList.add('active');
    if (navEl) navEl.classList.add('active');

    if (page === 'dashboard') renderDashboard();
    if (page === 'revenus') renderRevenus();
    if (page === 'depenses') renderDepenses();
    if (page === 'comptes') renderComptes();
    if (page === 'activites') renderActivites();
    // new module pages handled by modules.js via navigate override
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        navigate(item.dataset.page);
    });
});

// ─── HELPERS ────────────────────────────────────────────────
function fmt(n) {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(n) + ' FCFA';
}
function fmtPct(n) { return (n * 100).toFixed(1) + '%'; }

function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthKey(dateStr) { return dateStr.slice(0, 7); }

function getMonthRevenu(mk) {
    return DB.revenus.filter(r => monthKey(r.date) === mk).reduce((s, r) => s + r.montant, 0);
}
function getMonthDepense(mk) {
    return DB.depenses.filter(d => monthKey(d.date) === mk).reduce((s, d) => s + d.montant, 0);
}

function getCashTotal() {
    return DB.comptes.reduce((s, c) => s + c.solde, 0);
}

function getActiviteNom(id) {
    const a = DB.activites.find(a => a.id === id);
    return a ? a.nom : '—';
}
function getCompteNom(id) {
    const c = DB.comptes.find(c => c.id === id);
    return c ? c.nom : '—';
}

function getLast6Months() {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        });
    }
    return months;
}

// ─── CHART INSTANCES ────────────────────────────────────────
const charts = {};
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

const CHART_DEFAULTS = {
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
    scales: {}
};

const darkScales = {
    x: { ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }, grid: { color: '#1e2d45' } },
    y: { ticks: { color: '#64748b', font: { family: 'Inter', size: 10 } }, grid: { color: '#1e2d45' } }
};

// ─── DASHBOARD ──────────────────────────────────────────────
function renderDashboard() {
    const mk = currentMonthKey();
    const rev = getMonthRevenu(mk);
    const dep = getMonthDepense(mk);
    const profit = rev - dep;
    const cash = getCashTotal();
    const ratio = rev > 0 ? dep / rev : 0;
    const runway = dep > 0 ? cash / dep : Infinity;
    const invest = DB.depenses.filter(d => monthKey(d.date) === mk && d.charge === 'Investissement').reduce((s, d) => s + d.montant, 0);
    const investRate = rev > 0 ? invest / rev : 0;

    // KPIs
    document.getElementById('kpi-cash').textContent = fmt(cash);
    document.getElementById('kpi-revenus').textContent = fmt(rev);
    document.getElementById('kpi-depenses').textContent = fmt(dep);
    const profitEl = document.getElementById('kpi-profit');
    profitEl.textContent = fmt(profit);
    profitEl.className = 'kpi-value ' + (profit >= 0 ? 'kpi-green' : 'kpi-red');
    document.getElementById('kpi-ratio').textContent = fmtPct(ratio);
    document.getElementById('kpi-runway').textContent = runway === Infinity ? '∞' : runway.toFixed(1) + ' m';
    document.getElementById('kpi-burn').textContent = fmt(dep);
    document.getElementById('kpi-invest').textContent = fmtPct(investRate);

    // Sub labels
    const profitPct = rev > 0 ? (profit / rev * 100).toFixed(1) : 0;
    document.getElementById('kpi-revenus-sub').textContent = 'Ce mois';
    document.getElementById('kpi-depenses-sub').textContent = 'Ce mois';
    document.getElementById('kpi-profit-sub').textContent = `${profitPct}% des revenus`;
    document.getElementById('kpi-ratio-sub').textContent = ratio < 0.7 ? '✅ Sain' : ratio < 0.85 ? '⚠️ Attention' : '🚨 Critique';
    document.getElementById('kpi-runway-sub').textContent = runway === Infinity ? 'Aucune dépense' : `${runway.toFixed(1)} mois de cashflow`;

    // Health indicators
    const profitRate = rev > 0 ? profit / rev : 0;
    setHealth('profit', profitRate,
        v => v >= 0.2 ? 'green' : v >= 0.1 ? 'orange' : 'red',
        v => v >= 0.2 ? `✅ Excellent — ${(v * 100).toFixed(1)}% de marge` : v >= 0.1 ? `⚠️ Acceptable — ${(v * 100).toFixed(1)}%` : `🚨 Faible — ${(v * 100).toFixed(1)}%`,
        profitRate
    );
    setHealth('ratio', ratio,
        v => v < 0.7 ? 'green' : v < 0.85 ? 'orange' : 'red',
        v => v < 0.7 ? `✅ Healthy — ${(v * 100).toFixed(1)}%` : v < 0.85 ? `⚠️ Élevé — ${(v * 100).toFixed(1)}%` : `🚨 Critique — ${(v * 100).toFixed(1)}%`,
        ratio
    );
    const runwayVal = runway === Infinity ? 24 : runway;
    setHealth('runway', runwayVal,
        v => v >= 12 ? 'green' : v >= 6 ? 'orange' : 'red',
        () => runway === Infinity ? '✅ Pas de dépenses enregistrées' : runway >= 12 ? `✅ ${runway.toFixed(1)} mois — Excellent` : runway >= 6 ? `⚠️ ${runway.toFixed(1)} mois — Attention` : `🚨 ${runway.toFixed(1)} mois — Critique`,
        Math.min(runwayVal, 24)
    );

    // Global health badge
    const badge = document.getElementById('health-badge');
    const scores = [profitRate >= 0.2, ratio < 0.7, runwayVal >= 12].filter(Boolean).length;
    if (scores === 3) { badge.textContent = '🟢 Santé financière excellente'; badge.style.borderColor = '#10b981'; }
    else if (scores >= 2) { badge.textContent = '🟡 Santé financière correcte'; badge.style.borderColor = '#f59e0b'; }
    else { badge.textContent = '🔴 Attention requise'; badge.style.borderColor = '#ef4444'; }

    renderCharts(mk);
}

function setHealth(name, rawVal, colorFn, labelFn, pctVal) {
    const bar = document.getElementById('bar-' + name);
    const status = document.getElementById('status-' + name);
    const color = colorFn(rawVal);
    const pct = Math.min(Math.abs(pctVal) * (name === 'runway' ? (100 / 24) : 100), 100);
    bar.className = 'health-bar ' + color;
    bar.style.width = pct + '%';
    status.className = 'health-status ' + color;
    status.textContent = labelFn(rawVal);
}

// ─── CHARTS ─────────────────────────────────────────────────
function renderCharts(mk) {
    const months6 = getLast6Months();
    const revData = months6.map(m => getMonthRevenu(m.key));
    const depData = months6.map(m => getMonthDepense(m.key));
    const labels = months6.map(m => m.label);

    // Chart 1: Rev vs Dep line
    destroyChart('revdep');
    charts['revdep'] = new Chart(document.getElementById('chart-revdep'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Revenus', data: revData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', tension: .4, fill: true, pointBackgroundColor: '#10b981', pointRadius: 5 },
                { label: 'Dépenses', data: depData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', tension: .4, fill: true, pointBackgroundColor: '#ef4444', pointRadius: 5 }
            ]
        },
        options: { responsive: true, plugins: CHART_DEFAULTS.plugins, scales: darkScales }
    });

    // Chart 2: Pie — categories this month
    const catMap = {};
    DB.depenses.filter(d => monthKey(d.date) === mk).forEach(d => {
        catMap[d.categorie] = (catMap[d.categorie] || 0) + d.montant;
    });
    const catLabels = Object.keys(catMap);
    const catVals = Object.values(catMap);
    const pieColors = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#a3e635', '#06b6d4', '#e879f9'];

    destroyChart('categories');
    charts['categories'] = new Chart(document.getElementById('chart-categories'), {
        type: 'doughnut',
        data: {
            labels: catLabels.length ? catLabels : ['Aucune donnée'],
            datasets: [{ data: catVals.length ? catVals : [1], backgroundColor: pieColors, borderWidth: 2, borderColor: '#161d2e' }]
        },
        options: { responsive: true, plugins: { ...CHART_DEFAULTS.plugins, legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, boxWidth: 12 } } } }
    });

    // Chart 3: Bar — profit par mois
    const profitData = months6.map(m => getMonthRevenu(m.key) - getMonthDepense(m.key));
    destroyChart('profit');
    charts['profit'] = new Chart(document.getElementById('chart-profit'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Profit (FCFA)',
                data: profitData,
                backgroundColor: profitData.map(v => v >= 0 ? 'rgba(16,185,129,.7)' : 'rgba(239,68,68,.7)'),
                borderRadius: 6
            }]
        },
        options: { responsive: true, plugins: CHART_DEFAULTS.plugins, scales: darkScales }
    });

    // Chart 4: Bar — Coûts fixes vs Variables
    const fixData = months6.map(m => DB.depenses.filter(d => monthKey(d.date) === m.key && d.charge === 'Coût fixe').reduce((s, d) => s + d.montant, 0));
    const varData = months6.map(m => DB.depenses.filter(d => monthKey(d.date) === m.key && d.charge === 'Charge variable').reduce((s, d) => s + d.montant, 0));
    const invData = months6.map(m => DB.depenses.filter(d => monthKey(d.date) === m.key && d.charge === 'Investissement').reduce((s, d) => s + d.montant, 0));
    destroyChart('fixvar');
    charts['fixvar'] = new Chart(document.getElementById('chart-fixvar'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Coûts fixes', data: fixData, backgroundColor: 'rgba(99,102,241,.75)', borderRadius: 4 },
                { label: 'Charges variables', data: varData, backgroundColor: 'rgba(245,158,11,.75)', borderRadius: 4 },
                { label: 'Investissements', data: invData, backgroundColor: 'rgba(16,185,129,.75)', borderRadius: 4 }
            ]
        },
        options: { responsive: true, plugins: CHART_DEFAULTS.plugins, scales: { ...darkScales, x: { ...darkScales.x, stacked: false }, y: { ...darkScales.y, stacked: false } } }
    });

    // Chart 5: Top categories horizontal bar
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    destroyChart('top5');
    charts['top5'] = new Chart(document.getElementById('chart-top5'), {
        type: 'bar',
        data: {
            labels: sorted.map(e => e[0]),
            datasets: [{ label: 'Dépenses (FCFA)', data: sorted.map(e => e[1]), backgroundColor: pieColors.slice(0, 5), borderRadius: 6 }]
        },
        options: {
            indexAxis: 'y', responsive: true,
            plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
            scales: { x: darkScales.x, y: darkScales.y }
        }
    });
}

// ─── REVENUS PAGE ────────────────────────────────────────────
function renderRevenus() {
    const tbody = document.getElementById('tbody-revenus');
    populateSelects();
    if (!DB.revenus.length) {
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><p>Aucun revenu enregistré. Cliquez sur "+ Ajouter un revenu" pour commencer.</p></div></td></tr>`;
        return;
    }
    const sorted = [...DB.revenus].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>${formatDate(r.date)}</td>
      <td>${r.source}</td>
      <td>${getActiviteNom(r.activiteId)}</td>
      <td><strong>${fmt(r.montant)}</strong></td>
      <td>${getCompteNom(r.compteId)}</td>
      <td><span class="badge ${r.type === 'Revenu actif' ? 'badge-blue' : 'badge-green'}">${r.type}</span></td>
      <td>
        <button class="btn-icon btn-edit" onclick="openModal('modal-revenu','${r.id}')">✏️</button>
        <button class="btn-icon" onclick="deleteItem('revenus','${r.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

// ─── DEPENSES PAGE ───────────────────────────────────────────
function renderDepenses() {
    const tbody = document.getElementById('tbody-depenses');
    populateSelects();

    const mk = currentMonthKey();
    const totalMois = getMonthDepense(mk);

    // Top 5 cards
    const catMap = {};
    DB.depenses.filter(d => monthKey(d.date) === mk).forEach(d => {
        catMap[d.categorie] = (catMap[d.categorie] || 0) + d.montant;
    });
    const sorted5 = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const top5el = document.getElementById('top5-cards');
    top5el.innerHTML = sorted5.length ? sorted5.map(([cat, val], i) => {
        const pct = totalMois > 0 ? (val / totalMois * 100).toFixed(1) : 0;
        return `
      <div class="top5-card">
        <div class="top5-rank">#${i + 1}</div>
        <div class="top5-cat">${cat}</div>
        <div class="top5-amount">${fmt(val)}</div>
        <div class="top5-pct">${pct}% des dépenses du mois</div>
        <div class="top5-bar-wrap"><div class="top5-bar" style="width:${pct}%"></div></div>
      </div>`;
    }).join('') : '<p style="color:var(--text3);font-size:.85rem">Aucune dépense ce mois.</p>';

    if (!DB.depenses.length) {
        tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>Aucune dépense enregistrée. Cliquez sur "+ Ajouter une dépense" pour commencer.</p></div></td></tr>`;
        return;
    }
    const sortedDep = [...DB.depenses].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = sortedDep.map(d => {
        const poids = totalMois > 0 ? (d.montant / totalMois * 100).toFixed(1) : '—';
        return `
      <tr>
        <td>${formatDate(d.date)}</td>
        <td><span class="badge badge-gray">${d.categorie}</span></td>
        <td><strong>${fmt(d.montant)}</strong></td>
        <td><span class="badge ${d.type === 'Business' ? 'badge-blue' : 'badge-orange'}">${d.type}</span></td>
        <td><span class="badge ${chargeColor(d.charge)}">${d.charge}</span></td>
        <td>${getCompteNom(d.compteId)}</td>
        <td>${monthKey(d.date) === mk ? poids + '%' : '—'}</td>
        <td style="color:var(--text3);font-size:.8rem">${d.notes || '—'}</td>
        <td>
          <button class="btn-icon btn-edit" onclick="openModal('modal-depense','${d.id}')">✏️</button>
          <button class="btn-icon" onclick="deleteItem('depenses','${d.id}')">🗑</button>
        </td>
      </tr>`;
    }).join('');
}

function chargeColor(c) {
    if (c === 'Coût fixe') return 'badge-blue';
    if (c === 'Charge variable') return 'badge-orange';
    if (c === 'Investissement') return 'badge-green';
    return 'badge-gray';
}

// ─── COMPTES PAGE ────────────────────────────────────────────
function renderComptes() {
    const total = getCashTotal();
    document.getElementById('cash-total-comptes').textContent = fmt(total);
    const grid = document.getElementById('comptes-cards');
    if (!DB.comptes.length) {
        grid.innerHTML = '<p style="color:var(--text3)">Aucun compte. Ajoutez-en un !</p>';
        return;
    }
    const typeIcon = { 'Banque': '🏦', 'Mobile Money': '📱', 'Cash': '💵', 'Portefeuille en ligne': '🌐' };
    grid.innerHTML = DB.comptes.map(c => `
    <div class="compte-card">
      <div class="compte-type">${typeIcon[c.type] || '💳'} ${c.type}</div>
      <div class="compte-nom">${c.nom}</div>
      <div class="compte-solde">${fmt(c.solde)}</div>
      <div class="compte-actions">
        <button class="btn-icon btn-edit" onclick="openModal('modal-compte','${c.id}')">✏️</button>
        <button class="btn-icon" onclick="deleteItem('comptes','${c.id}')">🗑</button>
      </div>
    </div>
  `).join('');
}

// ─── ACTIVITES PAGE ──────────────────────────────────────────
function renderActivites() {
    const grid = document.getElementById('activites-cards');
    if (!DB.activites.length) {
        grid.innerHTML = '<p style="color:var(--text3)">Aucune activité. Ajoutez-en une !</p>';
        return;
    }
    grid.innerHTML = DB.activites.map(a => {
        const rev = DB.revenus.filter(r => r.activiteId === a.id).reduce((s, r) => s + r.montant, 0);
        const dep = DB.depenses.filter(d => d.activiteId === a.id).reduce((s, d) => s + d.montant, 0);
        const profit = rev - dep;
        const cls = profit > 0 ? 'profitable' : profit < 0 ? 'loss' : 'neutral';
        return `
      <div class="activite-card ${cls}">
        <div class="activite-actions">
          <button class="btn-icon btn-edit" onclick="openModal('modal-activite','${a.id}')">✏️</button>
          <button class="btn-icon" onclick="deleteItem('activites','${a.id}')">🗑</button>
        </div>
        <div class="activite-nom">🚀 ${a.nom}</div>
        <div class="activite-stats">
          <div class="activite-row"><span class="label">💰 Revenus liés</span><span class="val kpi-green">${fmt(rev)}</span></div>
          <div class="activite-row"><span class="label">💳 Dépenses liées</span><span class="val kpi-red">${fmt(dep)}</span></div>
        </div>
        <div class="activite-profit" style="color:${profit >= 0 ? 'var(--green)' : 'var(--red)'}">
          ${profit >= 0 ? '📈' : '📉'} Profit : ${fmt(profit)}
        </div>
      </div>`;
    }).join('');
}

// ─── EDIT STATE ─────────────────────────────────────────────
const editState = { revenus: null, depenses: null, comptes: null, activites: null, objectifs: null, revpotentiels: null };

// ─── MODALS ──────────────────────────────────────────────────
function openModal(id, editId) {
    if (editId === undefined) editId = null;
    populateSelects();

    // Update modal header only when we have known titles
    const titles = {
        'modal-revenu': 'Nouveau revenu',
        'modal-depense': 'Nouvelle dépense',
        'modal-compte': 'Nouveau compte',
        'modal-activite': 'Nouvelle activité',
        'modal-objectif': 'Nouvel objectif',
        'modal-revpot': 'Nouveau prospect'
    };
    const editTitles = {
        'modal-revenu': 'Modifier le revenu',
        'modal-depense': 'Modifier la dépense',
        'modal-compte': 'Modifier le compte',
        'modal-activite': "Modifier l'activité",
        'modal-objectif': "Modifier l'objectif",
        'modal-revpot': 'Modifier le prospect'
    };
    const forms = {
        'modal-revenu': 'revenus',
        'modal-depense': 'depenses',
        'modal-compte': 'comptes',
        'modal-activite': 'activites',
        'modal-objectif': 'objectifs',
        'modal-revpot': 'revpotentiels'
    };

    if (forms[id]) {
        editState[forms[id]] = editId;
    }

    const titleEl = document.querySelector('#' + id + ' .modal-header h2');
    const submitEl = document.querySelector('#' + id + ' button[type=submit]');
    if (titleEl && titles[id]) {
        titleEl.textContent = editId ? editTitles[id] : titles[id];
    }
    if (submitEl && titles[id]) {
        submitEl.textContent = editId ? 'Enregistrer les modifications' : 'Enregistrer';
    }

    if (editId && forms[id]) {
        prefillForm(id, editId);
    } else {
        const today = new Date().toISOString().split('T')[0];
        if (id === 'modal-revenu') document.getElementById('rev-date').value = today;
        if (id === 'modal-depense') document.getElementById('dep-date').value = today;
        if (id === 'modal-objectif') { const objDate = document.getElementById('obj-date'); if (objDate) objDate.value = today; }
        if (id === 'modal-revpot') { const rpDate = document.getElementById('rp-date'); if (rpDate) rpDate.value = today; }
    }
    document.getElementById(id).classList.add('open');
}

function prefillForm(modalId, editId) {
    if (modalId === 'modal-revenu') {
        const r = DB.revenus.find(x => x.id === editId);
        if (!r) return;
        document.getElementById('rev-date').value = r.date;
        document.getElementById('rev-source').value = r.source;
        document.getElementById('rev-montant').value = r.montant;
        document.getElementById('rev-type').value = r.type;
        setTimeout(() => {
            document.getElementById('rev-activite').value = r.activiteId || '';
            document.getElementById('rev-compte').value = r.compteId || '';
        }, 10);
    } else if (modalId === 'modal-depense') {
        const d = DB.depenses.find(x => x.id === editId);
        if (!d) return;
        document.getElementById('dep-date').value = d.date;
        document.getElementById('dep-categorie').value = d.categorie;
        document.getElementById('dep-montant').value = d.montant;
        document.getElementById('dep-type').value = d.type;
        document.getElementById('dep-charge').value = d.charge;
        document.getElementById('dep-notes').value = d.notes || '';
        setTimeout(() => { document.getElementById('dep-compte').value = d.compteId || ''; }, 10);
    } else if (modalId === 'modal-compte') {
        const c = DB.comptes.find(x => x.id === editId);
        if (!c) return;
        document.getElementById('cpt-nom').value = c.nom;
        document.getElementById('cpt-type').value = c.type;
        document.getElementById('cpt-solde').value = c.solde;
    } else if (modalId === 'modal-activite') {
        const a = DB.activites.find(x => x.id === editId);
        if (!a) return;
        document.getElementById('act-nom').value = a.nom;
    } else if (modalId === 'modal-objectif') {
        const o = DB.objectifs.find(x => x.id === editId);
        if (!o) return;
        document.getElementById('obj-nom').value = o.nom;
        document.getElementById('obj-cible').value = o.cible;
        document.getElementById('obj-actuel').value = o.actuel;
        document.getElementById('obj-date').value = o.date;
        setTimeout(() => { document.getElementById('obj-compte').value = o.compteId || ''; }, 10);
    } else if (modalId === 'modal-revpot') {
        const r = DB.revpotentiels.find(x => x.id === editId);
        if (!r) return;
        document.getElementById('rp-client').value = r.client;
        document.getElementById('rp-prestation').value = r.prestation;
        document.getElementById('rp-montant').value = r.montant;
        document.getElementById('rp-proba').value = r.proba;
        document.getElementById('rp-date').value = r.date;
        document.getElementById('rp-statut').value = r.statut;
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    const formIds = {
        'modal-revenu': 'form-revenu',
        'modal-depense': 'form-depense',
        'modal-compte': 'form-compte',
        'modal-activite': 'form-activite',
        'modal-objectif': 'form-objectif',
        'modal-revpot': 'form-revpot'
    };
    const stateKeys = {
        'modal-revenu': 'revenus', 'modal-depense': 'depenses',
        'modal-compte': 'comptes', 'modal-activite': 'activites',
        'modal-objectif': 'objectifs', 'modal-revpot': 'revpotentiels'
    };
    if (formIds[id]) {
        const formEl = document.getElementById(formIds[id]);
        if (formEl) formEl.reset();
    }
    if (stateKeys[id]) editState[stateKeys[id]] = null;
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
});

function populateSelects() {
    ['rev-activite', 'rev-compte', 'dep-compte'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const isActivite = id.includes('activite');
        const isCompte = id.includes('compte');
        const current = el.value;
        el.innerHTML = `<option value="">— ${isActivite ? 'Aucune' : 'Aucun'} —</option>`;
        if (isActivite) {
            DB.activites.forEach(a => { el.innerHTML += `<option value="${a.id}">${a.nom}</option>`; });
        } else {
            DB.comptes.forEach(c => { el.innerHTML += `<option value="${c.id}">${c.nom}</option>`; });
        }
        if (current) el.value = current;
    });
}

// ─── SAVE FORMS ──────────────────────────────────────────────
function saveRevenu(e) {
    e.preventDefault();
    const data = {
        date: document.getElementById('rev-date').value,
        source: document.getElementById('rev-source').value,
        activiteId: document.getElementById('rev-activite').value,
        montant: parseFloat(document.getElementById('rev-montant').value),
        compteId: document.getElementById('rev-compte').value,
        type: document.getElementById('rev-type').value
    };
    if (editState.revenus) {
        const idx = DB.revenus.findIndex(x => x.id === editState.revenus);
        if (idx !== -1) DB.revenus[idx] = { ...DB.revenus[idx], ...data };
    } else {
        DB.revenus.push({ id: uid(), ...data });
    }
    saveDB(); closeModal('modal-revenu'); renderRevenus();
}

function saveDepense(e) {
    e.preventDefault();
    const data = {
        date: document.getElementById('dep-date').value,
        categorie: document.getElementById('dep-categorie').value,
        montant: parseFloat(document.getElementById('dep-montant').value),
        type: document.getElementById('dep-type').value,
        charge: document.getElementById('dep-charge').value,
        compteId: document.getElementById('dep-compte').value,
        notes: document.getElementById('dep-notes').value
    };
    if (editState.depenses) {
        const idx = DB.depenses.findIndex(x => x.id === editState.depenses);
        if (idx !== -1) DB.depenses[idx] = { ...DB.depenses[idx], ...data };
    } else {
        DB.depenses.push({ id: uid(), ...data });
    }
    saveDB(); closeModal('modal-depense'); renderDepenses();
}

function saveCompte(e) {
    e.preventDefault();
    const data = {
        nom: document.getElementById('cpt-nom').value,
        type: document.getElementById('cpt-type').value,
        solde: parseFloat(document.getElementById('cpt-solde').value)
    };
    if (editState.comptes) {
        const idx = DB.comptes.findIndex(x => x.id === editState.comptes);
        if (idx !== -1) DB.comptes[idx] = { ...DB.comptes[idx], ...data };
    } else {
        DB.comptes.push({ id: uid(), ...data });
    }
    saveDB(); closeModal('modal-compte'); renderComptes();
}

function saveActivite(e) {
    e.preventDefault();
    const data = { nom: document.getElementById('act-nom').value };
    if (editState.activites) {
        const idx = DB.activites.findIndex(x => x.id === editState.activites);
        if (idx !== -1) DB.activites[idx] = { ...DB.activites[idx], ...data };
    } else {
        DB.activites.push({ id: uid(), ...data });
    }
    saveDB(); closeModal('modal-activite'); renderActivites();
}

function deleteItem(table, id) {
    if (!confirm('Supprimer cet élément ?')) return;
    DB[table] = DB[table].filter(item => item.id !== id);
    saveDB();
    if (table === 'revenus') renderRevenus();
    if (table === 'depenses') renderDepenses();
    if (table === 'comptes') renderComptes();
    if (table === 'activites') renderActivites();
}

// ─── IMPORT / EXPORT ─────────────────────────────────────────
function exportData() {
    const data = JSON.stringify(DB, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finances_cockpit_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validation basique
            if (typeof importedData !== 'object' || !importedData.revenus) {
                throw new Error("Format de fichier invalide.");
            }

            if (confirm("Voulez-vous vraiment écraser vos données actuelles par celles de ce fichier ? Cette action est irréversible.")) {
                localStorage.setItem('cockpitFinancier', JSON.stringify(importedData));
                alert("Données importées avec succès ! L'application va redémarrer.");
                window.location.reload();
            }
        } catch (err) {
            alert("Erreur lors de l'importation : Le fichier n'est pas un JSON valide ou le format est incorrect.");
            console.error(err);
        }
        // Reset input pour permettre de sélectionner le même fichier à nouveau si besoin
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ─── HELPERS ─────────────────────────────────────────────────
function formatDate(str) {
    if (!str) return '—';
    return new Date(str + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── SIDEBAR DATE ─────────────────────────────────────────────
document.getElementById('sidebar-date').textContent =
    new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });

// ─── INIT ─────────────────────────────────────────────────────
loadDB();
navigate('dashboard');
