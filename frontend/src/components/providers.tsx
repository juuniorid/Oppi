'use client';

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
