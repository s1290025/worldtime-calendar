'use client';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState, useMemo, useEffect, useState as useReactState } from 'react';
import { getEventsForDate, type Event } from '@/utils/events';
import { getUserSession } from '@/utils/session';
import EventForm from './EventForm';

dayjs.locale('ja');

// 背景色に応じて適切な文字色を決定する関数
function getContrastColor(backgroundColor: string): string {
  // 16進数カラーコードをRGBに変換
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 相対輝度を計算
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // 輝度が0.5より高い場合は黒、低い場合は白を返す
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export default function MonthCalendar() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useReactState(dayjs());
  const [windowHeight, setWindowHeight] = useReactState(0);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

  // 画面高さを監視してレスポンシブ対応
  useEffect(() => {
    const updateHeight = () => setWindowHeight(window.innerHeight);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  const endOfCalendar = endOfMonth.endOf('week');

  const days = useMemo(() => {
    const result: dayjs.Dayjs[] = [];
    let d = startOfCalendar;
    while (d.isBefore(endOfCalendar)) {
      result.push(d);
      d = d.add(1, 'day');
    }
    return result;
  }, [currentMonth]);

  const weekCount = Math.ceil(days.length / 7);

  const goPrev = () => setCurrentMonth((prev) => prev.subtract(1, 'month'));
  const goNext = () => setCurrentMonth((prev) => prev.add(1, 'month'));

  const handleEventFormClose = () => {
    setIsEventFormOpen(false);
    setSelectedEvent(undefined);
  };

  const handleEventSave = () => {
    // 予定が保存された時の処理（必要に応じて状態を更新）
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  // ヘッダー＋曜日部分を引いた残りを週ごとに均等配分
  const headerHeight = 120; // px（タイトル＋曜日）
  const availableHeight = Math.max(windowHeight - headerHeight - 40, 300); // 最低300px確保
  const cellHeight = availableHeight / weekCount;

  return (
    <div className="flex justify-center items-start bg-gray-50 h-screen">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md border overflow-hidden flex flex-col">
        {/* === ヘッダー === */}
        <div className="flex justify-between items-center p-4 border-b shrink-0 bg-white sticky top-0 z-10">
          <button
            onClick={goPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="前の月"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h2 
            className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => router.push(`/day/${currentMonth.format('YYYY-MM-DD')}`)}
            title="日タイムラインを表示"
          >
            {currentMonth.format('YYYY年 M月')}
          </h2>

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
            
            <button
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/user');
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              title="ログアウト"
            >
              ログアウト
            </button>
          </div>
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
            
            // ユーザーのタイムゾーンを取得
            const userSession = getUserSession();
            const timezone = userSession?.timezone || 'Asia/Tokyo';
            const events = getEventsForDate(dateStr, timezone);

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
              >
                <div className="text-right text-sm mb-1">{d.date()}</div>
                
                {/* 予定表示 */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate font-semibold shadow-sm cursor-pointer hover:opacity-80 transition-opacity relative z-10"
                      style={{ 
                        backgroundColor: event.color,
                        color: getContrastColor(event.color)
                      }}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, e);
                      }}
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

                {/* クリックイベント - 日タイムライン表示 */}
                <div
                  className="absolute inset-0"
                  onClick={(e) => {
                    router.push(`/day/${dateStr}`);
                  }}
                />
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
        event={selectedEvent}
      />
    </div>
  );
}
