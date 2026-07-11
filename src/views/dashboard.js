import { dailyTrend, stations } from "../data/reportData.js";
import { isAdmin, sessionStation } from "../auth.js";
import { mergedStationFigures } from "../data/store.js";
import { groupedBarChart, donutChart, bindChartTooltips } from "../components/charts.js";
import { downloadDashboardPdf } from "../components/pdf.js";

const POLICE = "#5e6ab0", LIGHT = "#c9cdea", AMBER = "#f4d56f";

const sum = (rows, key) => rows.reduce((a, r) => a + Number(r[key] || 0), 0);

function scopeRows(type) {
  const merged = mergedStationFigures(type, stations);
  if (isAdmin()) return merged;
  const own = sessionStation();
  return merged.filter(s => s.name === own?.name);
}

export function dashboardData(mode) {
  const monthly = mode === "monthly";
  const rows = scopeRows(monthly ? "MCR" : "DCR");
  const scopeLabel = isAdmin() ? "All police stations" : `Police Station: ${rows[0]?.name || ""}`;
  const totals = {
    total: sum(rows, "total"), body: sum(rows, "body"), other: sum(rows, "other"),
    currentCs: sum(rows, "currentCs"), lastCs: sum(rows, "lastCs"),
    currentPending: sum(rows, "currentPending"), lastPending: sum(rows, "lastPending")
  };
  return { monthly, rows, scopeLabel, totals };
}

const statusBadge = row => row.submitted
  ? `<span class="status-badge ok" title="Updated ${new Date(row.submittedAt).toLocaleString("en-IN")}">Submitted</span>`
  : `<span class="status-badge wait">Awaiting</span>`;

export function dashboardView(mode) {
  const admin = isAdmin();
  const { monthly, rows, scopeLabel, totals } = dashboardData(mode);
  const cards = monthly
    ? [["FIRs Filed", totals.total], ["Chargesheets This Month", totals.currentCs], ["Against Last Month FIRs", totals.lastCs], ["Total Pending", totals.currentPending + totals.lastPending]]
    : [["Total FIRs", totals.total], ["Body Offences", totals.body], ["Other Offences", totals.other], admin ? ["Stations Reported", `${rows.filter(r => r.submitted).length}/${rows.length}`] : ["Report Status", rows[0]?.submitted ? "Filed" : "Pending"]];
  return `<main id="app-content" class="page-content page-width dashboard-view" data-dashboard-mode="${mode}">
    <div class="title-block"><h1>${monthly ? "Monthly" : "Daily"} Cumulative Dashboard</h1><p>${scopeLabel} — live figures update as reports are submitted</p><i></i>
      <div class="dashboard-actions"><button class="outline-button" type="button" data-export-dashboard>Download PDF Report</button><span class="pdf-inline-status" data-pdf-status role="status"></span></div>
    </div>
    <section class="summary-grid">${cards.map(([label, value], i) => `<article class="summary-card"><img src="${["assets/report.svg", "assets/dcp.png", "assets/feedback.png", "assets/passport.svg"][i]}" alt=""><div><span>${label}</span><strong>${value}</strong></div></article>`).join("")}</section>
    ${monthly ? monthlyContent(rows, totals, admin) : dailyContent(rows, totals, admin)}
    <p class="data-note">Baseline figures are synthetic demonstration data; submitted DCR/MCR figures override them. Hover over charts for details, click table headers to sort.</p>
  </main>`;
}

