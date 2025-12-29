import type { Config } from "tailwindcss";

// Ensure Tailwind scans the shared UI package so utility classes
// used inside `@auction-platform/ui` (e.g. Button paddings) are generated.
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        accent: "#FFD700",
        secondary: "#2E2E2E",
        background: "#F4F4F4",
        success: "#28A745",
        danger: "#DC3545",
      },
    },
  },
  // Tailwind v4: no safelist key; ensure classes appear via imports/usage in shared UI src/dist
} satisfies Config;
