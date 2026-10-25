# ⚡ Kynetic AI — Architectural Compute Frontend

> **Global Compute Intelligence Network (GCIN) Client Interface**  
> Pure React 19 + TypeScript + Vite application engineered with Monastic Brutalist aesthetics, pixel-level accuracy, and high-performance client-side routing.

---

## 🌟 Overview

The **Kynetic AI Frontend** is the user interface and mission control for the Global Compute Intelligence Network. It provides machine learning engineers, research labs, and compute-intensive businesses with declarative workload specification, real-time multi-cloud GPU arbitrage simulation, architectural strata introspection, and cohort onboarding.

The frontend is built with a single unified **Olive Green Brutalist** design system, featuring:
- **Primary Olive Brand Palette:** Deep forest tones (`#3E4736`), earthy olive accents (`#59664D`), and vibrant status indicators (`#84A96C`).
- **Warm Monastic Canvas:** High-contrast, glare-free warm stone backgrounds (`#FAF9F5` / `#F8F7F3`).
- **Crisp Typography:** Standardized on Google Fonts **Geist** (`font-display`), **Inter** (`font-sans`), and **JetBrains Mono** (`font-mono`).
- **Official Brand Mark:** Standardized exclusively on [`/public/assets/Kynetic AI Logo.png`](/assets/Kynetic%20AI%20Logo.png).

---

## 🧭 Routes & Screen Directory

| Route | Component | Description |
| :--- | :--- | :--- |
| `/` | [`HomePage.tsx`](src/pages/HomePage.tsx) | Flagship Desktop Homepage featuring the Hero, interactive planner preview, 4-stage pipeline, and declarative Python SDK panel. |
| `/dashboard` | [`DashboardPage.tsx`](src/pages/DashboardPage.tsx) | Mission Control Dashboard with 4 high-level telemetry cards, active execution matrix table, blueprint candidates, live 20Hz eBPF terminal log, and cluster health meter. |
| `/workload-planner` | [`WorkloadPlannerPage.tsx`](src/pages/WorkloadPlannerPage.tsx) | Full Interactive Workload Planner with blueprint presets, context token sliders, VRAM estimators, and 4-candidate dispatch matrix. |
| `/recommendations` | [`RecommendationsPage.tsx`](src/pages/RecommendationsPage.tsx) | Benchmark-Verified Compute Recommendations with ranked candidate cards (Ada L40S, H100 SXM5, A100, Grace Hopper), roofline efficiency, and comparative architecture matrix. |
| `/providers` | [`ProvidersPage.tsx`](src/pages/ProvidersPage.tsx) | Global Compute Providers Directory with architecture/interconnect/tier dropdown filters, quick slices, and deep provider audits (CoreWeave, RunPod, Lambda, Crusoe, Nebius). |
| `/architecture` | [`ArchitecturePage.tsx`](src/pages/ArchitecturePage.tsx) | Control Plane Strata Layers 01–04, live simulated telemetry trace logs, and zero-trust execution pillars. |
| `/docs` | [`DocsPage.tsx`](src/pages/DocsPage.tsx) | Developer documentation with interactive multi-language code switchers (Python SDK, CLI `kn`, and cURL REST). |
| `/early-access` | [`EarlyAccessPage.tsx`](src/pages/EarlyAccessPage.tsx) | Cohort 04 admissions portal with real-time cluster size selection, workload checklists, and broker telemetry well. |
| `/mobile` | [`MobileHomePage.tsx`](src/pages/MobileHomePage.tsx) | Dedicated 390px mobile viewport layout with compact cards, swipeable code blocks, and touch-optimized actions. |

---

## 🧩 Core Architecture & Components

- **[`src/components/Navbar.tsx`](src/components/Navbar.tsx):**
  - Sticky glassmorphic header with official brand mark (`/assets/Kynetic AI Logo.png`).
  - Active route indicators, responsive mobile drawer navigation, and early access trigger buttons.
- **[`src/components/Footer.tsx`](src/components/Footer.tsx):**
  - Modular footer supporting flagship 4-column brutalist layouts and clean editorial system-status modes.
- **[`src/components/EarlyAccessModal.tsx`](src/components/EarlyAccessModal.tsx):**
  - Global application modal accessible from anywhere in the application with simulated submission feedback.
- **[`src/App.tsx`](src/App.tsx):**
  - Client-side routing with `react-router-dom`, automatic scroll reset on navigation, and unified theme selection colors.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript (TSX)
- **Bundler & Dev Server:** Vite 6+
- **Styling:** Vanilla CSS + Tailwind CSS 3.4.17
- **Routing:** React Router v6 (`react-router-dom`)
- **Icons:** Google Material Symbols Outlined
- **Fonts:** Geist, Inter, JetBrains Mono

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or 20.x+
- npm or pnpm

### Installation
```bash
cd frontend
npm install
```

### Running Locally (Development)
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### Production Build & Type Verification
```bash
npm run build
```
Type checks (`tsc -b`) and compiles optimized static assets into `dist/` in under 400ms with zero errors.

### Preview Production Build
```bash
npm run preview
```
Previews the compiled production bundle at `http://localhost:4173`.
