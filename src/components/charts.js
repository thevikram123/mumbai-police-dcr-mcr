const esc = value => String(value).replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function groupedBarChart({ data, seriesLabels, colors = ["var(--police)", "#c9cdea"] }) {
  const width = 640, height = 260, pad = { top: 16, right: 12, bottom: 34, left: 40 };
  const plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.flatMap(d => d.values));
  const niceMax = Math.ceil(max / 10) * 10;
  const groupW = plotW / data.length;
  const barW = Math.min(26, groupW * 0.28);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(niceMax * t));
  const y = v => pad.top + plotH - (v / niceMax) * plotH;
  const grid = ticks.map(t => `
    <line x1="${pad.left}" x2="${width - pad.right}" y1="${y(t)}" y2="${y(t)}" stroke="#e7e7ec" stroke-width="1"/>
    <text x="${pad.left - 8}" y="${y(t) + 4}" text-anchor="end" class="chart-axis">${t}</text>`).join("");
  const bars = data.map((d, i) => {
    const cx = pad.left + groupW * i + groupW / 2;
    const tip = `${d.label} — ${seriesLabels.map((s, j) => `${s}: ${d.values[j]}`).join(", ")}`;
    return `<g class="bar-hover" data-tip="${esc(tip)}">
      <rect x="${pad.left + groupW * i + 2}" y="${pad.top}" width="${groupW - 4}" height="${plotH}" fill="transparent"/>
      ${d.values.map((v, j) => `<rect class="chart-bar" x="${cx - barW + j * (barW + 4) - 2}" y="${y(v)}" width="${barW}" height="${Math.max(2, plotH - (y(v) - pad.top))}" fill="${colors[j]}" rx="1.5"/>`).join("")}
      <text x="${cx}" y="${height - 12}" text-anchor="middle" class="chart-axis">${d.label}</text>
    </g>`;
  }).join("");
  return `<svg class="svg-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Bar chart">
    ${grid}
    <line x1="${pad.left}" x2="${pad.left}" y1="${pad.top}" y2="${pad.top + plotH}" stroke="#c9c9cf"/>
    <line x1="${pad.left}" x2="${width - pad.right}" y1="${pad.top + plotH}" y2="${pad.top + plotH}" stroke="#c9c9cf"/>
    ${bars}
  </svg>`;
}

export function donutChart({ segments, centerValue, centerLabel }) {
  const size = 210, r = 78, cx = size / 2, cy = size / 2, stroke = 30;
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(s => {
    const fraction = s.value / total;
    const arc = `<circle class="donut-seg" data-tip="${esc(`${s.label}: ${s.value} (${Math.round(fraction * 100)}%)`)}"
      cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}"
      stroke-dasharray="${fraction * circumference} ${circumference}"
      stroke-dashoffset="${-offset * circumference}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += fraction;
    return arc;
  }).join("");
  return `<svg class="svg-chart donut-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Composition chart">
    ${arcs}
    <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-value">${centerValue}</text>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" class="donut-label">${centerLabel}</text>
  </svg>`;
}

export function bindChartTooltips(root = document) {
  root.querySelectorAll(".data-panel").forEach(panel => {
    let tip = panel.querySelector(".chart-tip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "chart-tip";
      panel.appendChild(tip);
    }
    panel.addEventListener("mousemove", event => {
      const target = event.target.closest("[data-tip]");
      if (!target) { tip.classList.remove("visible"); return; }
      const rect = panel.getBoundingClientRect();
      tip.textContent = target.dataset.tip;
      tip.classList.add("visible");
      tip.style.left = `${Math.min(event.clientX - rect.left + 14, rect.width - tip.offsetWidth - 8)}px`;
      tip.style.top = `${event.clientY - rect.top - 34}px`;
    });
    panel.addEventListener("mouseleave", () => tip.classList.remove("visible"));
  });
}
