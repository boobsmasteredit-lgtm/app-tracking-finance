/* ============================================================
   MODULES AVANCÉS — Cockpit Financier
   ============================================================ */

// ─── EXTEND DB ────────────────────────────────────────────────
(function extendDB() {
    // Only seed if both are empty
    if (!DB.objectifs.length && !DB.revpotentiels.length) {
        seedModules();
        saveDB();
    }
})();

function seedModules() {
    const y = new Date().getFullYear();
    DB.objectifs = [
        { id: uid(), nom: 'Voyage', cible: 2000000, actuel: 900000, date: (y + 1) + '-06-01', compteId: '' },
        { id: uid(), nom: "Fonds d'urgence", cible: 1500000, actuel: 600000, date: (y + 1) + '-12-31', compteId: '' }
    ];
    DB.revpotentiels = [
        { id: uid(), client: 'Studio Alpha', prestation: 'Montage video', montant: 500000, proba: 80, date: y + '-04-15', statut: 'Contrat signe' },
        { id: uid(), client: 'StartUp Beta', prestation: 'Produit digital', montant: 300000, proba: 50, date: y + '-04-30', statut: 'Prospect' },
        { id: uid(), client: 'Agence Gamma', prestation: 'SaaS abonnement', montant: 200000, proba: 90, date: y + '-04-05', statut: 'Facture envoyee' }
    ];
}

// ─── HELPERS ────────────────────────────────────────────────
function avgMonthlySavings() {
    var months = getLast6Months();
    var total = 0;
    months.forEach(function (m) {
        total += getMonthRevenu(m.key) - getMonthDepense(m.key);
    });
    return total / (months.length || 1);
}

function monthsUntil(dateStr) {
    var target = new Date(dateStr);
    var now = new Date();
    return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
}

function statutBadge(s) {
    if (s === 'Paye' || s === 'Pay\u00e9') return 'badge-green';
    if (s === 'Contrat signe' || s === 'Contrat sign\u00e9') return 'badge-blue';
    if (s === 'Facture envoyee' || s === 'Facture envoy\u00e9e') return 'badge-orange';
    return 'badge-gray';
}

function populateObjCompte() {
    var el = document.getElementById('obj-compte');
    if (!el) return;
    var cur = el.value;
    el.innerHTML = '<option value="">\u2014 Aucun \u2014</option>';
    DB.comptes.forEach(function (c) {
        el.innerHTML += '<option value="' + c.id + '">' + c.nom + '</option>';
    });
    if (cur) el.value = cur;
}

// ─── DASHBOARD UPDATE ─────────────────────────────────────────
var _origRenderDashboard = renderDashboard;
renderDashboard = function () {
    _origRenderDashboard();
    updateModuleDashboard();
};

function updateModuleDashboard() {
    var mk = currentMonthKey();
    var cash = getCashTotal();
    var dep = getMonthDepense(mk);

    var revPot = 0;
    DB.revpotentiels.forEach(function (r) {
        if (r.statut !== 'Pay\u00e9' && r.statut !== 'Paye') {
            revPot += (r.montant || 0) * (r.proba || 0) / 100;
        }
    });
    const revPotEl = document.getElementById('kpi-revpot');
    if (revPotEl) revPotEl.textContent = fmt(revPot);

    var cashFutur = cash + revPot - dep;
    const cashFuturEl = document.getElementById('kpi-cashfutur');
    if (cashFuturEl) cashFuturEl.textContent = fmt(cashFutur);

    var obj = DB.objectifs[0];
    const objProgEl = document.getElementById('kpi-obj-prog');
    const objSubEl = document.getElementById('kpi-obj-sub');
    const epargneEl = document.getElementById('kpi-epargne');
    const epargneSubEl = document.getElementById('kpi-epargne-sub');

    if (obj) {
        var pct = Math.min((obj.actuel || 0) / (obj.cible || 1) * 100, 100).toFixed(1);
        if (objProgEl) objProgEl.textContent = pct + '%';
        var restant = (obj.cible || 0) - (obj.actuel || 0);
        if (objSubEl) objSubEl.textContent = obj.nom + ' \u2014 reste ' + fmt(restant);
        var moisCible = monthsUntil(obj.date);
        var epargne = moisCible > 0 ? restant / moisCible : restant;
        if (epargneEl) epargneEl.textContent = fmt(epargne);
        if (epargneSubEl) epargneSubEl.textContent = obj.nom + " d'ici " + moisCible + ' mois';
    } else {
        if (objProgEl) objProgEl.textContent = '\u2014';
        if (objSubEl) objSubEl.textContent = 'Aucun objectif d\u00e9fini';
        if (epargneEl) epargneEl.textContent = '\u2014';
    }
}

