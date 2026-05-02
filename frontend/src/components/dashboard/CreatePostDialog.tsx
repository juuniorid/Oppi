import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { showErrorToast, showSuccessToast } from '@/components/ErrorToast';
import postService from '@/services/post.service';

type PostDialogMode = 'create' | 'edit';

type CreatePostDialogProps = {
  open: boolean;
  mode: PostDialogMode;
  groupId: number | null;
  postId?: number | null;
  initialTitle?: string;
  initialMessage?: string;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export function CreatePostDialog({
  open,
  mode,
  groupId,
  postId,
  initialTitle = '',
  initialMessage = '',
  onClose,
  onCreated,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(initialTitle);
    setMessage(initialMessage);
  }, [initialMessage, initialTitle, open]);

  const canSubmit = useMemo(() => {
    if (isSubmitting || !groupId) {
      return false;
    }

    return Boolean(title.trim() && message.trim());
  }, [groupId, isSubmitting, message, title]);

  const handleSubmit = async () => {
    if (!groupId) {
      showErrorToast('Rühma ei leitud.');
      return;
    }

    if (!title.trim()) {
      showErrorToast('Palun sisesta pealkiri.');
      return;
    }

    if (!message.trim()) {
      showErrorToast('Palun sisesta sisu.');
      return;
    }

    if (mode === 'edit' && !postId) {
      showErrorToast('Postitust ei leitud.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && postId) {
        await postService.updatePost(postId, title.trim(), message.trim());
      } else {
        await postService.createPost(title.trim(), message.trim(), groupId);
      }

      await onCreated();
      showSuccessToast(
        mode === 'edit' ? 'Postitus uuendatud' : 'Postitus loodud'
      );
      onClose();
    } catch (error) {
      const err = error as Error;
      showErrorToast(
        err.message ||
          (mode === 'edit'
            ? 'Postituse uuendamine ebaõnnestus.'
            : 'Postituse loomine ebaõnnestus.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'edit' ? 'Muuda postitust' : 'Lisa uus postitus'}
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '26px !important' }}>
        <TextField
          label="Pealkiri"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Sisu"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          multiline
          minRows={5}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="neutral" onClick={onClose}>
          Tühista
        </Button>
        <Button variant="info" onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting
            ? 'Salvestamine...'
            : mode === 'edit'
              ? 'Uuenda'
              : 'Salvesta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
