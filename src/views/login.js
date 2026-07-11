import { stations } from "../data/reportData.js";
import { loginStation, loginAdmin, STATION_PASSWORD, ADMIN_PASSWORD } from "../auth.js";

export function loginView() {
  const mode = sessionStorage.getItem("mp-login-mode") || "station";
  return `<main id="app-content" class="page-content page-width login-view">
    <div class="title-block"><h1>Reporting Portal Sign In</h1><p>Daily &amp; Monthly Cumulative Reports — Authorised access only</p><i></i></div>
    <section class="login-panel form-panel">
      <div class="login-tabs" role="tablist">
        <button type="button" role="tab" data-login-tab="station" aria-selected="${mode === "station"}" class="${mode === "station" ? "active" : ""}">Police Station Login</button>
        <button type="button" role="tab" data-login-tab="admin" aria-selected="${mode === "admin"}" class="${mode === "admin" ? "active" : ""}">Admin (HQ) Login</button>
      </div>
      <form class="login-form" data-login-form="${mode}">
        ${mode === "station" ? `
          <label class="form-field"><span>Police Station *</span>
            <select name="station" required>
              <option value="">Select your police station</option>
              ${stations.map(s => `<option value="${s.name}">${s.name} — ${s.zone}</option>`).join("")}
            </select>
          </label>` : `
          <label class="form-field"><span>Administrator Username *</span>
            <input name="username" type="text" autocomplete="username" placeholder="admin" required>
          </label>`}
        <label class="form-field"><span>Password *</span>
          <input name="password" type="password" autocomplete="current-password" placeholder="Enter password" required>
        </label>
        <p class="validation-message error" role="alert"></p>
        <button class="primary-button login-button" type="submit">${mode === "station" ? "Sign in to Station Console" : "Sign in to HQ Console"}</button>
      </form>
      <div class="login-hint">
        <strong>Demonstration credentials</strong>
        <span>Station: choose any station, password <code>${STATION_PASSWORD}</code></span>
        <span>Admin: username <code>admin</code>, password <code>${ADMIN_PASSWORD}</code></span>
      </div>
    </section>
    <p class="data-note">Station officers can file DCR/MCR for their own station. The admin console provides a read-only view across all police stations.</p>
  </main>`;
}

export function bindLogin() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;
  document.querySelectorAll("[data-login-tab]").forEach(tab => tab.addEventListener("click", () => {
    sessionStorage.setItem("mp-login-mode", tab.dataset.loginTab);
    window.dispatchEvent(new CustomEvent("rerender"));
  }));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const result = form.dataset.loginForm === "station"
      ? loginStation(values.station, values.password)
      : loginAdmin(values.username || "", values.password);
    if (!result.ok) {
      form.querySelector(".validation-message").textContent = result.error;
      return;
    }
    location.hash = "#/home";
    window.dispatchEvent(new CustomEvent("rerender"));
  });
}