// ─── NAV EXTENSION ────────────────────────────────────────────
var _origNavigate = navigate;
navigate = function (page) {
    _origNavigate(page);
    if (page === 'objectifs') renderObjectifs();
    if (page === 'revpotentiels') renderRevPotentiels();
    if (page === 'analyse') renderAnalyse();
    if (page === 'simulateur') initSim();
};

// ─── MODULE 1 : OBJECTIFS ─────────────────────────────────────
function renderObjectifs() {
    populateObjCompte();
    var grid = document.getElementById('objectifs-cards');
    if (!DB.objectifs.length) {
        grid.innerHTML = '<p style="color:var(--text3);padding:20px">Aucun objectif. Cr\u00e9ez-en un !</p>';
        return;
    }
    var savings = avgMonthlySavings();
    var html = '';
    DB.objectifs.forEach(function (obj) {
        var restant = obj.cible - obj.actuel;
        var pct = Math.min(obj.actuel / obj.cible * 100, 100);
        var moisCible = monthsUntil(obj.date);
        var tempsEstime = savings > 0 ? (restant / savings).toFixed(1) : '\u221e';
        var epargneReco = moisCible > 0 ? restant / moisCible : restant;
        var barColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#6366f1';
        var dateStr = obj.date ? new Date(obj.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';
        html += '<div class="objectif-card">' +
            '<div class="objectif-actions">' +
            '<button class="btn-icon btn-edit" onclick="editObjectif(\'' + obj.id + '\')">\u270f\ufe0f</button>' +
            '<button class="btn-icon" onclick="deleteModItem(\'objectifs\',\'' + obj.id + '\')">\ud83d\uddd1</button>' +
            '</div>' +
            '<div class="objectif-nom">\ud83c\udfaf ' + obj.nom + '</div>' +
            '<div class="objectif-progress-wrap"><div class="objectif-progress-bar" style="width:' + pct + '%;background:' + barColor + '"></div></div>' +
            '<div class="objectif-pct" style="color:' + barColor + '">' + pct.toFixed(1) + '% atteint</div>' +
            '<div class="objectif-stats">' +
            '<div class="obj-row"><span>Montant cible</span><strong>' + fmt(obj.cible) + '</strong></div>' +
            '<div class="obj-row"><span>Montant actuel</span><strong style="color:#10b981">' + fmt(obj.actuel) + '</strong></div>' +
            '<div class="obj-row"><span>Montant restant</span><strong style="color:#ef4444">' + fmt(restant) + '</strong></div>' +
            '<div class="obj-row"><span>Date cible</span><strong>' + dateStr + '</strong></div>' +
            '<div class="obj-row"><span>\u23f1 Temps estim\u00e9</span><strong style="color:#f59e0b">' + tempsEstime + ' mois</strong></div>' +
            '<div class="obj-row"><span>\ud83d\udca1 \u00c9pargne reco.</span><strong style="color:#6366f1">' + fmt(epargneReco) + '/mois</strong></div>' +
            '</div></div>';
    });
    grid.innerHTML = html;
}

function editObjectif(id) {
    openModal('modal-objectif', id);
}

function saveObjectif(e) {
    e.preventDefault();
    var data = {
        nom: document.getElementById('obj-nom').value,
        cible: parseFloat(document.getElementById('obj-cible').value) || 0,
        actuel: parseFloat(document.getElementById('obj-actuel').value) || 0,
        date: document.getElementById('obj-date').value,
        compteId: document.getElementById('obj-compte').value
    };
    if (editState.objectifs) {
        var idx = -1;
        DB.objectifs.forEach(function (o, i) { if (o.id === editState.objectifs) idx = i; });
        if (idx !== -1) DB.objectifs[idx] = Object.assign({}, DB.objectifs[idx], data);
    } else {
        DB.objectifs.push(Object.assign({ id: uid() }, data));
    }
    saveDB();
    closeModal('modal-objectif');
    renderObjectifs();
    updateModuleDashboard();
}

// ─── MODULE 2 : REVENUS POTENTIELS ────────────────────────────
function renderRevPotentiels() {
    var tbody = document.getElementById('tbody-revpot');
    if (!tbody) return;
    var total = 0, pondere = 0;
    DB.revpotentiels.forEach(function (r) {
        total += r.montant;
        pondere += r.montant * r.proba / 100;
    });
    var elTotal = document.getElementById('revpot-total');
    var elPond = document.getElementById('revpot-pondere');
    if (elTotal) elTotal.textContent = fmt(total);
    if (elPond) elPond.textContent = fmt(pondere);

    if (!DB.revpotentiels.length) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><p>Aucun prospect. Ajoutez-en un !</p></div></td></tr>';
        return;
    }
    var html = '';
    DB.revpotentiels.forEach(function (r) {
        var dateStr = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';
        html += '<tr>' +
            '<td>' + r.client + '</td>' +
            '<td>' + r.prestation + '</td>' +
            '<td><strong>' + fmt(r.montant) + '</strong></td>' +
            '<td>' + r.proba + '%</td>' +
            '<td style="color:#10b981;font-weight:700">' + fmt(r.montant * r.proba / 100) + '</td>' +
            '<td>' + dateStr + '</td>' +
            '<td><span class="badge ' + statutBadge(r.statut) + '">' + r.statut + '</span></td>' +
            '<td>' +
            '<button class="btn-icon btn-edit" onclick="editRevPot(\'' + r.id + '\')">\u270f\ufe0f</button>' +
            '<button class="btn-icon" onclick="deleteModItem(\'revpotentiels\',\'' + r.id + '\')">\ud83d\uddd1</button>' +
            '</td></tr>';
    });
    tbody.innerHTML = html;
}

