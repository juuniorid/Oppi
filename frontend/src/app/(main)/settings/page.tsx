'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/auth.service';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';

const PROFILE_PICTURE_STORAGE_KEY = 'oppi.profile_picture';

export default function SettingsPage() {
  const { user, loading: authLoading, refetchUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Pre-fill form fields from the latest authenticated profile.
    if (!user) {
      return;
    }
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPhone(user.phone ?? '');
  }, [user]);

  useEffect(() => {
    // Temporary client-side avatar persistence until backend file storage is added.
    const saved = window.localStorage.getItem(PROFILE_PICTURE_STORAGE_KEY);
    if (saved) {
      setAvatarPreview(saved);
    }
  }, []);

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showErrorToast('Palun vali pildifail.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast('Pildi maksimaalne suurus on 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        showErrorToast('Pildi laadimine ebaõnnestus.');
        return;
      }
      setAvatarPreview(result);
      // Store avatar preview locally so it survives refresh on this device.
      window.localStorage.setItem(PROFILE_PICTURE_STORAGE_KEY, result);
      showSuccessToast('Profiilipilt uuendatud.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    try {
      await authService.updateProfile({
        firstName,
        lastName,
        phone,
      });
      // Keep auth context in sync with saved profile values.
      await refetchUser();
      showSuccessToast('Seaded salvestatud.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Seadete salvestamine ebaõnnestus.';
      showErrorToast(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: { xs: 1, md: 3 } }}>
      <Typography variant="h5" sx={{ mb: 0.75, fontWeight: 700 }}>
        Seaded
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Muuda oma telefoni, täisnime ja profiilipilti.
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2.25}
            sx={{ alignItems: 'stretch' }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <Avatar
                src={avatarPreview ?? undefined}
                alt={
                  [firstName, lastName].filter(Boolean).join(' ').trim() ||
                  user?.email ||
                  'User profile'
                }
                sx={{
                  width: 84,
                  height: 84,
                  bgcolor: 'secondary.main',
                  color: 'text.primary',
                  fontWeight: 700,
                }}
              >
                {(
                  `${firstName?.trim().charAt(0) ?? ''}${lastName?.trim().charAt(0) ?? ''}`
                    .toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'
                )}
              </Avatar>

              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Profiilipilt
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<PhotoCameraRoundedIcon />}
                >
                  Laadi pilt
                  <input hidden accept="image/*" type="file" onChange={onAvatarChange} />
                </Button>
              </Stack>
            </Stack>

            <TextField
              label="Eesnimi"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              fullWidth
              inputProps={{ maxLength: 120 }}
            />

            <TextField
              label="Perenimi"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              fullWidth
              inputProps={{ maxLength: 120 }}
            />

            <TextField
              label="Telefon"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              fullWidth
              placeholder="+372 5xxx xxxx"
              inputProps={{ maxLength: 40 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveRoundedIcon />
                )
              }
              sx={{ alignSelf: 'flex-start', mt: 1 }}
            >
              {isSaving ? 'Salvestan...' : 'Salvesta muudatused'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
