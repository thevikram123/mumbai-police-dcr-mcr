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
  document.getElementById("app").innerHTML = `${header(route)}${routes[route]()}<a class="phone-button" href="tel:100" aria-label="Call police emergency number 100">☎</a>${footer()}`;
  bindHeader();
  bindReportForm();
}

function footer() {
  return `<footer class="site-footer"><div class="page-width">
    <div class="footer-columns">
      <section><h2>Mumbai Police</h2><p>Taking stock of your security round the clock. Help us to help you.</p></section>
      <section><h2>Citizen Services</h2><a href="#/dcr">Create DCR</a><a href="#/mcr">Create MCR</a><a href="#/daily-dashboard">Daily Dashboard</a><a href="#/monthly-dashboard">Monthly Dashboard</a></section>
      <section><h2>Quick Links</h2><a href="#/home">Home</a><a href="#/contact">Contact Us</a><a href="tel:100">Emergency Contact</a></section>
    </div>
    <div class="helplines"><span>Traffic WhatsApp Helpline: 8454999999</span><span>Citizen Wall: 103</span><span>Control Room: 100</span><span>Elder Line: 1090</span></div>
    <div class="copyright"><span>Copyright © 2026 Greater Mumbai Police Reporting Demo</span><span>Last updated: 11-Jul-2026</span></div>
  </div></footer>`;
}

window.addEventListener("hashchange", render);
window.addEventListener("stationchange", render);
render();
