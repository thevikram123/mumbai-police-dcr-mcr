import { isAdmin, sessionStation } from "../auth.js";
import { getSubmissions, submissionsFor } from "../data/store.js";
import { downloadSubmissionPdf } from "../components/pdf.js";

const scopedSubmissions = () => isAdmin() ? getSubmissions() : submissionsFor(sessionStation()?.name);

export function submissionsView() {
  const admin = isAdmin();
  const station = sessionStation();
  const rows = scopedSubmissions();
  return `<main id="app-content" class="page-content page-width">
    <div class="title-block"><h1>${admin ? "Submission Register" : "My Submissions"}</h1><p>${admin ? "All DCR and MCR reports filed across police stations" : `Reports filed by ${station?.name} police station`}</p><i></i></div>
    <section class="table-panel"><h2>Filed Reports</h2><div class="table-scroll">
      ${rows.length === 0 ? `<p class="empty-state">No reports have been submitted yet.${admin ? "" : " Use Create DCR or Create MCR to file today's figures."}</p>` : `
      <table><thead><tr><th>Reference</th><th>Type</th>${admin ? "<th>Police Station</th><th>DCP Zone</th>" : ""}<th>Period</th><th>Total FIR</th><th>Body</th><th>Other</th><th>Submitted At</th><th>Report</th></tr></thead>
      <tbody>${rows.map(s => `<tr>
        <td>${s.id}</td><td><span class="type-badge ${s.type.toLowerCase()}">${s.type}</span></td>
        ${admin ? `<td>${s.station}</td><td>${s.zone}</td>` : ""}
        <td>${s.period}</td><td>${s.values.total}</td><td>${s.values.body}</td><td>${s.values.other}</td>
        <td>${new Date(s.submittedAt).toLocaleString("en-IN")}</td>
        <td><button class="pdf-button" type="button" data-pdf="${s.id}">PDF ↓</button></td>
      </tr>`).join("")}</tbody></table>`}
    </div></section>
    <p class="data-note" data-pdf-status role="status"></p>
  </main>`;
}

export function bindSubmissions() {
  const buttons = document.querySelectorAll("[data-pdf]");
  if (!buttons.length) return;
  const rows = scopedSubmissions();
  const status = document.querySelector("[data-pdf-status]");
  buttons.forEach(button => button.addEventListener("click", async () => {
    const entry = rows.find(s => s.id === button.dataset.pdf);
    if (!entry) return;
    button.disabled = true;
    status.textContent = "Preparing PDF…";
    try {
      await downloadSubmissionPdf(entry);
      status.textContent = `PDF downloaded (${entry.id}).`;
    } catch (error) {
      status.textContent = error.message;
    }
    button.disabled = false;
  }));
}