function editRevPot(id) {
    openModal('modal-revpot', id);
}

function saveRevPot(e) {
    e.preventDefault();
    var data = {
        client: document.getElementById('rp-client').value,
        prestation: document.getElementById('rp-prestation').value,
        montant: parseFloat(document.getElementById('rp-montant').value) || 0,
        proba: parseFloat(document.getElementById('rp-proba').value) || 0,
        date: document.getElementById('rp-date').value,
        statut: document.getElementById('rp-statut').value
    };
    if (editState.revpotentiels) {
        var idx = -1;
        DB.revpotentiels.forEach(function (x, i) { if (x.id === editState.revpotentiels) idx = i; });
        if (idx !== -1) DB.revpotentiels[idx] = Object.assign({}, DB.revpotentiels[idx], data);
    } else {
        DB.revpotentiels.push(Object.assign({ id: uid() }, data));
    }
    saveDB();
    closeModal('modal-revpot');
    renderRevPotentiels();
    updateModuleDashboard();
}

function deleteModItem(table, id) {
    if (!confirm('Supprimer cet \u00e9l\u00e9ment ?')) return;
    DB[table] = DB[table].filter(function (x) { return x.id !== id; });
    saveDB();
    if (table === 'objectifs') renderObjectifs();
    if (table === 'revpotentiels') renderRevPotentiels();
    updateModuleDashboard();
}

