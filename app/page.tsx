'use client';

export default function StartPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">
          World Time Calendar
        </h1>

        {/* 新規ボタン */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-sm transition">
          新規
        </button>

        {/* パスワード欄（まだ仮） */}
        <p className="text-gray-400 text-sm">ここにパスワード入力欄を置く</p>
      </div>
    </main>
  );
}

