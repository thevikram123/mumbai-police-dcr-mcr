import { getSession, sessionStation } from "../auth.js";
import { latestSubmissionFor } from "../data/store.js";

const stationServices = station => {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const dcr = latestSubmissionFor("DCR", station.name);
  const mcr = latestSubmissionFor("MCR", station.name);
  const dcrDone = dcr?.period === today;
  const mcrDone = mcr?.period === month;
  return [
    { route: "dcr", icon: "assets/report.svg", title: "Step 1 — Create Daily Report (DCR)", text: dcrDone ? `Today's DCR filed (ref ${dcr.id}). You may refile to correct figures.` : "File today's FIR figures for your station. Due daily by 18:00.", badge: dcrDone ? "done" : "due" },
    { route: "mcr", icon: "assets/dcp.png", title: "Step 2 — Create Monthly Report (MCR)", text: mcrDone ? `This month's MCR filed (ref ${mcr.id}).` : "File FIR and chargesheet progress for the reporting month.", badge: mcrDone ? "done" : "due" },
    { route: "daily-dashboard", icon: "assets/feedback.png", title: "Step 3 — Review Daily Dashboard", text: "Verify your submitted daily figures and trends." },
    { route: "monthly-dashboard", icon: "assets/press-release.svg", title: "Step 4 — Review Monthly Dashboard", text: "Track chargesheet conversion and pending workload." },
    { route: "submissions", icon: "assets/vehicles.svg", title: "My Submissions", text: "Audit trail with PDF download of every report filed by your station." },
    { route: "assistant", icon: "assets/passport.svg", title: "Ask the Assistant", text: "Question your station's FIR and chargesheet figures in plain language." }
  ];
};

const adminServices = [
  { route: "daily-dashboard", icon: "assets/feedback.png", title: "Daily Dashboard (All Stations)", text: "City-wide FIR figures with per-station DCR submission status." },
  { route: "monthly-dashboard", icon: "assets/press-release.svg", title: "Monthly Dashboard (All Stations)", text: "Chargesheet conversion and pending workload across zones." },
  { route: "state-overview", icon: "assets/dcp.png", title: "Maharashtra State Overview", text: "Unit-wise FIR registration, offence composition, and application pendency." },
  { route: "submissions", icon: "assets/report.svg", title: "Submission Register", text: "Every DCR and MCR filed, with references, timestamps, and PDF download." },
  { route: "assistant", icon: "assets/passport.svg", title: "Ask the Assistant", text: "Query city-wide figures in plain language — which stations lag, where pendency grows." },
  { route: "contact", icon: "assets/vehicles.svg", title: "Help & Contact", text: "Portal administration and support information." }
];

export function homeView() {
  const session = getSession();
  const station = sessionStation();
  const services = session?.role === "admin" ? adminServices : stationServices(station);
  const heading = session?.role === "admin"
    ? { title: "HQ Monitoring Console", sub: "Cross-station view of daily and monthly cumulative reports" }
    : { title: `${station.name} Police Station`, sub: "Follow the steps below to complete today's reporting duty" };
  return `<main id="app-content" class="page-content home-view page-width">
    <div class="title-block"><h1>${heading.title}</h1><p>${heading.sub}</p><i></i></div>
    <section class="service-grid" aria-label="Reporting services">
      ${services.map(s => `<a class="service-card" href="#/${s.route}">
        ${s.badge ? `<span class="card-badge ${s.badge}">${s.badge === "done" ? "Filed" : "Due"}</span>` : ""}
        <img src="${s.icon}" alt=""><h2>${s.title}</h2><p>${s.text}</p></a>`).join("")}
    </section>
  </main>`;
}