// ─── MODULE 5 : ANALYSE FINANCIÈRE ────────────────────────────
function renderAnalyse() {
    var mk = currentMonthKey();
    var rev = getMonthRevenu(mk);
    var dep = getMonthDepense(mk);
    var profit = rev - dep;
    var cash = getCashTotal();
    var savings = avgMonthlySavings();
    var ratio = rev > 0 ? dep / rev : 0;
    var runway = dep > 0 ? cash / dep : Infinity;

    var catMap = {};
    DB.depenses.forEach(function (d) {
        if (monthKey(d.date) === mk) {
            catMap[d.categorie] = (catMap[d.categorie] || 0) + d.montant;
        }
    });

    var invest = 0;
    DB.depenses.forEach(function (d) {
        if (monthKey(d.date) === mk && d.charge === 'Investissement') invest += d.montant;
    });
    var investRate = rev > 0 ? invest / rev : 0;

    var insights = [];

    // Category warnings > 20%
    var catArr = Object.keys(catMap).map(function (k) { return [k, catMap[k]]; });
    catArr.sort(function (a, b) { return b[1] - a[1]; });
    catArr.forEach(function (pair) {
        var pct = dep > 0 ? pair[1] / dep * 100 : 0;
        if (pct > 20) {
            insights.push({ level: 'warning', icon: '\u26a0\ufe0f', text: 'Vos d\u00e9penses en <strong>' + pair[0] + '</strong> repr\u00e9sentent <strong>' + pct.toFixed(1) + '%</strong> de vos d\u00e9penses totales. C\'est sup\u00e9rieur au seuil recommand\u00e9 de 20%.' });
        }
    });

    if (ratio > 0.85) insights.push({ level: 'danger', icon: '\ud83d\udea8', text: 'Votre ratio d\u00e9penses/revenus est critique \u00e0 <strong>' + (ratio * 100).toFixed(1) + '%</strong>. R\u00e9duisez vos charges variables en priorit\u00e9.' });
    else if (ratio > 0.7) insights.push({ level: 'warning', icon: '\u26a0\ufe0f', text: 'Votre ratio d\u00e9penses/revenus est de <strong>' + (ratio * 100).toFixed(1) + '%</strong>. Il est conseill\u00e9 de le maintenir sous 70%.' });
    else insights.push({ level: 'success', icon: '\u2705', text: 'Votre ratio d\u00e9penses/revenus est sain \u00e0 <strong>' + (ratio * 100).toFixed(1) + '%</strong>. Continuez ainsi !' });

    if (investRate < 0.1) insights.push({ level: 'warning', icon: '\ud83d\udcc9', text: 'Votre taux d\'investissement est faible \u00e0 <strong>' + (investRate * 100).toFixed(1) + '%</strong>. Visez au moins 10% de vos revenus.' });
    else insights.push({ level: 'success', icon: '\ud83d\udcc8', text: 'Votre taux d\'investissement est de <strong>' + (investRate * 100).toFixed(1) + '%</strong>. Excellent !' });

    if (runway !== Infinity && runway < 6) insights.push({ level: 'danger', icon: '\ud83d\udea8', text: 'Votre runway est de seulement <strong>' + runway.toFixed(1) + ' mois</strong>. Constituez un fonds d\'urgence en priorit\u00e9.' });
    else if (runway !== Infinity && runway < 12) insights.push({ level: 'warning', icon: '\u26a0\ufe0f', text: 'Votre runway est de <strong>' + runway.toFixed(1) + ' mois</strong>. Visez au moins 12 mois de tr\u00e9sorerie.' });

    DB.objectifs.forEach(function (obj) {
        var restant = obj.cible - obj.actuel;
        var mois = savings > 0 ? (restant / savings).toFixed(1) : '\u221e';
        var moisCible = monthsUntil(obj.date);
        var ok = parseFloat(mois) <= moisCible;
        insights.push({ level: ok ? 'success' : 'warning', icon: '\ud83c\udfaf', text: 'Votre objectif <strong>"' + obj.nom + '"</strong> peut \u00eatre atteint en <strong>' + mois + ' mois</strong> \u00e0 votre rythme d\'épargne actuel' + (moisCible > 0 ? ' (d\u00e9lai cible&nbsp;: ' + moisCible + ' mois)' : '') + '.' });
    });

    var actifs = DB.activites.map(function (a) {
        var r = 0, d = 0;
        DB.revenus.forEach(function (x) { if (x.activiteId === a.id) r += x.montant; });
        DB.depenses.forEach(function (x) { if (x.activiteId === a.id) d += x.montant; });
        return { nom: a.nom, profit: r - d };
    }).filter(function (a) { return a.profit !== 0; });
    if (actifs.length) {
        actifs.sort(function (a, b) { return b.profit - a.profit; });
        insights.push({ level: 'success', icon: '\ud83d\ude80', text: 'Votre activit\u00e9 la plus rentable est <strong>"' + actifs[0].nom + '"</strong> avec un profit de <strong>' + fmt(actifs[0].profit) + '</strong>.' });
    }

    var insHtml = '';
    insights.forEach(function (ins) {
        insHtml += '<div class="insight-card insight-' + ins.level + '"><span class="insight-icon">' + ins.icon + '</span><span>' + ins.text + '</span></div>';
    });
    document.getElementById('analyse-insights').innerHTML = insHtml;

    // Recommendations
    var recs = [];
    if (catArr.length) recs.push('\ud83d\udca1 R\u00e9duire la cat\u00e9gorie <strong>' + catArr[0][0] + '</strong> de 10% permettrait d\'\u00e9conomiser <strong>' + fmt(catArr[0][1] * 0.1) + '</strong> par mois.');
    if (savings > 0) recs.push('\ud83d\udca1 En augmentant votre \u00e9pargne mensuelle de <strong>' + fmt(savings * 0.2) + '</strong> (+20%), vous acc\u00e9l\u00e8reriez vos objectifs.');
    recs.push('\ud83d\udca1 Priorisez les activit\u00e9s \u00e0 fort profit pour maximiser votre revenu actif.');
    if (investRate < 0.15) recs.push('\ud83d\udca1 Augmentez votre taux d\'investissement \u00e0 <strong>' + fmt(rev * 0.15) + '</strong>/mois pour optimiser votre croissance patrimoniale.');
    var varDep = 0;
    DB.depenses.forEach(function (d) { if (monthKey(d.date) === mk && d.charge === 'Charge variable') varDep += d.montant; });
    if (varDep > 0) recs.push('\ud83d\udca1 Vos charges variables du mois s\'\u00e9l\u00e8vent \u00e0 <strong>' + fmt(varDep) + '</strong>. Analysez lesquelles peuvent \u00eatre r\u00e9duites.');

    var recHtml = '';
    recs.forEach(function (r) { recHtml += '<div class="rec-card">' + r + '</div>'; });
    document.getElementById('analyse-recommandations').innerHTML = recHtml;
}

