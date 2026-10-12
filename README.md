# Companio End-to-End — Dashboard Scaffold

**The starting scaffold for a second, full-stack version of Companio: a React and TypeScript admin-dashboard shell with placeholder pages, plus empty folders reserved for the AI and backend parts.**

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=reactrouter&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)

## Overview

Companio is my student-companion project. The first generation, in the `Companio` repo, is a single Flask file that does emotion detection and career recommendations behind a plain HTML chat page. This repo is the planned second generation, laid out as a proper app with `frontend/`, `backend/`, `ai/` and `docs/` folders.

Status: early scaffold only. Only the frontend contains code, and that code is a template: the sidebar items are called "Feature 1" and "Feature 2", each page shows eight cards named "Sub Feature 1" to "Sub Feature 8", and each card opens a page that says to add the real work there. The `backend/` and `ai/` folders contain only `.gitkeep` files, `docs/architecture.md` and `docs/api-contracts.md` are empty, and the root `README.md` and `.gitignore` are empty. There is no connection to the Flask chatbot, no API calls and no data.

## Key Features

What exists in the code:

- **Layout shell** — `Layout.tsx` combines a collapsible `Sidebar` (logo "AI Companio", two nav links, a placeholder user block) and a `TopNavbar`.
- **Top bar** — a search box that only logs the query to the console, a notification bell with a hard-coded badge of 3, and a light/dark toggle that adds a `dark-mode` class to the document and remembers the choice in `localStorage`.
- **Routing** — React Router redirects `/` to `/feature1`, with routes `/feature1`, `/feature2` and `/:feature/:subFeatureId`.
- **Reusable card and detail page** — `SubFeatureCard` builds a slug from its title and navigates to it; `SubFeaturePage` turns the slug back into a title and shows a placeholder with a back button.
- **Tooling** — TypeScript strict build step, ESLint config, Prettier config and VS Code settings under `frontend/`.

## How It Works

`src/main.tsx` renders `App`, which wraps the routes in `Layout`. `Feature1Page` and `Feature2Page` each hold an array of eight card definitions (title, description, lucide icon) and map them to `SubFeatureCard` components. Clicking a card calls `navigate('/<feature>/<slug>')` and `SubFeaturePage` reads the `subFeatureId` route parameter. All text is static.

The plan implied by the folder names is that `Feature 1` and `Feature 2` become real Companio features backed by `backend/` and `ai/`. None of that is decided or written in this repo.

## Tech Stack

- **Frontend:** React 18, TypeScript 5, Vite 5, React Router 6, lucide-react icons
- **Tooling:** ESLint with the TypeScript and React hooks plugins, Prettier
- **Not started:** backend, AI/ML service, database, tests

## Getting Started

### Prerequisites
- Node.js and npm

### Installation and running
```bash
git clone https://github.com/Danushika06/Companio_endToEnd.git
cd Companio_endToEnd/frontend
npm install
npm run dev
```
The dev server runs on http://localhost:5173 and opens a browser tab. On Windows, `frontend/setup.bat` runs `npm install` and prints the same next steps; it mentions `QUICKSTART.md` and `CONTRIBUTING.md`, which are not in the repo.

### Scripts
```bash
npm run build    # tsc -b && vite build
npm run preview  # preview the production build
npm run lint     # eslint, zero warnings allowed
```

## Usage

Open the app, switch between Feature 1 and Feature 2 in the sidebar, click a card to see its placeholder page, and use the moon/sun button to toggle dark mode.

## Project Structure

```
Companio_endToEnd/
├── frontend/
│   ├── src/
│   │   ├── main.tsx, App.tsx       # entry point and routes
│   │   ├── components/             # Layout, Sidebar, TopNavbar, SubFeatureCard (with CSS)
│   │   └── pages/                  # Feature1Page, Feature2Page, SubFeaturePage
│   ├── package.json, vite.config.ts, tsconfig*.json
│   ├── .eslintrc.cjs, .prettierrc, .vscode/
│   └── setup.bat                   # Windows install helper
├── backend/                        # empty (.gitkeep)
├── ai/                             # empty (.gitkeep)
└── docs/                           # architecture.md and api-contracts.md, both empty
```

---

## Contact

<table>
  <tr><td><b>GitHub:</b> <a href="https://github.com/Danushika06">Danushika06</a></td><td><b>LinkedIn:</b> <a href="https://www.linkedin.com/in/danushika-n-323b4628b/">danushika-n</a></td></tr>
  <tr><td colspan="2" align="center"><b>Email:</b> <a href="mailto:danushikanagarajan@gmail.com">danushikanagarajan@gmail.com</a></td></tr>
</table>

Built by **Danushika N**
