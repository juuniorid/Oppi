'use client';

import { useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { GalleryImageCard } from '@/components/GalleryImageCard';

type StaffPhoto = {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedRole: 'Kasvataja' | 'Personal';
  uploadedAt: string;
  imageUrl: string;
};

const demoStaffPhotos: StaffPhoto[] = [
  {
    id: '1',
    title: 'Hommikuring',
    uploadedBy: 'Kadi Tamm',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-04-22T09:12:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-1/800/600',
  },
  {
    id: '2',
    title: 'Õueõpe pargis',
    uploadedBy: 'Mari Kask',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-04-16T11:45:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-2/800/600',
  },
  {
    id: '3',
    title: 'Lõunalaud',
    uploadedBy: 'Riina Saar',
    uploadedRole: 'Personal',
    uploadedAt: '2026-03-27T10:25:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-3/800/600',
  },
  {
    id: '4',
    title: 'Kunstinurk',
    uploadedBy: 'Anu Vaher',
    uploadedRole: 'Kasvataja',
    uploadedAt: '2026-03-14T13:05:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-4/800/600',
  },
  {
    id: '5',
    title: 'Lugemistund',
    uploadedBy: 'Lea Paju',
    uploadedRole: 'Personal',
    uploadedAt: '2026-02-18T08:40:00.000Z',
    imageUrl: 'https://picsum.photos/seed/oppi-5/800/600',
  },
];

function formatMonthLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('et-EE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));
}

function formatUploadDate(isoDate: string): string {
  return new Intl.DateTimeFormat('et-EE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoDate));
}

function groupPhotosByMonth(photos: StaffPhoto[]): Array<[string, StaffPhoto[]]> {
  const monthGroups = new Map<string, StaffPhoto[]>();

  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  for (const photo of sortedPhotos) {
    const monthKey = `${new Date(photo.uploadedAt).getFullYear()}-${new Date(photo.uploadedAt).getMonth()}`;
    const existing = monthGroups.get(monthKey) ?? [];
    existing.push(photo);
    monthGroups.set(monthKey, existing);
  }

  return [...monthGroups.entries()];
}

export default function GalleryPage() {
  const groupedPhotos = useMemo(
    () => groupPhotosByMonth(demoStaffPhotos),
    []
  );
  const [selectedPhoto, setSelectedPhoto] = useState<StaffPhoto | null>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Kasvatajate ja personali pildid
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Uleslaetud pildid on margistatud kuude loikes.
        </Typography>
      </Box>

      <Stack spacing={4}>
        {groupedPhotos.map(([, photos]) => (
          <Box key={photos[0].id}>
            <Typography
              variant="h6"
              sx={{ textTransform: 'capitalize', mb: 1.5, fontWeight: 700 }}
            >
              {formatMonthLabel(photos[0].uploadedAt)}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {photos.map((photo) => (
                <GalleryImageCard
                  key={photo.id}
                  title={photo.title}
                  imageUrl={photo.imageUrl}
                  uploadedAtLabel={formatUploadDate(photo.uploadedAt)}
                  onClick={() => setSelectedPhoto(photo)}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Stack>

      <Dialog
        open={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedPhoto ? (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              {selectedPhoto.title}
              <IconButton
                aria-label="Sulge"
                onClick={() => setSelectedPhoto(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box
                component="img"
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                sx={{
                  width: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              />
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
}