// ─── MODULE SIMULATEUR ────────────────────────────────────────
var simCharts = {};

function initSim() {
    updateSim();
}

function updateSim() {
    var mk = currentMonthKey();
    var rev = getMonthRevenu(mk);
    var dep = getMonthDepense(mk);
    var cash = getCashTotal();
    var savings = Math.max(0, avgMonthlySavings());

    var depRedEl = document.getElementById('sim-dep-reduction');
    var revIncEl = document.getElementById('sim-rev-increase');
    var epExtraEl = document.getElementById('sim-epargne-extra');
    var revExtraEl = document.getElementById('sim-rev-extra');
    if (!depRedEl) return;

    var depRed = parseFloat(depRedEl.value) / 100;
    var revInc = parseFloat(revIncEl.value) / 100;
    var epExtra = parseFloat(epExtraEl.value) || 0;
    var revExtra = parseFloat(revExtraEl.value) || 0;

    document.getElementById('sim-dep-reduction-val').textContent = (depRed * 100).toFixed(0) + '%';
    document.getElementById('sim-rev-increase-val').textContent = (revInc * 100).toFixed(0) + '%';

    var simRev = rev * (1 + revInc) + revExtra;
    var simDep = dep * (1 - depRed);
    var simProfit = simRev - simDep;
    var simEpargne = savings + epExtra + (simProfit - (rev - dep));
    var cashFutur = cash + simRev - simDep;

    var cashEl = document.getElementById('sim-r-cash');
    cashEl.textContent = fmt(cashFutur);
    cashEl.style.color = cashFutur >= cash ? 'var(--green)' : 'var(--red)';
    var profitEl = document.getElementById('sim-r-profit');
    profitEl.textContent = fmt(simProfit);
    profitEl.style.color = simProfit >= 0 ? 'var(--green)' : 'var(--red)';
    document.getElementById('sim-r-epargne').textContent = fmt(Math.max(0, simEpargne));

    var obj = DB.objectifs[0];
    if (obj) {
        var restant = obj.cible - obj.actuel;
        var newSav = Math.max(1, simEpargne);
        var mois = (restant / newSav).toFixed(1);
        var origMois = savings > 0 ? (restant / savings).toFixed(1) : '\u221e';
        var diff = parseFloat(origMois) - parseFloat(mois);
        var txt = mois + ' mois (' + obj.nom + ')';
        if (diff > 0.1) txt += ' \ud83d\udfe2 ' + diff.toFixed(1) + ' mois plus t\u00f4t';
        else if (diff < -0.1) txt += ' \ud83d\udd34 ' + Math.abs(diff).toFixed(1) + ' mois plus tard';
        document.getElementById('sim-r-obj').textContent = txt;
    } else {
        document.getElementById('sim-r-obj').textContent = 'Aucun objectif d\u00e9fini';
    }

    var optDepRed = 8;
    var optEpargne = Math.max(1000, Math.round(savings * 0.2 / 1000) * 1000);
    var optMois = obj ? Math.max(1, Math.round((obj.cible - obj.actuel) / Math.max(1, savings + optEpargne))) : 0;
    document.getElementById('sim-optimal').innerHTML =
        '<div class="sim-scenario-title">\ud83c\udfc6 Sc\u00e9nario optimal recommand\u00e9</div>' +
        '<div class="sim-scenario-item">\u00b7 R\u00e9duire les d\u00e9penses variables de <strong>' + optDepRed + '%</strong></div>' +
        '<div class="sim-scenario-item">\u00b7 Augmenter l\'épargne de <strong>' + fmt(optEpargne) + '/mois</strong></div>' +
        '<div class="sim-scenario-item">\u00b7 R\u00e9sultat : objectif atteint <strong>' + (obj ? optMois + ' mois' : '\u2014') + '</strong></div>';

    renderSimCharts(cash, simRev, simDep, rev, dep, obj, simEpargne, savings);
}

