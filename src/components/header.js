import { stations } from "../data/reportData.js";

export function header(activeRoute) {
  const route = activeRoute.replace("#/", "") || "home";
  const links = [
    ["home", "Home"], ["dcr", "Create DCR"], ["mcr", "Create MCR"],
    ["daily-dashboard", "Daily Dashboard"], ["monthly-dashboard", "Monthly Dashboard"], ["contact", "Contact Us"]
  ];
  return `
    <header class="site-header">
      <div class="utility-row page-width">
        <a class="brand-mark" href="#/home" aria-label="Mumbai Police reporting home">
          <img src="assets/mumbai-police-logo.png" alt="Mumbai Police emblem">
        </a>
        <div class="accessibility-controls" aria-label="Text size controls">
          <button type="button" data-font="small">A-</button><button type="button" data-font="normal">A</button><button type="button" data-font="large">A+</button><button class="contrast" type="button" data-contrast>A</button>
        </div>
        <label class="search-box"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search Here.." aria-label="Search"></label>
        <select class="station-select" aria-label="Select Police Station">
          <option value="">Select Police Station</option>${stations.map(s => `<option>${s.name}</option>`).join("")}
        </select>
        <button class="language-button" type="button">मराठी</button>
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
  const select = document.querySelector(".station-select");
  const saved = localStorage.getItem("mp-selected-station");
  if (select && saved) select.value = saved;
  select?.addEventListener("change", () => {
    localStorage.setItem("mp-selected-station", select.value);
    window.dispatchEvent(new CustomEvent("stationchange", { detail: select.value }));
  });
}

