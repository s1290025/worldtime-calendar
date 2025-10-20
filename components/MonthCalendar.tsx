'use client';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useEffect, useState as useReactState } from 'react';

dayjs.locale('ja');

export default function MonthCalendar() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useReactState(dayjs());
  const [windowHeight, setWindowHeight] = useReactState(0);

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

          <h2 className="text-xl font-bold text-gray-900">
            {currentMonth.format('YYYY年 M月')}
          </h2>

          <button
            onClick={goNext}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            title="次の月"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
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

            return (
              <div
                key={d.format('YYYY-MM-DD')}
                onClick={() => router.push(`/day/${d.format('YYYY-MM-DD')}`)}
                className={`
                  border-r border-b p-2 cursor-pointer transition-all
                  hover:bg-blue-50
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'text-gray-900'}
                  ${isToday ? 'bg-blue-100 text-blue-700 font-bold' : ''}
                `}
                style={{
                  height: `${cellHeight}px`,
                }}
              >
                <div className="text-right text-sm">{d.date()}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
