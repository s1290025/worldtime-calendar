'use client';

import { useRouter } from 'next/navigation';
import UserRegisterForm from '@/components/UserRegisterForm';


export default function NewUserPage() {
  const router = useRouter();

  const handleComplete = (data: { name: string; country: string; color: string }) => {
    localStorage.setItem('userData', JSON.stringify(data));
    router.push('/calendar');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <UserRegisterForm onComplete={handleComplete} />
    </main>
  );
}
