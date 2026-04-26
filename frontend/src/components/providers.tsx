'use client';

/**
 * Juurproviderid: MUI teema (`theme/theme.ts`) kehtib MUI komponentidele; lehe koor on
 * peamiselt Tailwind + `palette.json`. CssBaseline ühtlustab brauseri vaikimisi marginaale.
 */
import { appTheme } from '@/theme/theme';
import { AuthProvider } from '@/context/AuthContext';
import { ChildSelectionProvider } from '@/context/ChildSelectionContext';
import { UserRoleProvider } from '@/context/UserRoleContext';
import { ErrorToaster } from '@/components/ErrorToast';
import { CssBaseline, ThemeProvider } from '@mui/material';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <UserRoleProvider>
          <ChildSelectionProvider>{children}</ChildSelectionProvider>
        </UserRoleProvider>
      </AuthProvider>
      <ErrorToaster />
    </ThemeProvider>
  );
}
