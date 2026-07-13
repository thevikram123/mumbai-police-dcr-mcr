import { stateUnits, offenceTypes, applicationsPendingAction, applicationsPendingVisit, stateTotals } from "../data/stateData.js";
import { donutChart } from "../components/charts.js";

const OFFENCE_COLORS = ["#5e6ab0", "#8892cf", "#c9cdea", "#f4d56f", "#e8a87c", "#a3c9a8", "#b98ec9"];

export function stateOverviewView() {
  const topUnits = [...stateUnits].sort((a, b) => b.fir - a.fir).slice(0, 10);
  const maxFir = topUnits[0].fir;
  const busiest = topUnits[0];
  return `<main id="app-content" class="page-content page-width dashboard-view">
    <div class="title-block"><h1>Maharashtra State Overview</h1><p>Unit-wise FIR registration, offence composition, and application pendency</p><i></i></div>
    <section class="summary-grid">
      <article class="summary-card"><img src="assets/report.svg" alt=""><div><span>Reporting Units</span><strong>${stateTotals.units}</strong></div></article>
      <article class="summary-card"><img src="assets/dcp.png" alt=""><div><span>FIRs Filed (State)</span><strong>${stateTotals.totalFir}</strong></div></article>
      <article class="summary-card"><img src="assets/feedback.png" alt=""><div><span>Busiest Unit</span><strong class="small-stat">${busiest.unit}</strong></div></article>
      <article class="summary-card"><img src="assets/passport.svg" alt=""><div><span>Offences Classified</span><strong>${stateTotals.totalOffences}</strong></div></article>
    </section>
    <section class="dashboard-grid">
      <article class="data-panel"><h2>Top 10 Units by FIRs Filed</h2><p>Hover a bar for exact figures</p>
        <div class="progress-list">${topUnits.map(u => `
          <div class="progress-row" data-tip="${u.unit}: ${u.fir} FIRs filed"><span>${u.unit}</span><i><b style="width:${u.fir / maxFir * 100}%"></b></i><strong>${u.fir}</strong></div>`).join("")}
        </div></article>
      <article class="data-panel composition"><h2>Offence Composition</h2>
        ${donutChart({ segments: offenceTypes.map((o, i) => ({ label: o.type, value: o.count, color: OFFENCE_COLORS[i] })), centerValue: stateTotals.totalOffences, centerLabel: "Total Offences" })}
        <div class="donut-legend">${offenceTypes.map((o, i) => `<span><i style="background:${OFFENCE_COLORS[i]}"></i>${o.type} (${o.count})</span>`).join("")}</div>
      </article>
    </section>
    <section class="dashboard-grid pendency-grid">
      <article class="table-panel"><h2>Applications Pending for Action</h2><div class="table-scroll">
        <table><thead><tr><th>#</th><th>Unit</th><th>Total Applications</th><th>Pending</th></tr></thead>
        <tbody>
          ${applicationsPendingAction.best.map(r => `<tr><td>${r.rank}</td><td>${r.unit}</td><td>${r.total}</td><td><span class="status-badge ok">${r.pending}</span></td></tr>`).join("")}
          <tr class="rank-gap"><td colspan="4">⋯</td></tr>
          ${applicationsPendingAction.worst.map(r => `<tr><td>${r.rank}</td><td>${r.unit}</td><td>${r.total}</td><td><span class="status-badge wait">${r.pending}</span></td></tr>`).join("")}
        </tbody></table>
      </div></article>
      <article class="table-panel"><h2>Applications Pending for Site Visit</h2><div class="table-scroll">
        <table><thead><tr><th>#</th><th>Unit</th><th>Total</th><th>Pending</th><th>Pending %</th></tr></thead>
        <tbody>
          ${applicationsPendingVisit.best.map(r => `<tr><td>${r.rank}</td><td>${r.unit}</td><td>${r.total}</td><td>${r.pending}</td><td><span class="status-badge ok">${r.percent}%</span></td></tr>`).join("")}
          <tr class="rank-gap"><td colspan="5">⋯</td></tr>
          ${applicationsPendingVisit.worst.map(r => `<tr><td>${r.rank}</td><td>${r.unit}</td><td>${r.total}</td><td>${r.pending}</td><td><span class="status-badge wait">${r.percent}%</span></td></tr>`).join("")}
        </tbody></table>
      </div></article>
    </section>
    <section class="table-panel"><h2>All Units — FIRs Filed</h2><div class="table-scroll">
      <table data-sortable><thead><tr><th data-sort="text">Unit</th><th data-sort="num">FIRs Filed</th></tr></thead>
      <tbody>${[...stateUnits].sort((a, b) => b.fir - a.fir).map(u => `<tr><td>${u.unit}</td><td>${u.fir}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td>TOTAL</td><td>${stateTotals.totalFir}</td></tr></tfoot></table>
    </div></section>
    <p class="data-note">Rankings show the five best and five worst performing units. Hover charts for details, click table headers to sort.</p>
  </main>`;
}

// Uses the .dashboard-view class, so bindDashboard() wires its tooltips and sortable table.
