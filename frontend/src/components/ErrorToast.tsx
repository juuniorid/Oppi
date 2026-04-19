'use client';

import { Toaster, toast } from 'sonner';

const errorToastStyle = {
  background: 'rgb(220, 38, 38)',
  color: '#FFFFFF',
  border: 'none',
};

const successToastStyle = {
  background: 'rgb(22, 163, 74)',
  color: '#FFFFFF',
  border: 'none',
};

export function ErrorToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      expand={false}
      visibleToasts={3}
      toastOptions={{
        duration: 3500,
        className: 'text-xs px-3 py-2',
        classNames: {
          closeButton:
            '!border-1 !bg-white !text-black !pointer-events-auto',
        },
      }}
    />
  );
}

export function showErrorToast(message: string) {
  toast.error(message || 'Something went wrong', {
    style: errorToastStyle,
  });
}

export function showSuccessToast(message: string) {
  toast.success(message || 'Success', {
    style: successToastStyle,
  });
}
