'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import inviteService from '@/services/invite.service';
import { showSuccessToast, showErrorToast } from '@/components/ErrorToast';

type InviteRole = 'TEACHER' | 'PARENT';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('PARENT');
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isGmail = email.toLowerCase().endsWith('@gmail.com');
  const canSubmit = isValidEmail && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setSuccessEmail(null);

    try {
      await inviteService.createInvite({ email: email.trim(), role });
      showSuccessToast(`Kutse saadetud: ${email}`);
      setSuccessEmail(email);
      setEmail('');
      setRole('PARENT');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kutse saatmine ebaõnnestus';
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', py: { xs: 1, md: 3 } }}>
      {/* Page heading */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}
        >
          Kasutajate kutsumine
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sisesta kasutaja e-posti aadress ja roll, et saata kutse Oppi platvormile.
        </Typography>
      </Box>

      {/* Invitation form card */}
      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            {/* Email field */}
            <TextField
              id="invite-email"
              label="E-posti aadress"
              placeholder="kasutaja@gmail.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSuccessEmail(null);
              }}
              required
              fullWidth
              helperText={
                email && !isGmail && isValidEmail
                  ? 'Hetkel toetatakse ainult Google (Gmail) kontosid'
                  : undefined
              }
              error={email.length > 0 && !isValidEmail}
            />

            {/* Role select */}
            <FormControl fullWidth>
              <InputLabel id="invite-role-label">Roll</InputLabel>
              <Select
                labelId="invite-role-label"
                id="invite-role"
                value={role}
                label="Roll"
                onChange={(e) => setRole(e.target.value as InviteRole)}
              >
                <MenuItem value="PARENT">Lapsevanem</MenuItem>
                <MenuItem value="TEACHER">Õpetaja</MenuItem>
              </Select>
            </FormControl>

            {/* Success message */}
            {successEmail && (
              <Alert
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                severity="success"
                sx={{ borderRadius: 2 }}
              >
                Kutse saadetud aadressile <strong>{successEmail}</strong>
              </Alert>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={!canSubmit}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PersonAddAltIcon />
                )
              }
              sx={{
                alignSelf: 'flex-start',
                px: 3,
                py: 1.2,
              }}
            >
              {loading ? 'Saadan...' : 'Saada kutse'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
