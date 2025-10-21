'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionValid } from '@/utils/session';
import { getShareSession } from '@/utils/share';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 共有セッションがある場合は共有カレンダーに遷移
    const shareSession = getShareSession();
    if (shareSession) {
      router.push(`/shared/${shareSession.calendarId}`);
      return;
    }

    // 通常のセッションがある場合はカレンダーに遷移
    if (isSessionValid()) {
      router.push('/calendar');
    } else {
      // セッションがない場合は共有カレンダー選択画面に遷移
      router.push('/share');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">読み込み中...</div>
    </main>
  );
}