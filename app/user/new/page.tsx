'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ✅ ユニバーサルデザイン対応（色覚多様性対応）カラーパレット
// 日本の「カラーユニバーサルデザイン機構（CUDO）」推奨色をもとに作成
const colorPalette = [
  '#E60012', // 赤（鮮やかで識別しやすい）
  '#F39800', // オレンジ
  '#FFF100', // 黄
  '#8FC31F', // 黄緑
  '#009944', // 緑
  '#009E96', // 青緑
  '#00A0E9', // 青
  '#0068B7', // 濃い青
  '#1D2088', // 紺
  '#920783', // 紫
  '#EA68A2', // ピンク
  '#A40000', // 深い赤
  '#E5177D', // ローズ
  '#0079A5', // スカイブルー
  '#B7DB67', // ライトグリーン
  '#F6C555'  // ソフトイエロー
];

export default function NewUserPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [color, setColor] = useState('');

  // 初回レンダリング時にランダム色を選ぶ
  useEffect(() => {
    const random = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    setColor(random);
  }, []);

  // ✅ 完了ボタンでユーザー情報を保存（まずはブラウザメモリに）
  const handleComplete = () => {
    if (!userName.trim()) {
      alert('ニックネームを入力してください');
      return;
    }

    // 一時的に localStorage に保存（後で Supabase に切り替える）
    localStorage.setItem(
      'userData',
      JSON.stringify({ name: userName, color })
    );

    // 次の画面（カレンダー画面予定）へ遷移
    router.push('/calendar');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-6 w-80">
        <h1 className="text-2xl font-bold text-gray-800">ユーザー登録</h1>

        {/* 名前入力欄（文字色を濃く・コントラスト強化） */}
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="ニックネームを入力"
          className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* ランダム色の表示 */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-gray-700 text-sm">あなたのカラー</p>
          <div
            className="w-12 h-12 rounded-full border border-gray-400 shadow-md"
            style={{ backgroundColor: color }}
          ></div>
        </div>

        {/* もっと詳しく選ぶ（今はテキストだけ） */}
        <p className="text-blue-600 text-sm underline cursor-pointer hover:text-blue-800">
          もっと詳しく選ぶ（今は動かない）
        </p>

        {/* 完了ボタン */}
        <button
          onClick={handleComplete}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition"
        >
          完了
        </button>
      </div>
    </main>
  );
}
