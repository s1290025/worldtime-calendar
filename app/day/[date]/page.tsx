'use client';

import { useParams } from 'next/navigation';
import DayView from '@/components/DayView';

export default function DayPage() {
  const { date } = useParams(); // "2025-10-22" など
  const dateISO = Array.isArray(date) ? date[0] : (date as string);

  // サンプルイベント（重なり・30分刻みなど）
  const sampleEvents = [
    {
      id: '1',
      title: 'ミーティング（JP）',
      start: `${dateISO}T09:00:00`,
      end:   `${dateISO}T10:30:00`,
      color: '#2563eb', // blue-600
    },
    {
      id: '2',
      title: '作業ブロック',
      start: `${dateISO}T10:00:00`,
      end:   `${dateISO}T11:00:00`,
      color: '#16a34a', // green-600
    },
    {
      id: '3',
      title: 'ランチ',
      start: `${dateISO}T12:00:00`,
      end:   `${dateISO}T13:00:00`,
      color: '#f59e0b', // amber-500
    },
    {
      id: '4',
      title: '夕方打合せ',
      start: `${dateISO}T17:30:00`,
      end:   `${dateISO}T18:30:00`,
      color: '#ef4444', // red-500
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <DayView
        dateISO={dateISO}
        events={sampleEvents}
        timezone="Asia/Tokyo" // ← ここを国ごとに切替予定
      />
    </main>
  );
}
