import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Scan shared UI source and built dist so classnames inside package are generated
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
