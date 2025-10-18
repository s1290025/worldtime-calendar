'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DayPage() {
  const { date } = useParams();
  const [country, setCountry] = useState('Japan');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const { country } = JSON.parse(user);
      setCountry(country || 'Japan');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* 固定ヘッダー①：日付 */}
      <div className="sticky top-0 w-full bg-white z-20 border-b shadow-sm py-3 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          📅 {date} のスケジュール
        </h1>
      </div>

      {/* 固定ヘッダー②：国名 */}
      <div className="sticky top-[60px] w-full bg-white z-10 border-b py-2 shadow-sm text-center">
        <h2 className="text-lg font-semibold text-blue-600">🌏 {country}</h2>
      </div>

      {/* タイムライン部分 */}
      <div className="mt-2 w-full max-w-md mx-auto border rounded-lg shadow bg-white overflow-y-auto">
        <div className="flex">
          {/* 時間ラベル */}
          <div className="flex flex-col items-end pr-2 border-r text-sm text-gray-500">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="h-16 flex items-start justify-end pr-2 pt-1">
                {`${h}:00`}
              </div>
            ))}
          </div>

          {/* タイムライン */}
          <div className="flex-1 relative">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="h-16 border-b"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
