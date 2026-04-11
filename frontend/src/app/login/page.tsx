'use client';

import { Box, Button, Card, CardContent, Typography, Divider } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import authService from '@/services/auth.service';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f7f4ea 0%, #fffdf7 50%, #fef3c7 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          mx: 2,
          textAlign: 'center',
          px: 4,
          py: 5,
        }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h1"
            sx={{ fontSize: '2.5rem', fontWeight: 700, color: 'text.primary' }}
          >
            Oppi
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Kindergarten communication platform
          </Typography>

          <Divider sx={{ width: '100%', my: 1 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Sign in to access your dashboard
          </Typography>

          <Button
            onClick={handleGoogleLogin}
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            sx={{
              width: '100%',
              py: 1.5,
              borderColor: '#dadce0',
              color: 'text.primary',
              backgroundColor: '#fff',
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#bdc1c6',
              },
            }}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
