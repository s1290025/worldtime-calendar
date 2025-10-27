'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSharedCalendar, type SharedCalendar } from '@/utils/share';
import { Calendar, Users, Copy, Check } from 'lucide-react';

export default function HostPage() {
  const router = useRouter();
  const [calendarName, setCalendarName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdCalendar, setCreatedCalendar] = useState<SharedCalendar | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarName.trim()) return;

    setIsLoading(true);
    try {
      const calendar = createSharedCalendar(calendarName.trim(), 'Host');
      setCreatedCalendar(calendar);
    } catch (error) {
      console.error('Error creating calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (createdCalendar) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              カレンダーを作成しました！
            </h2>
            <p className="text-gray-600">
              参加者に以下の情報を共有してください
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カレンダー名
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-gray-900 font-medium">{createdCalendar.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                共有URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 break-all">
                    {createdCalendar.url}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(createdCalendar.url)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  title="URLをコピー"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                このURLを参加者に共有してください
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/share/${createdCalendar.id}/users`)}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="w-4 h-4" />
              カレンダーを開く
            </button>
            
            <button
              onClick={() => {
                setCreatedCalendar(null);
                setCalendarName('');
              }}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              新しいカレンダーを作成
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            カレンダーを作成
          </h2>
          <p className="text-gray-600">
            みんなで使える共有カレンダーを作成しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="calendarName" className="block text-sm font-medium text-gray-700 mb-2">
              カレンダー名
            </label>
            <input
              id="calendarName"
              type="text"
              value={calendarName}
              onChange={(e) => setCalendarName(e.target.value)}
              placeholder="例: プロジェクト会議、家族の予定"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !calendarName.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? '作成中...' : 'カレンダーを作成'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            共有URLをお持ちの場合は
          </p>
          <button
            onClick={() => router.push('/share')}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            こちらから参加
          </button>
        </div>
      </div>
    </main>
  );
}
