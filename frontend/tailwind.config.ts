/**
 * Tailwind laiendab `theme.extend.colors` — klassid: `bg-canvas`, `text-ink`, jne.
 * Väärtused tulevad `src/theme/palette.json`-ist (üks tõde; ära kopeeri hex-e klassidesse).
 */
import type { Config } from 'tailwindcss';
import palette from './src/theme/palette.json';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // allikas: palette.json — JSON võti (nt accentTeal) → Tailwind klass `accent-teal`
        canvas: palette.canvas,
        surface: palette.surface,
        divider: palette.divider,
        primary: palette.primary,
        secondary: palette.secondary,
        'accent-teal': palette.accentTeal,
        'accent-sky': palette.accentSky,
        ink: palette.ink,
        mediumInk: palette.mediumInk,
        lightInk: palette.lightInk,
        'yellow-strong': palette.yellowStrong,
      },
    },
  },
  plugins: [],
};
export default config;
