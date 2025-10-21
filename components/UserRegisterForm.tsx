'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserRegisterFormProps {
  onComplete?: (data: { name: string; country: string; color: string }) => void;
}

export default function UserRegisterForm({ onComplete }: UserRegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Japan');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const userData = { name: name.trim(), country, color };
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (onComplete) {
        onComplete(userData);
      } else {
        router.push('/calendar');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          ユーザー登録
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              お名前
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              国
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Japan">日本</option>
              <option value="United States">アメリカ</option>
              <option value="United Kingdom">イギリス</option>
              <option value="Australia">オーストラリア</option>
              <option value="China">中国</option>
            </select>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              お気に入りの色
            </label>
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            登録
          </button>
        </form>
      </div>
    </div>
  );
}