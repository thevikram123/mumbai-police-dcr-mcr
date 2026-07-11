import { hierarchy, stations } from "../data/reportData.js";
import { field, formActions } from "../components/formFields.js";

const selectedStation = () => stations.find(s => s.name === localStorage.getItem("mp-selected-station")) || stations[0];

export function reportFormView(type) {
  const isMcr = type === "MCR";
  const station = selectedStation();
  const saved = JSON.parse(localStorage.getItem(`mp-${type.toLowerCase()}-draft`) || "{}");
  const metricFields = [
    { label: "No. of FIRs filed as on date", name: "total", value: saved.total ?? station.total },
    { label: "No. of FIRs filed for body offences", name: "body", value: saved.body ?? station.body },
    { label: "No. of FIRs filed for other offences", name: "other", value: saved.other ?? station.other }
  ];
  if (isMcr) metricFields.push(
    { label: "Chargesheets filed against FIRs this month", name: "currentCs", value: saved.currentCs ?? station.currentCs },
    { label: "Chargesheets filed against FIRs last month", name: "lastCs", value: saved.lastCs ?? station.lastCs },
    { label: "Chargesheets pending for this month", name: "currentPending", value: saved.currentPending ?? station.currentPending },
    { label: "Chargesheets pending from last month", name: "lastPending", value: saved.lastPending ?? station.lastPending }
  );
  return `<main id="app-content" class="page-content page-width report-view">
    <div class="title-block"><h1>Create ${type}</h1><p>${isMcr ? "Monthly" : "Daily"} Cumulative Report</p><i></i></div>
    <form class="report-form" data-report-form="${type}">
      <section class="form-panel"><div class="panel-heading"><h2>Reporting Jurisdiction</h2><span>Auto-filled from station profile</span></div><div class="form-grid">
        ${field({ label: "State", name: "state", value: hierarchy.state, readonly: true })}
        ${field({ label: "Range", name: "range", value: hierarchy.range, readonly: true })}
        ${field({ label: "Unit", name: "unit", value: hierarchy.unit, readonly: true })}
        ${field({ label: "DCP Zone", name: "zone", value: station.zone, readonly: true })}
        ${field({ label: "SDPO / ACP / DCP", name: "division", value: station.division, readonly: true })}
        ${field({ label: "Police Station", name: "station", value: station.name, readonly: true })}
      </div></section>
      <section class="form-panel"><div class="panel-heading"><h2>${isMcr ? "FIR & Chargesheet Details" : "FIR Details"}</h2><span>All fields are mandatory</span></div><div class="form-grid metrics">
        ${metricFields.map(f => field({ ...f, type: "number", required: true })).join("")}
      </div><p class="validation-message" role="status"></p>${formActions(type)}</section>
    </form>
  </main>`;
}

export function bindReportForm() {
  const form = document.querySelector("[data-report-form]");
  if (!form) return;
  const type = form.dataset.reportForm;
  const save = () => {
    const values = Object.fromEntries(new FormData(form));
    localStorage.setItem(`mp-${type.toLowerCase()}-draft`, JSON.stringify(values));
    form.querySelector(".validation-message").textContent = `${type} draft saved successfully.`;
  };
  form.querySelector("[data-save-draft]")?.addEventListener("click", save);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const total = Number(values.total), body = Number(values.body), other = Number(values.other);
    const message = form.querySelector(".validation-message");
    if (body + other !== total) {
      message.textContent = "Body offences plus other offences must equal total FIRs.";
      message.classList.add("error");
      return;
    }
    localStorage.removeItem(`mp-${type.toLowerCase()}-draft`);
    message.classList.remove("error");
    message.textContent = `${type} submitted successfully for ${values.station}.`;
  });
}

