'use client';

import { useState, useEffect } from 'react';
import moment from 'moment-timezone';

// ✅ moment-timezoneで全タイムゾーン取得
const allTimezones = moment.tz.names();

// ✅ 色覚多様性に配慮したカラー
const colorPalette = [
  '#E60012', '#F39800', '#FFF100', '#8FC31F', '#009944',
  '#009E96', '#00A0E9', '#0068B7', '#1D2088', '#920783',
  '#EA68A2', '#A40000', '#E5177D', '#0079A5', '#B7DB67', '#F6C555',
];

export default function UserRegisterForm({
  onComplete,
}: {
  onComplete: (data: { name: string; country: string; color: string }) => void;
}) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Asia/Tokyo');
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('');

  // 🎨 ランダムカラー
  useEffect(() => {
    const random = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    setColor(random);
  }, []);

  // ✅ 完了押下（どこもクリックしなくても即OK）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('ニックネームを入力してください');
      return;
    }
    onComplete({ name, country, color });
  };

  // 🔍 検索フィルター
  const filteredTimezones = allTimezones.filter((tz) =>
    tz.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-6 w-80 p-6 bg-white rounded-xl shadow-lg transition"
    >
      {/* タイトル */}
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-wide mb-2">
        ユーザー登録
      </h1>

      {/* ニックネーム */}
      <div className="w-full">
        <label className="text-sm text-gray-400 mb-1 block">ニックネーム</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: Mana"
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 国選択 */}
      <div className="w-full">
        <label className="text-sm text-gray-400 mb-1 block">国・地域を選択</label>
        <input
          type="text"
          placeholder="検索（Tokyo, New York など）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 placeholder-gray-400 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          size={6}
        >
          {filteredTimezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* カラー */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-gray-600 text-sm">あなたのカラー</p>
        <div
          className="w-12 h-12 rounded-full border border-gray-400 shadow-md"
          style={{ backgroundColor: color }}
        ></div>
      </div>

      {/* 完了 */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-full shadow-md transition active:scale-95"
      >
        完了
      </button>
    </form>
  );
}
