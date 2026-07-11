import { header, bindHeader } from "./components/header.js";
import { homeView } from "./views/home.js";
import { reportFormView, bindReportForm } from "./views/reportForm.js";
import { dashboardView } from "./views/dashboard.js";

const routes = {
  "#/home": homeView,
  "#/dcr": () => reportFormView("DCR"),
  "#/mcr": () => reportFormView("MCR"),
  "#/daily-dashboard": () => dashboardView("daily"),
  "#/monthly-dashboard": () => dashboardView("monthly"),
  "#/contact": () => `<main id="app-content" class="page-content page-width"><div class="title-block"><h1>Contact Us</h1><p>Control Room: 100</p><i></i></div><section class="form-panel contact-panel"><h2>Greater Mumbai Police</h2><p>For emergencies, dial 100. This demonstration application does not send reports to police systems.</p></section></main>`
};

function render() {
  const route = routes[location.hash] ? location.hash : "#/home";
  document.getElementById("app").innerHTML = `${header(route)}${routes[route]()}<a class="phone-button" href="tel:100" aria-label="Call police emergency number 100">☎</a><footer><div class="page-width">Copyright © 2026 Mumbai Police Reporting Demo <span>Control Room: 100</span></div></footer>`;
  bindHeader();
  bindReportForm();
}

window.addEventListener("hashchange", render);
window.addEventListener("stationchange", render);
render();

