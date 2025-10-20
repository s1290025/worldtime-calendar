'use client';

import { useParams } from 'next/navigation';
import MultiZoneDayView from '@/components/MultiZoneDayView';

export default function DayPage() {
  const { date } = useParams();
  const dateISO = Array.isArray(date) ? date[0] : (date as string);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <MultiZoneDayView dateISO={dateISO} />
    </main>
  );
}
