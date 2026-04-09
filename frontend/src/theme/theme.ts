/**
 * MUI (`@mui/material`) teema — kasutatakse MUI komponentidega (nupud, kaardid, Avatar jne).
 *
 * Oluline: Tailwindi tokenid (`bg-canvas`, `bg-primary`, …) tulevad `palette.json`-ist
 * (`tailwind.config.ts`), mitte siit. Värvid peaksid olema sama mõttega kui paletis, aga
 * MUI kasutab oma nimetusi:
 * - `palette.primary` — vaikimisi tume tekst / contained nupu taust (ei ole kollane!)
 * - `palette.secondary` — kollane brändiaktsent (mockupi kollane); `color="secondary"` MUI-s
 * - `background.default` — sama mõte mis Tailwind `canvas`
 * - `background.paper` — valge pinnad (kaardid)
 */
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#2C2C2C', // tume; kollase CTA jaoks kasuta `color="secondary"` või custom
    },
    secondary: {
      main: '#F7D372', // kollane aktsent — ühtib `palette.json` → `primary`
    },
    background: {
      default: '#FDF8F3', // ühtib Tailwind `bg-canvas`
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C2C2C', // ühtib Tailwind `text-ink`
    },
  },
  typography: {
    fontFamily: '"Instrument Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          borderRadius: '1rem',
          paddingInline: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});
