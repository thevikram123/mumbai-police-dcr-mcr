import { hierarchy } from "../data/reportData.js";

const CDN_SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
];

const METRIC_LABELS = {
  total: "No. of FIRs filed as on date",
  body: "No. of FIRs filed for body offences",
  other: "No. of FIRs filed for other than body offences",
  currentCs: "No. of chargesheets filed against FIRs filed this month",
  lastCs: "No. of chargesheets filed against FIRs filed last month",
  currentPending: "No. of chargesheets pending for this month",
  lastPending: "No. of chargesheets pending from last month"
};

const INDIGO = [94, 106, 176];
const INK = [65, 61, 74];

let jspdfPromise;
function loadJsPdf() {
  if (!jspdfPromise) {
    jspdfPromise = CDN_SCRIPTS.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}. Check your internet connection.`));
      document.head.appendChild(script);
    })), Promise.resolve()).then(() => window.jspdf);
    jspdfPromise.catch(() => { jspdfPromise = null; });
  }
  return jspdfPromise;
}

async function logoDataUrl() {
  try {
    const img = new Image();
    img.src = "assets/mumbai-police-logo.png";
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch { return null; }
}

async function documentHeader(doc, subtitle) {
  const logo = await logoDataUrl();
  if (logo) doc.addImage(logo, "PNG", 14, 10, 24, 24);
  doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(...INK);
  doc.text("MUMBAI POLICE", 43, 19);
  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(90);
  doc.text("Greater Mumbai Police — DCR & MCR Reporting Portal", 43, 26);
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...INDIGO);
  doc.text(subtitle, 43, 33);
  doc.setDrawColor(...INDIGO).setLineWidth(0.8);
  doc.line(14, 38, 196, 38);
  return 44;
}

function documentFooter(doc) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(130);
    doc.text("Computer-generated report — Mumbai Police DCR/MCR demonstration portal", 14, 290);
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: "right" });
  }
}

const tableTheme = {
  theme: "grid",
  styles: { font: "helvetica", fontSize: 10, textColor: INK, cellPadding: 2.5 },
  headStyles: { fillColor: INDIGO, textColor: 255, fontStyle: "bold" },
  alternateRowStyles: { fillColor: [244, 244, 248] }
};

export async function downloadSubmissionPdf(entry) {
  const { jsPDF } = await loadJsPdf();
  const doc = new jsPDF();
  const isMcr = entry.type === "MCR";
  let y = await documentHeader(doc, `${isMcr ? "Monthly" : "Daily"} Cumulative Report (${entry.type})`);

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
  doc.text(`Reference No.: ${entry.id}`, 14, y);
  doc.text(`Report ${isMcr ? "Month" : "Date"}: ${entry.period}`, 105, y);
  y += 6;
  doc.text(`Submitted: ${new Date(entry.submittedAt).toLocaleString("en-IN")}`, 14, y);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 105, y);
  y += 8;

  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["Reporting Jurisdiction", "Particulars"]],
    body: [
      ["State", hierarchy.state], ["Range", hierarchy.range], ["Unit", hierarchy.unit],
      ["DCP Zone", entry.zone], ["SDPO / ACP / DCP", entry.division], ["Police Station", entry.station]
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } }
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    ...tableTheme, startY: y,
    head: [[isMcr ? "FIR & Chargesheet Details" : "FIR Details", "Count"]],
    body: Object.keys(METRIC_LABELS).filter(k => entry.values[k] !== undefined)
      .map(k => [METRIC_LABELS[k], String(entry.values[k])]),
    columnStyles: { 0: { cellWidth: 140 }, 1: { halign: "right", fontStyle: "bold" } }
  });
  y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(10).setTextColor(...INK);
  doc.text("Certified that the figures stated above are correct as per station records.", 14, y);
  y += 24;
  doc.setDrawColor(120).setLineWidth(0.3);
  doc.line(14, y, 74, y);
  doc.line(130, y, 196, y);
  doc.setFontSize(9).setTextColor(90);
  doc.text("Station House Officer", 14, y + 5);
  doc.text(`${entry.station} Police Station`, 130, y + 5);

  documentFooter(doc);
  doc.save(`${entry.id}-${entry.station.replace(/\s+/g, "-")}.pdf`);
}

export async function downloadDashboardPdf({ mode, scopeLabel, rows, totals }) {
  const { jsPDF } = await loadJsPdf();
  const doc = new jsPDF();
  const monthly = mode === "monthly";
  let y = await documentHeader(doc, `${monthly ? "Monthly" : "Daily"} Cumulative Dashboard`);

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
  doc.text(`Scope: ${scopeLabel}`, 14, y);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 105, y);
  y += 8;

  const summary = monthly
    ? [["FIRs Filed", totals.total], ["Chargesheets This Month", totals.currentCs], ["Chargesheets Against Last Month FIRs", totals.lastCs], ["Total Pending Chargesheets", totals.currentPending + totals.lastPending]]
    : [["Total FIRs", totals.total], ["Body Offences", totals.body], ["Other Offences", totals.other]];
  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["Summary", "Value"]],
    body: summary.map(([k, v]) => [k, String(v)]),
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 120 }, 1: { halign: "right" } }
  });
  y = doc.lastAutoTable.finalY + 8;

  const head = monthly
    ? [["Police Station", "FIRs", "CS This Month", "CS vs Last Month", "Pending This Month", "Pending Last Month", "MCR Status"]]
    : [["Police Station", "DCP Zone", "Total FIR", "Body", "Other", "DCR Status"]];
  const body = rows.map(s => monthly
    ? [s.name, s.total, s.currentCs, s.lastCs, s.currentPending, s.lastPending, s.submitted ? "Submitted" : "Awaiting"]
    : [s.name, s.zone, s.total, s.body, s.other, s.submitted ? "Submitted" : "Awaiting"]);
  const foot = monthly
    ? [["TOTAL", totals.total, totals.currentCs, totals.lastCs, totals.currentPending, totals.lastPending, ""]]
    : [["TOTAL", "", totals.total, totals.body, totals.other, ""]];
  doc.autoTable({
    ...tableTheme, startY: y,
    head, body: body.map(r => r.map(String)), foot: foot.map(r => r.map(String)),
    footStyles: { fillColor: [240, 241, 248], textColor: INK, fontStyle: "bold" }
  });

  documentFooter(doc);
  doc.save(`${monthly ? "MCR" : "DCR"}-dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function downloadStateOverviewPdf({ stateUnits, offenceTypes, applicationsPendingAction, applicationsPendingVisit, stateTotals }) {
  const { jsPDF } = await loadJsPdf();
  const doc = new jsPDF();
  let y = await documentHeader(doc, "Maharashtra State Overview");

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...INK);
  doc.text(`Reporting Units: ${stateTotals.units}`, 14, y);
  doc.text(`FIRs Filed (State): ${stateTotals.totalFir}`, 80, y);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 140, y);
  y += 8;

  const sortedUnits = [...stateUnits].sort((a, b) => b.fir - a.fir);
  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["Unit-wise FIR Registration", "FIRs Filed"]],
    body: sortedUnits.map(u => [u.unit, String(u.fir)]),
    foot: [["TOTAL", String(stateTotals.totalFir)]],
    footStyles: { fillColor: [240, 241, 248], textColor: INK, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", cellWidth: 40 } }
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["Type of Offence", "No. of Offences"]],
    body: offenceTypes.map(o => [o.type, String(o.count)]),
    foot: [["TOTAL", String(stateTotals.totalOffences)]],
    footStyles: { fillColor: [240, 241, 248], textColor: INK, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", cellWidth: 40 } }
  });
  y = doc.lastAutoTable.finalY + 8;

  const pendencyRows = list => [
    ...list.best.map(r => [String(r.rank), r.unit, String(r.total), String(r.pending), r.percent !== undefined ? `${r.percent}%` : undefined].filter(v => v !== undefined)),
    ...list.worst.map(r => [String(r.rank), r.unit, String(r.total), String(r.pending), r.percent !== undefined ? `${r.percent}%` : undefined].filter(v => v !== undefined))
  ];
  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["#", "Applications Pending for Action — Unit", "Total Applications", "Pending"]],
    body: pendencyRows(applicationsPendingAction),
    columnStyles: { 0: { cellWidth: 14 }, 2: { halign: "right" }, 3: { halign: "right" } }
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    ...tableTheme, startY: y,
    head: [["#", "Applications Pending for Site Visit — Unit", "Total", "Pending", "Pending %"]],
    body: pendencyRows(applicationsPendingVisit),
    columnStyles: { 0: { cellWidth: 14 }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } }
  });

  documentFooter(doc);
  doc.save(`State-overview-${new Date().toISOString().slice(0, 10)}.pdf`);
}
