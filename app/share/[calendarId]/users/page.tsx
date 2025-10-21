'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSharedCalendars, addUserToCalendar, getAvailableColors, getRandomAvailableColor, saveShareSession } from '@/utils/share';
import { Users, UserPlus, Palette } from 'lucide-react';

export default function UserSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const calendarId = params.calendarId as string;
  
  const [calendar, setCalendar] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calendars = getSharedCalendars();
    const foundCalendar = calendars.find(c => c.id === calendarId);
    
    if (!foundCalendar) {
      // カレンダーが見つからない場合は、新規作成として扱う
      setCalendar({
        id: calendarId,
        name: '新しいカレンダー',
        participants: []
      });
    } else {
      setCalendar(foundCalendar);
    }
    
    const colors = getAvailableColors(calendarId);
    setAvailableColors(colors);
    setSelectedColor(getRandomAvailableColor(calendarId));
  }, [calendarId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !selectedColor) return;

    setIsLoading(true);
    try {
      const user = addUserToCalendar(calendarId, userName.trim(), selectedColor);
      
      // 共有セッションを保存
      saveShareSession({
        calendarId,
        userId: user.id,
        isHost: false
      });

      // カレンダー画面に遷移
      router.push(`/shared/${calendarId}`);
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!calendar) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {calendar.name}
          </h2>
          <p className="text-gray-600">
            あなたの情報を入力してください
          </p>
        </div>

        {/* 参加者一覧 */}
        {calendar.participants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              参加者 ({calendar.participants.length}人)
            </h3>
            <div className="space-y-2">
              {calendar.participants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                >
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="text-gray-900 font-medium">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              お名前
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="ニックネーム"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              あなたの色
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? 'border-gray-800 ring-2 ring-gray-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {availableColors.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                全ての色が使用されています。ランダムに色が割り当てられます。
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !userName.trim()}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? '参加中...' : 'カレンダーに参加'}
          </button>
        </form>
      </div>
    </main>
  );
}