function dailyContent(rows, totals, admin) {
  const chart = admin
    ? groupedBarChart({
        data: rows.map(s => ({ label: s.name, values: [s.body, s.other] })),
        seriesLabels: ["Body offences", "Other offences"]
      })
    : groupedBarChart({
        data: dailyTrend.map(d => ({ label: d.day, values: [d.body, d.other] })),
        seriesLabels: ["Body offences", "Other offences"]
      });
  return `<section class="dashboard-grid">
    <article class="data-panel"><h2>${admin ? "FIRs by Police Station" : "Daily FIR Trend"}</h2><p>${admin ? "Body vs other offences per station" : "Body and other offences over the last 7 days"}</p>${chart}
      <div class="chart-legend"><span><i></i>Body offences</span><span><i class="light"></i>Other offences</span></div></article>
    <article class="data-panel composition"><h2>Offence Composition</h2>
      ${donutChart({ segments: [{ label: "Body offences", value: totals.body, color: POLICE }, { label: "Other offences", value: totals.other, color: LIGHT }], centerValue: totals.total, centerLabel: "Total FIRs" })}
      <p><b>${totals.body}</b> body &nbsp; / &nbsp; <b>${totals.other}</b> other</p></article>
  </section>
  <section class="table-panel"><h2>Police Station Performance</h2><div class="table-scroll">
    <table data-sortable><thead><tr>
      <th data-sort="text">Police Station</th><th data-sort="text">DCP Zone</th><th data-sort="num">Total FIR</th><th data-sort="num">Body</th><th data-sort="num">Other</th>${admin ? `<th data-sort="text">Today's DCR</th>` : ""}
    </tr></thead>
    <tbody>${rows.map(s => `<tr><td>${s.name}</td><td>${s.zone}</td><td>${s.total}</td><td>${s.body}</td><td>${s.other}</td>${admin ? `<td>${statusBadge(s)}</td>` : ""}</tr>`).join("")}</tbody>
    <tfoot><tr><td colspan="2">TOTAL</td><td>${totals.total}</td><td>${totals.body}</td><td>${totals.other}</td>${admin ? "<td></td>" : ""}</tr></tfoot></table>
  </div></section>`;
}

function monthlyContent(rows, totals, admin) {
  const pendingTotal = totals.currentPending + totals.lastPending;
  return `<section class="dashboard-grid">
    <article class="data-panel"><h2>Chargesheet Conversion${admin ? " by Station" : ""}</h2><p>Chargesheets this month divided by FIRs filed</p>
      <div class="progress-list">${rows.map(s => {
        const p = s.total ? Math.round(s.currentCs / s.total * 100) : 0;
        return `<div class="progress-row" data-tip="${s.name}: ${s.currentCs} chargesheets / ${s.total} FIRs (${p}%)"><span>${s.name}</span><i><b style="width:${p}%"></b></i><strong>${p}%</strong></div>`;
      }).join("")}</div></article>
    <article class="data-panel composition"><h2>Pending Workload</h2>
      ${donutChart({ segments: [{ label: "Pending this month", value: totals.currentPending, color: POLICE }, { label: "Pending from last month", value: totals.lastPending, color: AMBER }], centerValue: pendingTotal, centerLabel: "Total Pending" })}
      <p><b>${totals.currentPending}</b> current &nbsp; / &nbsp; <b>${totals.lastPending}</b> previous</p></article>
  </section>
  <section class="table-panel"><h2>Monthly Station Detail</h2><div class="table-scroll">
    <table data-sortable><thead><tr>
      <th data-sort="text">Police Station</th><th data-sort="num">FIRs</th><th data-sort="num">CS This Month</th><th data-sort="num">CS vs Last Month</th><th data-sort="num">Pending This Month</th><th data-sort="num">Pending Last Month</th>${admin ? `<th data-sort="text">This Month's MCR</th>` : ""}
    </tr></thead>
    <tbody>${rows.map(s => `<tr><td>${s.name}</td><td>${s.total}</td><td>${s.currentCs}</td><td>${s.lastCs}</td><td>${s.currentPending}</td><td>${s.lastPending}</td>${admin ? `<td>${statusBadge(s)}</td>` : ""}</tr>`).join("")}</tbody>
    <tfoot><tr><td>TOTAL</td><td>${totals.total}</td><td>${totals.currentCs}</td><td>${totals.lastCs}</td><td>${totals.currentPending}</td><td>${totals.lastPending}</td>${admin ? "<td></td>" : ""}</tr></tfoot></table>
  </div></section>`;
}

export function bindDashboard() {
  const view = document.querySelector(".dashboard-view");
  if (!view) return;
  bindChartTooltips();
  view.querySelector("[data-export-dashboard]")?.addEventListener("click", async event => {
    const button = event.currentTarget;
    const status = view.querySelector("[data-pdf-status]");
    const mode = view.dataset.dashboardMode;
    const { rows, scopeLabel, totals } = dashboardData(mode);
    button.disabled = true;
    status.textContent = "Preparing PDF…";
    try {
      await downloadDashboardPdf({ mode, scopeLabel, rows, totals });
      status.textContent = "PDF downloaded.";
    } catch (error) {
      status.textContent = error.message;
    }
    button.disabled = false;
  });
  document.querySelectorAll("table[data-sortable]").forEach(table => {
    table.querySelectorAll("th[data-sort]").forEach((th, index) => th.addEventListener("click", () => {
      const asc = th.dataset.dir !== "asc";
      table.querySelectorAll("th").forEach(h => { delete h.dataset.dir; });
      th.dataset.dir = asc ? "asc" : "desc";
      const body = table.tBodies[0];
      const rows = [...body.rows].sort((a, b) => {
        const av = a.cells[index].textContent.trim(), bv = b.cells[index].textContent.trim();
        const cmp = th.dataset.sort === "num" ? Number(av) - Number(bv) : av.localeCompare(bv);
        return asc ? cmp : -cmp;
      });
      rows.forEach(r => body.appendChild(r));
    }));
  });
}
