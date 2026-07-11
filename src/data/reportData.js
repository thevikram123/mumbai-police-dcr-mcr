export const stations = [
  { name: "Azad Maidan", zone: "DCP Zone 1", division: "ACP Azad Maidan Division", total: 48, body: 12, other: 36, currentCs: 16, lastCs: 29, currentPending: 32, lastPending: 14 },
  { name: "Colaba", zone: "DCP Zone 1", division: "ACP Colaba Division", total: 42, body: 10, other: 32, currentCs: 14, lastCs: 25, currentPending: 28, lastPending: 12 },
  { name: "Marine Drive", zone: "DCP Zone 1", division: "ACP Colaba Division", total: 35, body: 8, other: 27, currentCs: 13, lastCs: 21, currentPending: 22, lastPending: 10 },
  { name: "D.B. Marg", zone: "DCP Zone 2", division: "ACP Girgaon Division", total: 56, body: 15, other: 41, currentCs: 20, lastCs: 33, currentPending: 36, lastPending: 18 },
  { name: "Bandra", zone: "DCP Zone 9", division: "ACP Bandra Division", total: 61, body: 17, other: 44, currentCs: 23, lastCs: 38, currentPending: 38, lastPending: 20 },
  { name: "Andheri", zone: "DCP Zone 10", division: "ACP Andheri Division", total: 73, body: 21, other: 52, currentCs: 26, lastCs: 45, currentPending: 47, lastPending: 24 }
];

export const dailyTrend = [
  { day: "04 Jul", body: 8, other: 23 }, { day: "05 Jul", body: 7, other: 20 },
  { day: "06 Jul", body: 10, other: 25 }, { day: "07 Jul", body: 12, other: 30 },
  { day: "08 Jul", body: 11, other: 28 }, { day: "09 Jul", body: 13, other: 31 },
  { day: "10 Jul", body: 14, other: 36 }
];

export const hierarchy = {
  state: "Maharashtra",
  range: "Greater Mumbai",
  unit: "Mumbai City Police"
};

export const totals = stations.reduce((a, s) => ({
  total: a.total + s.total,
  body: a.body + s.body,
  other: a.other + s.other,
  currentCs: a.currentCs + s.currentCs,
  lastCs: a.lastCs + s.lastCs,
  currentPending: a.currentPending + s.currentPending,
  lastPending: a.lastPending + s.lastPending
}), { total: 0, body: 0, other: 0, currentCs: 0, lastCs: 0, currentPending: 0, lastPending: 0 });

