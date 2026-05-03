'use client';

/**
 * App-level providers:
 * - MUI ThemeProvider/CssBaseline for component theming and baseline styles
 * - Auth/UserRole/ChildSelection contexts for authenticated app state
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
