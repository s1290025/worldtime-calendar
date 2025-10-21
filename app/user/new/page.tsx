'use client';

import UserRegisterForm from '@/components/UserRegisterForm';


export default function NewUserPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <UserRegisterForm />
    </main>
  );
}
