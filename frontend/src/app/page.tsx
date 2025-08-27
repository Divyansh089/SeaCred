'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Leaf className="mx-auto h-12 w-12 text-green-600 animate-pulse" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Loading SeaCred...</h2>
          <p className="mt-1 text-sm text-gray-500">Please wait while we prepare your carbon credit platform</p>
        </div>
      </div>
    );
  }

  return null;
}
