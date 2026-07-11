const services = [
  { route: "dcr", icon: "assets/report.svg", title: "Create Daily Cumulative Report", text: "Enter FIR figures for the selected reporting date." },
  { route: "mcr", icon: "assets/dcp.png", title: "Create Monthly Cumulative Report", text: "Enter FIR and chargesheet progress for the reporting month." },
  { route: "daily-dashboard", icon: "assets/feedback.png", title: "Daily Report Dashboard", text: "Review daily FIR totals across Mumbai police stations." },
  { route: "monthly-dashboard", icon: "assets/press-release.svg", title: "Monthly Report Dashboard", text: "Monitor FIR-to-chargesheet conversion and pending workload." },
  { route: "dcr", icon: "assets/vehicles.svg", title: "Saved DCR Drafts", text: "Continue incomplete daily cumulative reports." },
  { route: "mcr", icon: "assets/passport.svg", title: "Saved MCR Drafts", text: "Continue incomplete monthly cumulative reports." }
];

export function homeView() {
  return `<main id="app-content" class="page-content home-view page-width">
    <section class="page-intro"><h1>Daily & Monthly Cumulative Reports</h1><p>Mumbai Police reporting and monitoring services</p></section>
    <section class="service-grid" aria-label="Reporting services">
      ${services.map(s => `<a class="service-card" href="#/${s.route}"><img src="${s.icon}" alt=""><h2>${s.title}</h2><p>${s.text}</p></a>`).join("")}
    </section>
  </main>`;
}

