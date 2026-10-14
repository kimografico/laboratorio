# Project Specification: Interactive Hero Backgrounds Library

## 1. Project Overview
A multi-purpose repository and visual showcase built with **Astro** and **React** to house, preview, and share interactive, mouse-reactive background components designed for hero sections. 

The core philosophy of this project is **maximum compatibility**: components are developed in React (`.tsx`) so they can be seamlessly embedded in both Astro sites and React-based frameworks (Next.js, Vite, etc.), while the showcase/library itself is powered by Astro for blazing-fast performance and clean content management.

---

## 2. Tech Stack & Tools
- **Framework:** Astro (latest version) with SSR or Static output.
- **UI Framework Integration:** `@astrojs/react` for React component rendering.
- **Styling:** Tailwind CSS for layout, styling, and UI elements of the showcase gallery.
- **Icons:** `lucide-react` for UI icons.
- **Language:** TypeScript (`.tsx` / `.ts`) for type safety and better developer experience.

---

## 3. Project Structure
```text
├── public/
├── src/
│   ├── components/
│   │   ├── backgrounds/         # React components (the actual interactive experiments)
│   │   │   ├── MouseTrail.tsx
│   │   │   ├── GridDistortion.tsx
│   │   │   └── ParticleWave.tsx
│   │   └── ui/                  # UI components for the gallery (Card, Navbar, CodeSnippet, etc.)
│   ├── content/
│   │   └── experiments/         # Markdown/JSON files for experiment metadata (title, description, tags)
│   │       ├── mouse-trail.md
│   │       └── grid-distortion.md
│   ├── layouts/
│   │   └── Layout.astro         # Main layout for the gallery
│   └── pages/
│       ├── index.astro          # Gallery grid homepage showing all experiments
│       └── experiment/
│           └── [id].astro       # Full-screen live preview & code details page for a specific experiment
├── astro.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 4. Key Features & Requirements

### A. The Interactive Backgrounds (`src/components/backgrounds/`)
- Must be written in React (`.tsx`) using standard hooks (`useEffect`, `useRef`, `useState`).
- Must handle mouse events (`onMouseMove`, window listeners) cleanly with proper cleanup to prevent memory leaks.
- Must be fully responsive (adapting to window resize and mobile viewports, disabling or fallback-mode if necessary).
- Must accept customizable props (e.g., color themes, particle speed, opacity, density) where applicable.

### B. The Showcase Gallery (`src/pages/index.astro`)
- A modern, clean dashboard or grid layout showcasing cards for each experiment.
- Each card should feature a mini live preview (or thumbnail) and tags (e.g., "Canvas", "DOM", "Mouse Tracking").
- Search or filter mechanism by technology/style.

### C. Detail & Preview Page (`src/pages/experiment/[id].astro`)
- Full-screen mode option to test the background in a realistic hero environment with dummy headline text and CTA buttons.
- A toggleable or collapsible drawer/panel showing:
  - Description and usage instructions.
  - Configurable controls (props playground if applicable).
  - Clean code snippet viewer to copy-paste the React component directly.

---

## 5. Getting Started / Implementation Steps for AI Coder
1. Initialize Astro project with Tailwind and React integrations.
2. Set up the folder architecture as defined in Section 3.
3. Create the base layout and design system (dark mode preferred for background experiments).
4. Migrate initial experimental components from Astro to React inside `src/components/backgrounds/`.
5. Implement the dynamic gallery route to list and preview them.