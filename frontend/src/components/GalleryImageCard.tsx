'use client';

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';

type GalleryImageCardProps = {
  title: string;
  imageUrl: string;
  uploadedAtLabel: string;
  onClick?: () => void;
};

export function GalleryImageCard({
  title,
  imageUrl,
  uploadedAtLabel,
  onClick,
}: GalleryImageCardProps) {
  return (
    <Card variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
      <CardActionArea onClick={onClick} disabled={!onClick}>
        <CardMedia component="img" image={imageUrl} alt={title} sx={{ height: 200, objectFit: 'cover' }} />
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.25, display: 'block' }}>
            {uploadedAtLabel}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
