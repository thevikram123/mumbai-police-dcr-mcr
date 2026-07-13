import { header, bindHeader } from "./components/header.js";
import { homeView } from "./views/home.js";
import { loginView, bindLogin } from "./views/login.js";
import { reportFormView, bindReportForm } from "./views/reportForm.js";
import { dashboardView, bindDashboard } from "./views/dashboard.js";
import { submissionsView, bindSubmissions } from "./views/submissions.js";
import { stateOverviewView, bindStateOverview } from "./views/stateOverview.js";
import { assistantView, bindAssistant } from "./views/assistant.js";
import { getSession } from "./auth.js";

const routes = {
  "#/login": { view: loginView, public: true },
  "#/home": { view: homeView },
  "#/dcr": { view: () => reportFormView("DCR"), stationOnly: true },
  "#/mcr": { view: () => reportFormView("MCR"), stationOnly: true },
  "#/daily-dashboard": { view: () => dashboardView("daily") },
  "#/monthly-dashboard": { view: () => dashboardView("monthly") },
  "#/submissions": { view: submissionsView },
  "#/state-overview": { view: stateOverviewView, adminOnly: true },
  "#/assistant": { view: assistantView },
  "#/contact": {
    public: true,
    view: () => `<main id="app-content" class="page-content page-width"><div class="title-block"><h1>Contact Us</h1><p>Control Room: 100</p><i></i></div><section class="form-panel contact-panel"><h2>Greater Mumbai Police</h2><p>For emergencies, dial 100. This demonstration application does not send reports to police systems.</p></section></main>`
  }
};

function resolveRoute() {
  const session = getSession();
  const route = routes[location.hash] ? location.hash : (session ? "#/home" : "#/login");
  const def = routes[route];
  if (!def.public && !session) return "#/login";
  if (route === "#/login" && session) return "#/home";
  if (def.stationOnly && session?.role === "admin") return "#/daily-dashboard";
  if (def.adminOnly && session?.role !== "admin") return "#/home";
  return route;
}

function render() {
  const route = resolveRoute();
  if (location.hash !== route) { history.replaceState(null, "", route); }
  document.getElementById("app").innerHTML = `${header(route)}${routes[route].view()}<a class="phone-button" href="tel:100" aria-label="Call police emergency number 100">☎</a>${footer()}`;
  bindHeader();
  bindLogin();
  bindReportForm();
  bindDashboard();
  bindSubmissions();
  bindStateOverview();
  bindAssistant();
  window.scrollTo(0, 0);
}

function footer() {
  const session = getSession();
  const serviceLinks = !session ? `<a href="#/login">Sign In</a>`
    : session.role === "admin"
      ? `<a href="#/daily-dashboard">Daily Dashboard</a><a href="#/monthly-dashboard">Monthly Dashboard</a><a href="#/submissions">Submission Register</a>`
      : `<a href="#/dcr">Create DCR</a><a href="#/mcr">Create MCR</a><a href="#/daily-dashboard">Daily Dashboard</a><a href="#/monthly-dashboard">Monthly Dashboard</a>`;
  return `<footer class="site-footer"><div class="page-width">
    <div class="footer-columns">
      <section><h2>Mumbai Police</h2><p>Taking stock of your security round the clock. Help us to help you.</p></section>
      <section><h2>Reporting Services</h2>${serviceLinks}</section>
      <section><h2>Quick Links</h2><a href="#/home">Home</a><a href="#/contact">Contact Us</a><a href="tel:100">Emergency Contact</a></section>
    </div>
    <div class="helplines"><span>Traffic WhatsApp Helpline: 8454999999</span><span>Citizen Wall: 103</span><span>Control Room: 100</span><span>Elder Line: 1090</span></div>
    <div class="copyright"><span>Copyright © 2026 Greater Mumbai Police Reporting Demo</span><span>Last updated: 11-Jul-2026</span></div>
  </div></footer>`;
}

window.addEventListener("hashchange", render);
window.addEventListener("rerender", render);
render();