function renderSimCharts(cash, simRev, simDep, origRev, origDep, obj, simEpargne, curSavings) {
    var labels = [];
    for (var i = 0; i < 12; i++) {
        var d = new Date(); d.setMonth(d.getMonth() + i);
        labels.push(d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }));
    }

    // Chart 1: Cash projection
    var cashSim = [], cashOrig = [];
    var c1 = cash, c2 = cash;
    for (var i = 0; i < 12; i++) {
        c1 += simRev - simDep; cashSim.push(Math.round(c1));
        c2 += origRev - origDep; cashOrig.push(Math.round(c2));
    }
    destroySimChart('cash');
    simCharts['cash'] = new Chart(document.getElementById('chart-sim-cash'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Sc\u00e9nario simul\u00e9', data: cashSim, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.12)', tension: 0.4, fill: true },
                { label: 'Sc\u00e9nario actuel', data: cashOrig, borderColor: '#94a3b8', backgroundColor: 'rgba(148,163,184,.06)', tension: 0.4, fill: true, borderDash: [5, 5] }
            ]
        },
        options: { responsive: true, plugins: CHART_DEFAULTS.plugins, scales: darkScales }
    });

    // Chart 2: Objectif progression
    if (obj) {
        var avgSav = Math.max(1, curSavings);
        var simSav = Math.max(1, simEpargne);
        var progSim = [], progOrig = [];
        var a1 = obj.actuel, a2 = obj.actuel;
        for (var i = 0; i < 12; i++) {
            a1 = Math.min(obj.cible, a1 + simSav); progSim.push(Math.round(a1 / obj.cible * 100));
            a2 = Math.min(obj.cible, a2 + avgSav); progOrig.push(Math.round(a2 / obj.cible * 100));
        }
        destroySimChart('obj');
        simCharts['obj'] = new Chart(document.getElementById('chart-sim-obj'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Progression simul\u00e9e (%)', data: progSim, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.12)', tension: 0.4, fill: true },
                    { label: 'Progression actuelle (%)', data: progOrig, borderColor: '#94a3b8', borderDash: [5, 5], tension: 0.4 }
                ]
            },
            options: { responsive: true, plugins: CHART_DEFAULTS.plugins, scales: Object.assign({}, darkScales, { y: Object.assign({}, darkScales.y, { max: 100 }) }) }
        });
    }

    // Chart 3: Profit comparison
    destroySimChart('profit');
    simCharts['profit'] = new Chart(document.getElementById('chart-sim-profit'), {
        type: 'bar',
        data: {
            labels: ['Profit actuel', 'Profit simul\u00e9'],
            datasets: [{
                label: 'Profit (FCFA)',
                data: [origRev - origDep, simRev - simDep],
                backgroundColor: [
                    origRev - origDep >= 0 ? 'rgba(16,185,129,.7)' : 'rgba(239,68,68,.7)',
                    simRev - simDep >= 0 ? 'rgba(99,102,241,.7)' : 'rgba(239,68,68,.7)'
                ],
                borderRadius: 8
            }]
        },
        options: { responsive: true, plugins: Object.assign({}, CHART_DEFAULTS.plugins, { legend: { display: false } }), scales: darkScales }
    });
}

function destroySimChart(id) {
    if (simCharts[id]) { simCharts[id].destroy(); delete simCharts[id]; }
}

// ─── ASSISTANT FINANCIER ──────────────────────────────────────
function askAssistantQ(q) {
    document.getElementById('assistant-input').value = q;
    askAssistant();
}

function askAssistant() {
    var input = document.getElementById('assistant-input');
    var q = input.value.trim();
    if (!q) return;
    var msgs = document.getElementById('assistant-msgs');
    msgs.innerHTML += '<div class="msg-user">' + q + '</div>';
    input.value = '';
    setTimeout(function () {
        var response = generateResponse(q);
        msgs.innerHTML += '<div class="msg-assistant">' + response + '</div>';
        msgs.scrollTop = msgs.scrollHeight;
    }, 400);
}

