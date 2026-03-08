'use client';

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Oppi</h1>
        <Button onClick={handleGoogleLogin}>Sign in with Google</Button>
      </div>
    </div>
  );
}
