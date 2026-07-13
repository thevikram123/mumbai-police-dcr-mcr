// State-level datasets from "updated data.xlsx" (deduplicated, figures rounded).

export const stateUnits = [
  { unit: "Nagpur City", fir: 34 }, { unit: "Pune City", fir: 12 }, { unit: "Mira Bhayendar City", fir: 45 },
  { unit: "Aurangabad City", fir: 88 }, { unit: "Mumbai City", fir: 54 }, { unit: "Nashik City", fir: 23 },
  { unit: "Pimpri Chinchwad City", fir: 23 }, { unit: "Solapur", fir: 67 }, { unit: "Amravati City", fir: 86 },
  { unit: "Navi Mumbai City", fir: 44 }, { unit: "Thane City", fir: 33 }, { unit: "Ahmednagar", fir: 77 },
  { unit: "Akola", fir: 55 }, { unit: "Amravati Rural", fir: 78 }, { unit: "Aurangabad Rural", fir: 56 },
  { unit: "Beed", fir: 34 }, { unit: "Bhnadara", fir: 23 }, { unit: "Buldhana", fir: 23 },
  { unit: "Chandrapur", fir: 67 }, { unit: "Dhule", fir: 89 }, { unit: "Gadchiroli", fir: 60 },
  { unit: "Gondia", fir: 61 }, { unit: "Hingoli", fir: 62 }, { unit: "Jalgao", fir: 62 },
  { unit: "Jalna", fir: 63 }, { unit: "Kolhapur", fir: 64 }, { unit: "Latur", fir: 65 },
  { unit: "Nagpur Rural", fir: 66 }, { unit: "Nanded", fir: 79 }, { unit: "Nandurbar", fir: 80 },
  { unit: "Nashik Rural", fir: 81 }, { unit: "Osmanabad", fir: 82 }, { unit: "Palghar", fir: 83 },
  { unit: "Parbhani", fir: 84 }, { unit: "Pune Rural", fir: 84 }, { unit: "Raigad", fir: 85 },
  { unit: "Ratnagiri", fir: 86 }, { unit: "Sangli", fir: 87 }, { unit: "Satara", fir: 88 },
  { unit: "Sindhadurg", fir: 89 }, { unit: "Solapur Rural", fir: 90 }, { unit: "Thane Rural", fir: 91 },
  { unit: "Wardha", fir: 91 }, { unit: "Washim", fir: 92 }, { unit: "Yavatmal", fir: 93 },
  { unit: "Pune Railway", fir: 94 }, { unit: "Mumbai Railway", fir: 95 }, { unit: "Nagpur Railway", fir: 96 },
  { unit: "Mumbai Railway Comm", fir: 97 }
];

export const offenceTypes = [
  { type: "Crime against Person", count: 23 },
  { type: "Crime against Women", count: 34 },
  { type: "Crime against Children", count: 12 },
  { type: "Property Crimes", count: 45 },
  { type: "Economic and Financial Crimes", count: 78 },
  { type: "Cyber Crimes", count: 43 },
  { type: "Organized Crime", count: 112 }
];

// Applications pendency rankings: the five best and five worst performing units.
export const applicationsPendingAction = {
  best: [
    { rank: 1, unit: "Nandurbar", total: 225, pending: 0 },
    { rank: 2, unit: "Railway Nagpur", total: 5, pending: 0 },
    { rank: 3, unit: "Solapur City", total: 755, pending: 1 },
    { rank: 4, unit: "Amravati City", total: 489, pending: 1 },
    { rank: 5, unit: "Nanded", total: 1294, pending: 7 }
  ],
  worst: [
    { rank: 42, unit: "Thane City", total: 106, pending: 52 },
    { rank: 43, unit: "Nagpur Rural", total: 346, pending: 187 },
    { rank: 44, unit: "Nagpur City", total: 20, pending: 11 },
    { rank: 45, unit: "Pune City", total: 69, pending: 67 },
    { rank: 46, unit: "Railway Mumbai", total: 36, pending: 36 }
  ]
};

export const applicationsPendingVisit = {
  best: [
    { rank: 1, unit: "Nandurbar", total: 225, pending: 0, percent: 0 },
    { rank: 2, unit: "Dhule", total: 62, pending: 0, percent: 0 },
    { rank: 3, unit: "Sindhudurg", total: 41, pending: 0, percent: 0 },
    { rank: 4, unit: "Railway Mumbai", total: 36, pending: 0, percent: 0 },
    { rank: 5, unit: "Parbhani", total: 15, pending: 0, percent: 0 }
  ],
  worst: [
    { rank: 42, unit: "Hingoli", total: 318, pending: 55, percent: 17.29 },
    { rank: 43, unit: "Akola", total: 364, pending: 70, percent: 19.23 },
    { rank: 44, unit: "Nashik City", total: 84, pending: 25, percent: 29.76 },
    { rank: 45, unit: "Thane City", total: 106, pending: 36, percent: 33.96 },
    { rank: 46, unit: "Railway Nagpur", total: 5, pending: 2, percent: 40 }
  ]
};

export const stateTotals = {
  totalFir: stateUnits.reduce((a, u) => a + u.fir, 0),
  totalOffences: offenceTypes.reduce((a, o) => a + o.count, 0),
  units: stateUnits.length
};
