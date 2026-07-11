# Mumbai Police DCR & MCR Reporting App

A dependency-free, GitHub Pages-ready web application for daily and monthly cumulative reporting. The UI closely follows the visual language shown on the Mumbai Police public website: white utility header, accessibility controls, indigo navigation, thin bordered service panels, Nunito typography, and a floating emergency-call action.

## Features

- Role-based sign in: per-police-station consoles and a master admin (HQ) console
- Step-by-step DCR/MCR filing wizard: Jurisdiction → Report Figures → Review & Submit, with live FIR tally validation, draft persistence, and a submission receipt with reference number
- Submissions persist locally and flow into the dashboards; the admin view shows per-station submitted/awaiting status
- Interactive SVG dashboards: hover tooltips, animated bars and donuts, sortable tables, role-scoped data (station sees its own figures, admin sees all stations)
- Submission register with full audit trail of filed reports
- Formatted PDF downloads: individual DCR/MCR reports (letterhead, jurisdiction and figures tables, signature block) and full dashboard exports, from the receipt screen, the register, and both dashboards
- "Ask the Assistant" page: plain-language Q&A over the portal dataset, powered by Gemini through a Cloudflare Worker (see `worker/README.md` for the 5-minute setup; the API key stays in the Worker)
- Text-size controls and high-contrast mode
- Hash routing that works reliably on GitHub Pages
- Official public Mumbai Police logo and service icons used as visual references

## Demo credentials

- **Station login:** choose any police station, password `station@123`
- **Admin login:** username `admin`, password `admin@123`

## Run locally

```bash
npm run dev
```

Open `http://127.0.0.1:4173`.

## Validate

```bash
npm run check
```

The data is synthetic and the application is a design/engineering demonstration. It is not connected to a police production system.
