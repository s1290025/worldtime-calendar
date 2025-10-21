'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { findCalendarById } from '@/utils/share';
import { Link, Users, Calendar } from 'lucide-react';

export default function SharePage() {
  const router = useRouter();
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // URLからカレンダーIDを抽出
      const urlParts = shareUrl.split('/');
      const calendarId = urlParts[urlParts.length - 1];
      
      if (!calendarId) {
        setError('URLが正しくありません');
        setIsLoading(false);
        return;
      }

      const calendar = findCalendarById(calendarId);
      
      if (!calendar) {
        setError('カレンダーが見つかりません');
        setIsLoading(false);
        return;
      }

      // 共有カレンダーが見つかった場合、ユーザー選択画面に遷移
      router.push(`/share/${calendar.id}/users`);
    } catch (error) {
      console.error('Error finding calendar:', error);
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Link className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            共有カレンダーに参加
          </h2>
          <p className="text-gray-600">
            共有URLを入力してカレンダーに参加してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shareUrl" className="block text-sm font-medium text-gray-700 mb-2">
              共有URL
            </label>
            <input
              id="shareUrl"
              type="url"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://example.com/shared/calendar-id"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              主催者から共有されたURLを入力してください
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !shareUrl.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '確認中...' : '参加する'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            カレンダーを主催する場合は
          </p>
          <button
            onClick={() => router.push('/host')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            こちらから作成
          </button>
        </div>
      </div>
    </main>
  );
}
