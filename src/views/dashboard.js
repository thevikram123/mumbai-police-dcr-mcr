import { dailyTrend, stations, totals } from "../data/reportData.js";

const dailyRows = () => stations.map(s => `<tr><td>${s.name}</td><td>${s.zone}</td><td>${s.total}</td><td>${s.body}</td><td>${s.other}</td></tr>`).join("");
const monthlyRows = () => stations.map(s => `<tr><td>${s.name}</td><td>${s.total}</td><td>${s.currentCs}</td><td>${s.lastCs}</td><td>${s.currentPending}</td><td>${s.lastPending}</td></tr>`).join("");

export function dashboardView(mode) {
  const monthly = mode === "monthly";
  const cards = monthly
    ? [["FIRs Filed", totals.total], ["Chargesheets This Month", totals.currentCs], ["Against Last Month FIRs", totals.lastCs], ["Total Pending", totals.currentPending + totals.lastPending]]
    : [["Total FIRs", totals.total], ["Body Offences", totals.body], ["Other Offences", totals.other], ["Police Stations", stations.length]];
  return `<main id="app-content" class="page-content page-width dashboard-view">
    <div class="title-block"><h1>${monthly ? "Monthly" : "Daily"} Cumulative Dashboard</h1><p>${monthly ? "July 2026 through 10 July" : "As of 10 July 2026"}</p><i></i></div>
    <section class="summary-grid">${cards.map(([label, value], i) => `<article class="summary-card"><img src="${["assets/report.svg","assets/dcp.png","assets/feedback.png","assets/passport.svg"][i]}" alt=""><div><span>${label}</span><strong>${value}</strong></div></article>`).join("")}</section>
    ${monthly ? monthlyContent() : dailyContent()}
    <p class="data-note">Synthetic demonstration data. Validate organizational hierarchy before production use.</p>
  </main>`;
}

function dailyContent() {
  const max = Math.max(...dailyTrend.flatMap(d => [d.body, d.other]));
  return `<section class="dashboard-grid"><article class="data-panel"><h2>Daily FIR Trend</h2><p>Body and other offences</p><div class="bar-chart">${dailyTrend.map(d => `<div class="bar-group"><div class="bar-pair"><i style="height:${d.body / max * 100}%"></i><i class="light" style="height:${d.other / max * 100}%"></i></div><span>${d.day}</span></div>`).join("")}</div><div class="chart-legend"><span><i></i>Body offences</span><span><i class="light"></i>Other offences</span></div></article><article class="data-panel composition"><h2>Offence Composition</h2><div class="donut" style="--body:${totals.body / totals.total * 100}%"><strong>${totals.total}<small>Total FIRs</small></strong></div><p><b>${totals.body}</b> body &nbsp; / &nbsp; <b>${totals.other}</b> other</p></article></section>
    <section class="table-panel"><h2>Police Station Performance</h2><div class="table-scroll"><table><thead><tr><th>Police Station</th><th>DCP Zone</th><th>Total FIR</th><th>Body</th><th>Other</th></tr></thead><tbody>${dailyRows()}</tbody><tfoot><tr><td colspan="2">TOTAL</td><td>${totals.total}</td><td>${totals.body}</td><td>${totals.other}</td></tr></tfoot></table></div></section>`;
}

function monthlyContent() {
  return `<section class="dashboard-grid"><article class="data-panel"><h2>Chargesheet Conversion by Station</h2><p>Chargesheets this month divided by FIRs filed</p><div class="progress-list">${stations.map(s => { const p = Math.round(s.currentCs / s.total * 100); return `<div><span>${s.name}</span><i><b style="width:${p}%"></b></i><strong>${p}%</strong></div>`; }).join("")}</div></article><article class="data-panel composition"><h2>Pending Workload</h2><div class="donut pending" style="--body:${totals.currentPending / (totals.currentPending + totals.lastPending) * 100}%"><strong>${totals.currentPending + totals.lastPending}<small>Total Pending</small></strong></div><p><b>${totals.currentPending}</b> current &nbsp; / &nbsp; <b>${totals.lastPending}</b> previous</p></article></section>
    <section class="table-panel"><h2>Monthly Station Detail</h2><div class="table-scroll"><table><thead><tr><th>Police Station</th><th>FIRs</th><th>CS This Month</th><th>CS vs Last Month</th><th>Pending This Month</th><th>Pending Last Month</th></tr></thead><tbody>${monthlyRows()}</tbody><tfoot><tr><td>TOTAL</td><td>${totals.total}</td><td>${totals.currentCs}</td><td>${totals.lastCs}</td><td>${totals.currentPending}</td><td>${totals.lastPending}</td></tr></tfoot></table></div></section>`;
}

