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

  // sessionStorageの変更を監視して予定を更新
  useEffect(() => {
    const handleStorageChange = () => {
      // sessionStorageが変更されたら、強制的に再レンダリングをトリガー
      setCurrentMonth((prev) => prev);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // カスタムイベントもリッスン（同一タブ内での変更用）
    window.addEventListener('eventsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('eventsUpdated', handleStorageChange);
    };
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
  const availableHeight = Math.max(windowHeight - headerHeight - 40, 500); // 最低500px確保
  const cellHeight = Math.max(availableHeight / weekCount, 100); // セルあたり最低100px

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
            
            // デバッグログ
            if (events.length > 0) {
              console.log(`📋 ${dateStr}: Found ${events.length} events`);
            }

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
                <div 
                  className="text-right text-sm mb-1 relative z-20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/day/${dateStr}`);
                  }}
                >
                  {d.date()}
                </div>
                
                {/* 予定表示 */}
                <div className="space-y-1 relative z-20">
                  {events.length > 0 && (
                    <div className="text-[8px] text-red-600 font-bold mb-1">
                      {events.length}件
                    </div>
                  )}
                  {events.slice(0, 5).map((event, idx) => (
                    <div
                      key={event.id}
                      className="text-xs px-1.5 py-1 rounded truncate font-semibold cursor-pointer hover:opacity-80 transition-opacity shadow"
                      style={{ 
                        backgroundColor: event.color || '#3b82f6',
                        color: getContrastColor(event.color || '#3b82f6'),
                        lineHeight: '1.4',
                        minHeight: '18px'
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
                  {events.length > 5 && (
                    <div className="text-xs text-gray-600 font-medium px-1.5">
                      +{events.length - 5} 件
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
        event={selectedEvent}
      />
    </div>
  );
}
