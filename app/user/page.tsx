'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#007bff'); // 仮のユーザーカラー
  const [country, setCountry] = useState('Japan');

  const handleSubmit = () => {
    if (!name) {
      alert('名前を入力してください');
      return;
    }

    // 一時的にlocalStorageで保存（後でSupabase対応）
    localStorage.setItem('user', JSON.stringify({ name, color, country }));
    router.push('/calendar');
  };

  const countries = [
    'Japan',
    'USA',
    'UK',
    'France',
    'Australia',
    'China',
    'India',
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー登録</h1>

      <input
        type="text"
        placeholder="ニックネーム"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-4 py-2 mb-4 w-64 text-gray-800"
      />

      <label className="text-gray-600 mb-2">国を選択</label>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-64 text-gray-800"
      >
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-full shadow"
      >
        完了
      </button>
    </main>
  );
}
