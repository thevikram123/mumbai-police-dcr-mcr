import { getSession, logout } from "../auth.js";

export function header(activeRoute) {
  const route = activeRoute.replace("#/", "") || "home";
  const session = getSession();
  const links = !session ? [["login", "Sign In"], ["contact", "Contact Us"]]
    : session.role === "admin"
      ? [["home", "Home"], ["daily-dashboard", "Daily Dashboard"], ["monthly-dashboard", "Monthly Dashboard"], ["state-overview", "State Overview"], ["submissions", "Submission Register"], ["assistant", "Assistant"]]
      : [["home", "Home"], ["dcr", "Create DCR"], ["mcr", "Create MCR"], ["daily-dashboard", "Daily Dashboard"], ["monthly-dashboard", "Monthly Dashboard"], ["submissions", "My Submissions"], ["assistant", "Assistant"]];
  const identity = !session ? "" : `
    <div class="identity-badge">
      <span class="identity-role">${session.role === "admin" ? "HQ Administrator" : "Station Console"}</span>
      <strong>${session.role === "admin" ? "All Police Stations" : session.station}</strong>
    </div>
    <button class="language-button logout-button" type="button" data-logout>Logout</button>`;
  return `
    <header class="site-header">
      <div class="utility-row page-width ${session ? "signed-in" : ""}">
        <a class="brand-mark" href="#/home" aria-label="Mumbai Police reporting home">
          <img src="assets/mumbai-police-logo.png" alt="Mumbai Police emblem">
        </a>
        <div class="accessibility-controls" aria-label="Text size controls">
          <button type="button" data-font="small">A-</button><button type="button" data-font="normal">A</button><button type="button" data-font="large">A+</button><button class="contrast" type="button" data-contrast>A</button>
        </div>
        <div class="header-title"><strong>Mumbai Police</strong><span>DCR &amp; MCR Reporting Portal</span></div>
        ${identity || `<button class="language-button" type="button">मराठी</button>`}
      </div>
      <nav class="main-nav" aria-label="Primary navigation"><div class="page-width nav-inner">
        ${links.map(([r, label]) => `<a class="${route === r ? "active" : ""}" href="#/${r}">${label}</a>`).join("")}
      </div></nav>
    </header>`;
}

export function bindHeader() {
  document.querySelectorAll("[data-font]").forEach(button => button.addEventListener("click", () => {
    document.documentElement.dataset.font = button.dataset.font;
  }));
  document.querySelector("[data-contrast]")?.addEventListener("click", () => document.body.classList.toggle("high-contrast"));
  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    logout();
    location.hash = "#/login";
    window.dispatchEvent(new CustomEvent("rerender"));
  });
}