function generateResponse(q) {
    var mk = currentMonthKey();
    var rev = getMonthRevenu(mk);
    var dep = getMonthDepense(mk);
    var profit = rev - dep;
    var cash = getCashTotal();
    var savings = avgMonthlySavings();
    var ratio = rev > 0 ? dep / rev : 0;
    var runway = dep > 0 ? cash / dep : Infinity;
    var obj = DB.objectifs[0];
    var ql = q.toLowerCase();

    var catMap = {};
    DB.depenses.forEach(function (d) {
        if (monthKey(d.date) === mk) catMap[d.categorie] = (catMap[d.categorie] || 0) + d.montant;
    });
    var catArr = Object.keys(catMap).map(function (k) { return [k, catMap[k]]; });
    catArr.sort(function (a, b) { return b[1] - a[1]; });
    var topCat = catArr[0];

    if (ql.indexOf('objectif') !== -1 && (ql.indexOf('vite') !== -1 || ql.indexOf('rapide') !== -1 || ql.indexOf('atteindre') !== -1)) {
        if (!obj) return "Vous n'avez pas encore d'objectif financier. Cr\u00e9ez-en un dans \ud83c\udfaf Objectifs !";
        var restant = obj.cible - obj.actuel;
        var moisAct = savings > 0 ? (restant / savings).toFixed(1) : '\u221e';
        var mois20 = savings > 0 ? (restant / (savings * 1.2)).toFixed(1) : '\u221e';
        return 'Pour atteindre <strong>"' + obj.nom + '"</strong> plus vite :<br>' +
            '1\ufe0f\u20e3 \u00c0 votre rythme actuel : <strong>' + moisAct + ' mois</strong><br>' +
            '2\ufe0f\u20e3 En augmentant l\'épargne de 20% (+' + fmt(Math.max(0, savings) * 0.2) + '/mois) : <strong>' + mois20 + ' mois</strong><br>' +
            '3\ufe0f\u20e3 En r\u00e9duisant les d\u00e9penses de 15% : \u00e9conomie de <strong>' + fmt(dep * 0.15) + '</strong>/mois.<br>' +
            '\ud83d\udca1 Meilleur levier : r\u00e9duction de 10% des charges variables + hausse de revenus de 10%.';
    }

    if (ql.indexOf('r\u00e9du') !== -1 || ql.indexOf('redu') !== -1) {
        var match = ql.match(/(\d+).*?%/);
        var pct = match ? parseFloat(match[1]) / 100 : 0.15;
        var economie = dep * pct;
        var nouvProfit = profit + economie;
        var objL = DB.objectifs[0];
        var nouvelleEp = savings + economie;
        var moisN = objL && nouvelleEp > 0 ? ((objL.cible - objL.actuel) / nouvelleEp).toFixed(1) : '\u221e';
        var moisO = objL && savings > 0 ? ((objL.cible - objL.actuel) / savings).toFixed(1) : '\u221e';
        return 'Si vous r\u00e9duisez vos d\u00e9penses de <strong>' + (pct * 100).toFixed(0) + '%</strong> :<br>' +
            '\ud83d\udcb0 \u00c9conomie mensuelle : <strong>' + fmt(economie) + '</strong><br>' +
            '\ud83d\udcc8 Nouveau profit mensuel : <strong>' + fmt(nouvProfit) + '</strong><br>' +
            '\ud83c\udfaf ' + (objL ? 'Objectif "' + objL.nom + '" atteint en <strong>' + moisN + ' mois</strong> (au lieu de ' + moisO + ' mois)' : 'Ajoutez un objectif pour voir l\'impact.') + '<br>' +
            '\ud83d\udd0d Cat\u00e9gorie \u00e0 cibler : <strong>' + (topCat ? topCat[0] : 'Aucune donn\u00e9e') + '</strong>';
    }

    if (ql.indexOf('situation') !== -1 || ql.indexOf('sant\u00e9') !== -1 || ql.indexOf('bilan') !== -1) {
        var level = ratio < 0.7 && profit > 0 ? 'bonne' : ratio < 0.85 ? 'correcte' : 'pr\u00e9occupante';
        return '\ud83d\udcca <strong>Situation financi\u00e8re du mois : ' + level + '</strong><br>' +
            '\ud83d\udcb0 Revenus : <strong>' + fmt(rev) + '</strong><br>' +
            '\ud83d\udcb3 D\u00e9penses : <strong>' + fmt(dep) + '</strong><br>' +
            '\ud83d\udcc8 Profit : <strong style="color:' + (profit >= 0 ? '#10b981' : '#ef4444') + '">' + fmt(profit) + '</strong><br>' +
            '\ud83c\udfe6 Cash total : <strong>' + fmt(cash) + '</strong><br>' +
            '\u23f1 Runway : <strong>' + (runway === Infinity ? '\u221e' : runway.toFixed(1) + ' mois') + '</strong><br>' +
            '\ud83d\udcc9 Ratio d\u00e9p/rev : <strong>' + (ratio * 100).toFixed(1) + '%</strong>';
    }

    if (ql.indexOf('levier') !== -1 || ql.indexOf('meilleur') !== -1) {
        var topAct = null;
        var actifs2 = DB.activites.map(function (a) {
            var r = 0;
            DB.revenus.forEach(function (x) { if (x.activiteId === a.id) r += x.montant; });
            return { nom: a.nom, rev: r };
        });
        actifs2.sort(function (a, b) { return b.rev - a.rev; });
        topAct = actifs2[0];
        var potPond = 0;
        DB.revpotentiels.forEach(function (r) { potPond += r.montant * r.proba / 100; });
        return '\ud83c\udfc6 <strong>Vos meilleurs leviers financiers</strong> :<br>' +
            '1\ufe0f\u20e3 D\u00e9velopper <strong>' + (topAct ? topAct.nom : 'votre activit\u00e9 principale') + '</strong><br>' +
            '2\ufe0f\u20e3 R\u00e9duire <strong>' + (topCat ? topCat[0] : 'vos plus grosses d\u00e9penses') + '</strong>' + (topCat ? ' (' + fmt(topCat[1]) + ')' : '') + '<br>' +
            '3\ufe0f\u20e3 Convertir vos revenus potentiels (' + fmt(potPond) + ' en attente)<br>' +
            '4\ufe0f\u20e3 Augmenter votre taux d\'investissement';
    }

    if (ql.indexOf('augment') !== -1 && ql.indexOf('revenu') !== -1) {
        var matchR = ql.match(/(\d[\d\s]*)(?:\s*fcfa)?/i);
        var extra = matchR ? parseFloat(matchR[1].replace(/\s/g, '')) : 200000;
        if (extra < 1000) extra = 200000;
        var nouvelleEp2 = savings + extra;
        var objR = DB.objectifs[0];
        var moisR = objR && nouvelleEp2 > 0 ? ((objR.cible - objR.actuel) / nouvelleEp2).toFixed(1) : '\u221e';
        return 'Si vous augmentez vos revenus de <strong>' + fmt(extra) + '</strong>/mois :<br>' +
            '\ud83d\udcc8 Nouveaux revenus : <strong>' + fmt(rev + extra) + '</strong><br>' +
            '\ud83d\udcb9 Nouveau profit : <strong>' + fmt(profit + extra) + '</strong><br>' +
            '\ud83c\udfaf ' + (objR ? 'Objectif "' + objR.nom + '" atteint dans <strong>' + moisR + ' mois</strong>' : 'Ajoutez un objectif pour voir l\'estimation.');
    }

    return 'Je n\'ai pas trouv\u00e9 de r\u00e9ponse pr\u00e9cise. Essayez :<br>' +
        '\u2022 <em>"Comment atteindre mon objectif plus vite ?"</em><br>' +
        '\u2022 <em>"Que se passe-t-il si je r\u00e9duis mes d\u00e9penses de 20% ?"</em><br>' +
        '\u2022 <em>"Quelle est ma situation financi\u00e8re ?"</em><br>' +
        '\u2022 <em>"Quel est le meilleur levier ?"</em>';
}

// ─── MODAL CLOSE EXTENSION ────────────────────────────────────
document.querySelectorAll('#modal-objectif, #modal-revpot').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.classList.remove('open');
            editState.objectifs = null;
            editState.revpotentiels = null;
        }
    });
});

// ─── INIT ─────────────────────────────────────────────────────
updateModuleDashboard();
// Re-trigger renderDashboard if we are on the dashboard page during load
if (document.getElementById('page-dashboard').classList.contains('active')) {
    renderDashboard();
}
