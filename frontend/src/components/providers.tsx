'use client';

/**
 * Juurproviderid: MUI teema (`theme/theme.ts`) kehtib MUI komponentidele; lehe koor on
 * peamiselt Tailwind + `palette.json`. CssBaseline ühtlustab brauseri vaikimisi marginaale.
 */
import { appTheme } from '@/theme/theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
