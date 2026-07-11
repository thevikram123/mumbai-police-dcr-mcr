# Mumbai Police DCR & MCR Reporting App

A dependency-free, GitHub Pages-ready web application for daily and monthly cumulative reporting. The UI closely follows the visual language shown on the Mumbai Police public website: white utility header, accessibility controls, indigo navigation, thin bordered service panels, Nunito typography, and a floating emergency-call action.

## Features

- DCR and MCR intake forms with auto-filled jurisdiction fields
- FIR total validation and local draft persistence
- Daily and monthly dashboards using synthetic data
- Station selection, text-size controls, and high-contrast mode
- Hash routing that works reliably on GitHub Pages
- Official public Mumbai Police logo and service icons used as visual references

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
