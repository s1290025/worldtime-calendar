'use client';

import { useState, useEffect } from 'react';

// 🌍 タイムゾーンリスト
const allTimezones =
  typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
    ? Intl.supportedValuesOf('timeZone')
    : [
        'Asia/Tokyo',
        'America/New_York',
        'Europe/London',
        'Asia/Shanghai',
        'Asia/Seoul',
        'America/Los_Angeles',
      ];

// 🎨 カラーパレット
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

  // ✅ 入力中でも「完了」押せるように
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('ニックネームを入力してください');
      return;
    }
    onComplete({ name, country, color });
  };

  // 🔍 国検索
  const filteredTimezones = allTimezones.filter((tz) =>
    tz.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-6 w-80 p-6 bg-white rounded-xl shadow-lg"
    >
      {/* タイトル */}
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
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

      {/* 国選択 + 検索 */}
      <div className="w-full">
        <label className="text-sm text-gray-400 mb-1 block">国を選択</label>
        <input
          type="text"
          placeholder="検索（Tokyo, New Yorkなど）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 placeholder-gray-400 mb-2"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          size={6}
        >
          {filteredTimezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace('_', ' ')}
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

      {/* 完了ボタン */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-10 rounded-full shadow-md transition"
      >
        完了
      </button>
    </form>
  );
}
