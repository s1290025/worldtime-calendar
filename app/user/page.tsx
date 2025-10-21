'use client';

import { useRouter } from 'next/navigation';

export default function UserPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          ユーザー管理
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/user/new')}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            新規ユーザー登録
          </button>
        </div>
      </div>
    </main>
  );
}