const KEY = "mp-report-submissions";

export function getSubmissions() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function addSubmission({ type, station, zone, division, period, values, submittedBy }) {
  const submissions = getSubmissions();
  const id = `${type}-${Date.now().toString(36).toUpperCase()}`;
  const entry = { id, type, station, zone, division, period, values, submittedBy, submittedAt: new Date().toISOString() };
  submissions.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(submissions));
  return entry;
}

export function latestSubmissionFor(type, stationName) {
  return getSubmissions().find(s => s.type === type && s.station === stationName) || null;
}

export function submissionsFor(stationName) {
  return getSubmissions().filter(s => s.station === stationName);
}

export function mergedStationFigures(type, seedStations) {
  return seedStations.map(seed => {
    const latest = latestSubmissionFor(type, seed.name);
    if (!latest) return { ...seed, submitted: false };
    const v = Object.fromEntries(Object.entries(latest.values).map(([k, val]) => [k, Number(val)]));
    return { ...seed, ...v, submitted: true, submittedAt: latest.submittedAt, period: latest.period };
  });
}
