import { hierarchy } from "../data/reportData.js";
import { sessionStation, getSession } from "../auth.js";
import { addSubmission } from "../data/store.js";
import { downloadSubmissionPdf } from "../components/pdf.js";

const STEPS = ["Jurisdiction", "Report Figures", "Review & Submit"];

// Labels follow the bilingual English (Marathi) convention of the official
// N.C.R.B. I.I.F.-I First Information Report form.
const metricDefs = type => {
  const base = [
    { label: "No. of FIRs filed as on date", mr: "आज दिनांकापर्यंत दाखल एफ.आय.आर. संख्या", name: "total" },
    { label: "No. of FIRs filed for body offences", mr: "शरीराविरुद्ध गुन्ह्यांचे एफ.आय.आर.", name: "body" },
    { label: "No. of FIRs filed for other than body offences", mr: "इतर गुन्ह्यांचे एफ.आय.आर.", name: "other" }
  ];
  if (type !== "MCR") return base;
  return base.concat([
    { label: "Chargesheets filed against FIRs filed this month", mr: "या महिन्यातील एफ.आय.आर. विरुद्ध दाखल दोषारोपपत्रे", name: "currentCs" },
    { label: "Chargesheets filed against FIRs filed last month", mr: "मागील महिन्यातील एफ.आय.आर. विरुद्ध दाखल दोषारोपपत्रे", name: "lastCs" },
    { label: "Chargesheets pending for this month", mr: "या महिन्याची प्रलंबित दोषारोपपत्रे", name: "currentPending" },
    { label: "Chargesheets pending from last month", mr: "मागील महिन्याची प्रलंबित दोषारोपपत्रे", name: "lastPending" }
  ]);
};

const fieldLabel = (label, mr, required) => `<span>${label}${required ? " *" : ""}${mr ? `<em class="mr-label">${mr}</em>` : ""}</span>`;

export function reportFormView(type) {
  return `<main id="app-content" class="page-content page-width report-view">
    <div class="title-block"><h1>Create ${type}</h1><p>${type === "MCR" ? "Monthly Cumulative Report (मासिक संचयी अहवाल)" : "Daily Cumulative Report (दैनिक संचयी अहवाल)"} — Step-by-step filing</p><i></i></div>
    <div data-wizard="${type}"></div>
  </main>`;
}

