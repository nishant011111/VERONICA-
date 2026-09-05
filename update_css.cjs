const fs = require('fs');

const css = `
@import "tailwindcss";

@theme {
  --color-indigo-50: var(--theme-50);
  --color-indigo-100: var(--theme-100);
  --color-indigo-200: var(--theme-200);
  --color-indigo-300: var(--theme-300);
  --color-indigo-400: var(--theme-400);
  --color-indigo-500: var(--theme-500);
  --color-indigo-600: var(--theme-600);
  --color-indigo-700: var(--theme-700);
  --color-indigo-800: var(--theme-800);
  --color-indigo-900: var(--theme-900);
  --color-indigo-950: var(--theme-950);
}

@layer base {
  :root {
    --bg-primary: #f8fafc;
    --bg-surface: #ffffff;
    --bg-glass: rgba(255, 255, 255, 0.9);
    --border-subtle: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --accent: var(--theme-600);
    --accent-glow: color-mix(in srgb, var(--theme-600) 15%, transparent);
    
    /* Default to Indigo */
    --theme-50: #eef2ff;
    --theme-100: #e0e7ff;
    --theme-200: #c7d2fe;
    --theme-300: #a5b4fc;
    --theme-400: #818cf8;
    --theme-500: #6366f1;
    --theme-600: #4f46e5;
    --theme-700: #4338ca;
    --theme-800: #3730a3;
    --theme-900: #312e81;
    --theme-950: #1e1b4b;
  }

  :root.theme-emerald {
    --theme-50: #ecfdf5;
    --theme-100: #d1fae5;
    --theme-200: #a7f3d0;
    --theme-300: #6ee7b7;
    --theme-400: #34d399;
    --theme-500: #10b981;
    --theme-600: #059669;
    --theme-700: #047857;
    --theme-800: #065f46;
    --theme-900: #064e3b;
    --theme-950: #022c22;
  }

  :root.theme-rose {
    --theme-50: #fff1f2;
    --theme-100: #ffe4e6;
    --theme-200: #fecdd3;
    --theme-300: #fda4af;
    --theme-400: #fb7185;
    --theme-500: #f43f5e;
    --theme-600: #e11d48;
    --theme-700: #be123c;
    --theme-800: #9f1239;
    --theme-900: #881337;
    --theme-950: #4c0519;
  }

  :root.theme-amber {
    --theme-50: #fffbeb;
    --theme-100: #fef3c7;
    --theme-200: #fde68a;
    --theme-300: #fcd34d;
    --theme-400: #fbbf24;
    --theme-500: #f59e0b;
    --theme-600: #d97706;
    --theme-700: #b45309;
    --theme-800: #92400e;
    --theme-900: #78350f;
    --theme-950: #451a03;
  }

  :root.theme-blue {
    --theme-50: #eff6ff;
    --theme-100: #dbeafe;
    --theme-200: #bfdbfe;
    --theme-300: #93c5fd;
    --theme-400: #60a5fa;
    --theme-500: #3b82f6;
    --theme-600: #2563eb;
    --theme-700: #1d4ed8;
    --theme-800: #1e40af;
    --theme-900: #1e3a8a;
    --theme-950: #172554;
  }

  .dark {
    --bg-primary: #050505;
    --bg-surface: #0a0a0a;
    --bg-glass: rgba(10, 10, 10, 0.85);
    --border-subtle: #1a1a1a;
    --text-main: #e0e0e0;
    --text-muted: #9ca3af;
    --accent: var(--theme-400);
    --accent-glow: color-mix(in srgb, var(--theme-400) 20%, transparent);
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.25);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.4);
}

/* Soft glass card & panel styling */
.glass-panel {
  background-color: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
}
.subtle-border {
  border-color: var(--border-subtle);
}

/* Bold Typography Theme Accents */
.accent-underline {
  text-decoration-line: underline;
  text-decoration-color: var(--theme-800);
  text-underline-offset: 8px;
}
.label-uppercase {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
}
.section-header-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #6b7280;
}
/* Background grid pattern */
.bg-grid-pattern {
  background-size: 24px 24px;
  background-image: 
    linear-gradient(to right, rgba(156, 163, 175, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(156, 163, 175, 0.04) 1px, transparent 1px);
}
`;

fs.writeFileSync('src/index.css', css);
console.log("Updated index.css");
