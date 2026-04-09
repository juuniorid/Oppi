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
import { alpha, createTheme, darken, type Theme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import palette from './palette.json';

const THEME_COLORS = {
  primaryMain: palette.ink,
  primaryDark: darken(palette.ink, 0.15),
  secondaryMain: palette.primary,
  backgroundDefault: palette.canvas,
  backgroundPaper: palette.paper,
  textPrimary: palette.ink,
  successMain: palette.success,
  successDark: darken(palette.success, 0.1),
  errorMain: palette.error,
  errorDark: darken(palette.error, 0.1),
  neutralMain: palette.primary,
  neutralDark: darken(palette.primary, 0.1),
  warningMain: palette.yellowStrong,
  infoMain: palette.accentSky,
  infoDark: darken(palette.accentSky, 0.1),
} as const;

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    success: true;
    neutral: true;
    negative: true;
    info: true;
  }
}

export const appTheme = createTheme({
  palette: {
    primary: {
      main: THEME_COLORS.primaryMain, // tume; kollase CTA jaoks kasuta `color="secondary"` või custom
      dark: THEME_COLORS.primaryDark,
    },
    secondary: {
      main: THEME_COLORS.secondaryMain, // kollane aktsent — ühtib `palette.json` → `primary`
    },
    background: {
      default: THEME_COLORS.backgroundDefault, // ühtib Tailwind `bg-canvas`
      paper: THEME_COLORS.backgroundPaper,
    },
    text: {
      primary: THEME_COLORS.textPrimary, // ühtib Tailwind `text-ink`
    },
    success: {
      main: THEME_COLORS.successMain,
      dark: THEME_COLORS.successDark,
    },
    error: {
      main: THEME_COLORS.errorMain,
      dark: THEME_COLORS.errorDark,
    },
    warning: {
      main: THEME_COLORS.warningMain,
    },
    info: {
      main: THEME_COLORS.infoMain,
    }

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
    MuiPickerDay: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: '6px',
          '&.Mui-selected': {
            outline: `1px solid ${theme.palette.secondary.main}`,
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
          },
          '&.Mui-selected:hover, &.Mui-selected:focus': {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
        }),
        today: ({ theme }: { theme: Theme }) => ({
          outline: 'transparent',
          backgroundColor: theme.palette.background.default,

        }),
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      variants: [
        {
          props: { variant: 'success' },
          style: {
            backgroundColor: THEME_COLORS.successMain,
            color: THEME_COLORS.backgroundPaper,
            border: 'none',
            '&:hover': {
              backgroundColor: THEME_COLORS.successDark,
              border: 'none',
            },
          },
        },
        {
          props: { variant: 'neutral' },
          style: {
            backgroundColor: THEME_COLORS.neutralMain,
            color: THEME_COLORS.textPrimary,
            border: 'none',
            '&:hover': {
              backgroundColor: THEME_COLORS.neutralDark,
              border: 'none',
            },
          },
        },
        {
          props: { variant: 'negative' },
          style: {
            backgroundColor: THEME_COLORS.errorMain,
            color: THEME_COLORS.backgroundPaper,
            border: 'none',
            '&:hover': {
              backgroundColor: THEME_COLORS.errorDark,
              border: 'none',
            },
          },
        },
        {
          props: { variant: 'info' },
          style: {
            backgroundColor: THEME_COLORS.infoMain,
            color: THEME_COLORS.textPrimary,
            border: 'none',
            '&:hover': {
              backgroundColor: THEME_COLORS.infoDark,
              border: 'none',
            },
          },
        },
      ],
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: '1rem',
          paddingInline: '1rem',
          fontWeight: 700,
          border: 'none',
          boxShadow: 'none',
          '&:hover': {
            border: 'none',
            boxShadow: 'none',
          },
          '&.MuiButton-outlined': {
            border: 'none',
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '& .MuiInputBase-root': {
            backgroundColor: theme.palette.background.paper,
            borderRadius: 12,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.text.primary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
          '&.Mui-error': {
            color: theme.palette.error.main,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: 12,
          color: theme.palette.text.primary,
          '& .MuiInputBase-input, & .MuiSelect-select': {
            backgroundColor: 'transparent',
          },
          '& input:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
            WebkitTextFillColor: theme.palette.text.primary,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.28),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.text.primary, 0.5),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.warning.main,
            borderWidth: 2,
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.38),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.5),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.62),
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: 20,
          padding: 20,
          backgroundColor: alpha(theme.palette.background.paper, 0.36),
          boxShadow: '0 8px 20px rgba(44, 44, 44, 0.06)',
          transition: 'box-shadow 160ms ease, transform 160ms ease',
          '&:hover': {
            boxShadow: '0 10px 24px rgba(44, 44, 44, 0.09)',
            transform: 'translateY(-1px)',
          },
          '&.MuiCard-outlined': {
            borderColor: alpha(theme.palette.text.primary, 0.12),
          },
        }),
      },
    },
  },
});
