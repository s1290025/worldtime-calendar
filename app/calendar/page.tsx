'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const router = useRouter();

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();
  const daysArray = Array.from({ length: startDay + daysInMonth }, (_, i) =>
    i < startDay ? null : i - startDay + 1
  );

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  // 📅 日付をクリックすると /day/yyyy-mm-dd に遷移
  const handleDayClick = (day: number) => {
    if (!day) return;
    const date = currentMonth.date(day).format('YYYY-MM-DD');
    router.push(`/day/${date}`);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-6">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="text-lg font-bold text-blue-500 hover:text-blue-700"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentMonth.format('YYYY年 M月')}
          </h2>
          <button
            onClick={nextMonth}
            className="text-lg font-bold text-blue-500 hover:text-blue-700"
          >
            →
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 text-center font-semibold text-gray-700 border-b pb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1 mt-2 text-center">
          {daysArray.map((day, i) => (
            <div
              key={i}
              onClick={() => handleDayClick(day!)}
              className={`h-16 flex items-center justify-center border rounded cursor-pointer transition
                ${
                  day
                    ? 'hover:bg-blue-100 active:bg-blue-200 text-gray-800'
                    : 'bg-gray-50'
                }`}
            >
              {day && <span className="font-medium">{day}</span>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
