'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionValid } from '@/utils/session';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!isSessionValid()) {
      router.push('/user');
    } else {
      router.push('/calendar');
    }
  }, [router]);

  return null;
}