export function bindReportForm() {
  const shell = document.querySelector("[data-wizard]");
  if (!shell) return;
  const type = shell.dataset.wizard;
  const station = sessionStation();
  if (!station) return;
  const draftKey = `mp-${type.toLowerCase()}-draft-${station.name}`;
  const isMcr = type === "MCR";
  const today = new Date().toISOString().slice(0, 10);
  const defaults = { period: isMcr ? today.slice(0, 7) : today };
  metricDefs(type).forEach(f => { defaults[f.name] = ""; });
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(draftKey) || "{}"); } catch { saved = {}; }
  const state = { step: 1, values: { ...defaults, ...saved } };

  const jurisdictionRows = [
    ["State", "राज्य", hierarchy.state], ["Range", "परिक्षेत्र", hierarchy.range], ["Unit", "घटक", hierarchy.unit],
    ["DCP Zone", "परिमंडळ", station.zone], ["SDPO / ACP / DCP", "उपविभागीय अधिकारी", station.division], ["Police Station", "पोलीस ठाणे", station.name]
  ];

  const stepper = () => `<ol class="wizard-stepper">${STEPS.map((label, i) => {
    const n = i + 1;
    const cls = n < state.step ? "done" : n === state.step ? "current" : "";
    return `<li class="${cls}"><span class="step-dot">${n < state.step ? "✓" : n}</span><span class="step-label">${label}</span></li>`;
  }).join("")}</ol>`;

  const mismatch = () => {
    const total = Number(state.values.total), body = Number(state.values.body), other = Number(state.values.other);
    if ([state.values.total, state.values.body, state.values.other].some(v => v === "")) return null;
    return body + other === total ? false : { total, sum: body + other };
  };

  const stepOne = () => `<section class="form-panel">
    <div class="panel-heading"><h2>Step 1 — Reporting Jurisdiction</h2><span>Auto-filled from your station login</span></div>
    <div class="form-grid">${jurisdictionRows.map(([label, mr, value]) => `
      <label class="form-field">${fieldLabel(label, mr)}<input value="${value}" readonly data-auto></label>`).join("")}
    </div>
    <div class="form-actions"><span class="wizard-note">Wrong station? Log out and sign in with the correct station account.</span>
      <button class="primary-button" type="button" data-next>Confirm &amp; Continue</button></div>
  </section>`;

  const stepTwo = () => `<form class="form-panel" data-step-form>
    <div class="panel-heading"><h2>Step 2 — ${isMcr ? "FIR & Chargesheet Figures" : "FIR Figures"}</h2><span>All fields are mandatory</span></div>
    <div class="form-grid metrics">
      <label class="form-field">${fieldLabel(isMcr ? "Report Month" : "Report Date", isMcr ? "अहवाल महिना" : "अहवाल दिनांक", true)}
        <input name="period" type="${isMcr ? "month" : "date"}" value="${state.values.period}" max="${isMcr ? today.slice(0, 7) : today}" required></label>
      ${metricDefs(type).map(f => `
      <label class="form-field">${fieldLabel(f.label, f.mr, true)}
        <input name="${f.name}" type="number" min="0" step="1" inputmode="numeric" value="${state.values[f.name]}" required></label>`).join("")}
    </div>
    <p class="validation-message ${mismatch() ? "error" : ""}" data-live-check role="status">${mismatch() ? `Body + other offences = ${mismatch().sum}, but total FIRs = ${mismatch().total}. Figures must tally.` : ""}</p>
    <div class="form-actions">
      <button class="outline-button" type="button" data-back>Back</button>
      <button class="outline-button" type="button" data-save-draft>Save Draft</button>
      <button class="primary-button" type="submit">Continue to Review</button>
    </div>
  </form>`;

  const stepThree = () => `<section class="form-panel">
    <div class="panel-heading"><h2>Step 3 — Review &amp; Submit</h2><span>Verify every figure before submission</span></div>
    <div class="review-grid">
      <div class="review-block"><h3>Jurisdiction</h3><dl>${jurisdictionRows.map(([label, , value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl></div>
      <div class="review-block"><h3>${isMcr ? "FIR & Chargesheet Figures" : "FIR Figures"}</h3><dl>
        <div><dt>${isMcr ? "Report Month" : "Report Date"}</dt><dd>${state.values.period}</dd></div>
        ${metricDefs(type).map(f => `<div><dt>${f.label}</dt><dd>${state.values[f.name]}</dd></div>`).join("")}
      </dl></div>
    </div>
    <label class="confirm-check"><input type="checkbox" data-confirm> I certify that the above figures are correct as per station records.</label>
    <p class="validation-message error" data-submit-error role="alert"></p>
    <div class="form-actions">
      <button class="outline-button" type="button" data-back>Back to Figures</button>
      <button class="primary-button" type="button" data-submit>Submit ${type}</button>
    </div>
  </section>`;

  const receipt = entry => `<section class="form-panel receipt-panel">
    <div class="receipt-mark">✓</div>
    <h2>${type} Submitted Successfully</h2>
    <p>Reference number <strong>${entry.id}</strong> — recorded for <strong>${entry.station}</strong>, ${isMcr ? "month" : "date"} <strong>${entry.period}</strong>.</p>
    <div class="form-actions receipt-actions">
      <button class="outline-button" type="button" data-download-pdf>Download PDF</button>
      <a class="outline-button" href="#/submissions">View Submission Register</a>
      <a class="primary-button" href="#/${isMcr ? "monthly" : "daily"}-dashboard">Open ${isMcr ? "Monthly" : "Daily"} Dashboard</a>
    </div>
    <p class="validation-message" data-pdf-status role="status"></p>
  </section>`;

  const collect = form => {
    Object.assign(state.values, Object.fromEntries(new FormData(form)));
  };

  const render = () => {
    shell.innerHTML = `${stepper()}${state.step === 1 ? stepOne() : state.step === 2 ? stepTwo() : stepThree()}`;
    shell.querySelector("[data-next]")?.addEventListener("click", () => { state.step = 2; render(); });
    shell.querySelectorAll("[data-back]").forEach(b => b.addEventListener("click", () => {
      const form = shell.querySelector("[data-step-form]");
      if (form) collect(form);
      state.step -= 1; render();
    }));
    const form = shell.querySelector("[data-step-form]");
    if (form) {
      form.addEventListener("input", () => {
        collect(form);
        const bad = mismatch();
        const message = form.querySelector("[data-live-check]");
        message.textContent = bad ? `Body + other offences = ${bad.sum}, but total FIRs = ${bad.total}. Figures must tally.` : "";
        message.classList.toggle("error", Boolean(bad));
      });
      form.querySelector("[data-save-draft]").addEventListener("click", () => {
        collect(form);
        localStorage.setItem(draftKey, JSON.stringify(state.values));
        const message = form.querySelector("[data-live-check]");
        message.classList.remove("error");
        message.textContent = `${type} draft saved for ${station.name}.`;
      });
      form.addEventListener("submit", event => {
        event.preventDefault();
        collect(form);
        if (mismatch()) return;
        state.step = 3; render();
      });
    }
    shell.querySelector("[data-submit]")?.addEventListener("click", () => {
      const error = shell.querySelector("[data-submit-error]");
      if (!shell.querySelector("[data-confirm]").checked) {
        error.textContent = "Please certify the figures before submitting.";
        return;
      }
      const values = {};
      metricDefs(type).forEach(f => { values[f.name] = Number(state.values[f.name]); });
      const entry = addSubmission({
        type, station: station.name, zone: station.zone, division: station.division,
        period: state.values.period, values, submittedBy: getSession()?.station || "station"
      });
      localStorage.removeItem(draftKey);
      shell.innerHTML = receipt(entry);
      shell.querySelector("[data-download-pdf]").addEventListener("click", async event => {
        const button = event.currentTarget;
        const status = shell.querySelector("[data-pdf-status]");
        button.disabled = true;
        status.classList.remove("error");
        status.textContent = "Preparing PDF…";
        try {
          await downloadSubmissionPdf(entry);
          status.textContent = `PDF downloaded (${entry.id}).`;
        } catch (error) {
          status.classList.add("error");
          status.textContent = error.message;
        }
        button.disabled = false;
      });
      shell.scrollIntoView({ behavior: "smooth" });
    });
  };

  render();
}
