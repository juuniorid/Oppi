// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#f59e0b',
    },
    background: {
      default: '#f7f4ea',
      paper: '#fffdf7',
    },
    text: {
      primary: '#1f2937',
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
