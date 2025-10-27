'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSharedCalendars, getShareSession, type SharedCalendar, type ShareSession, type SharedUser } from '@/utils/share';
import { getEventsForDate } from '@/utils/events';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { ChevronLeft, ChevronRight, Plus, Users, ArrowLeft } from 'lucide-react';
import EventForm from '@/components/EventForm';

dayjs.locale('ja');

export default function SharedCalendarPage() {
  const router = useRouter();
  const params = useParams();
  const calendarId = params.calendarId as string;
  
  const [calendar, setCalendar] = useState<SharedCalendar | null>(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [shareSession, setShareSession] = useState<ShareSession | null>(null);

  useEffect(() => {
    const calendars = getSharedCalendars();
    const foundCalendar = calendars.find(c => c.id === calendarId);
    
    if (!foundCalendar) {
      // カレンダーが見つからない場合は、新規作成として扱う
      router.push(`/share/${calendarId}/users`);
      return;
    }
    
    setCalendar(foundCalendar);
    
    const session = getShareSession();
    if (!session || session.calendarId !== calendarId) {
      // セッションがない場合は、ユーザー選択画面に遷移
      router.push(`/share/${calendarId}/users`);
      return;
    }
    
    setShareSession(session);
  }, [calendarId, router]);

  const goPrev = () => setCurrentMonth((prev) => prev.subtract(1, 'month'));
  const goNext = () => setCurrentMonth((prev) => prev.add(1, 'month'));

  const handleEventFormClose = () => {
    setIsEventFormOpen(false);
  };

  const handleEventSave = () => {
    // 予定が保存された時の処理
  };

  // 背景色に応じて適切な文字色を決定する関数
  function getContrastColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  if (!calendar || !shareSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </main>
    );
  }

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  const endOfCalendar = endOfMonth.endOf('week');

  const days = [];
  let d = startOfCalendar;
  while (d.isBefore(endOfCalendar)) {
    days.push(d);
    d = d.add(1, 'day');
  }

  const weekCount = Math.ceil(days.length / 7);
  const cellHeight = Math.max(300 / weekCount, 60);

  return (
    <div className="flex justify-center items-start bg-gray-50 min-h-screen">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md border overflow-hidden flex flex-col">
        {/* === ヘッダー === */}
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/share')}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              title="共有カレンダー選択に戻る"
            >
              <ArrowLeft size={16} />
              戻る
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {calendar.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEventFormOpen(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              title="予定を追加"
            >
              <Plus className="w-4 h-4" />
              予定追加
            </button>
            
            <button
              onClick={goNext}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="次の月"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* === 参加者一覧 === */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              参加者 ({calendar.participants.length}人)
            </span>
            <div className="flex gap-2">
              {calendar.participants.map((participant: SharedUser) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-1 px-2 py-1 bg-white rounded-md border"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: participant.color }}
                  />
                  <span className="text-xs text-gray-700">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === 月ナビゲーション === */}
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={goPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="前の月"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.format('YYYY年 M月')}
          </h3>

          <div></div>
        </div>

        {/* === 曜日ヘッダー === */}
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-700 border-b">
          {['日', '月', '火', '水', '木', '金', '土'].map((w, i) => (
            <div
              key={i}
              className={`py-2 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* === カレンダー === */}
        <div className="grid grid-cols-7 border-t border-l flex-1">
          {days.map((d) => {
            const isCurrentMonth = d.isSame(currentMonth, 'month');
            const isToday = d.isSame(dayjs(), 'day');
            const dateStr = d.format('YYYY-MM-DD');
            const events = getEventsForDate(dateStr, 'Asia/Tokyo');

            return (
              <div
                key={dateStr}
                className={`
                  border-r border-b p-2 cursor-pointer transition-all relative
                  hover:bg-blue-50
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'text-gray-900'}
                  ${isToday ? 'bg-blue-100 text-blue-700 font-bold' : ''}
                `}
                style={{
                  height: `${cellHeight}px`,
                }}
                onClick={() => router.push(`/shared/${calendarId}/day/${dateStr}`)}
              >
                <div className="text-right text-sm mb-1">{d.date()}</div>
                
                {/* 予定表示 */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate font-semibold shadow-sm"
                      style={{ 
                        backgroundColor: event.color,
                        color: getContrastColor(event.color)
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-gray-600 font-medium">
                      +{events.length - 3} 件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 予定入力フォーム */}
      <EventForm
        isOpen={isEventFormOpen}
        onClose={handleEventFormClose}
        onSave={handleEventSave}
      />
    </div>
  );
}
