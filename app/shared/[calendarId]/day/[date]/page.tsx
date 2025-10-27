'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSharedCalendars, getShareSession, type SharedCalendar, type ShareSession, type SharedUser } from '@/utils/share';
import { getUserSession } from '@/utils/session';
import { TIMEZONE_OPTIONS } from '@/utils/timezones';
import dayjs from '@/utils/time';
import { Plus, ArrowLeft, Users } from 'lucide-react';
import TimezoneSelectorModal from '@/components/TimezoneSelectorModal';

export default function SharedDayView() {
  const router = useRouter();
  const params = useParams();
  const calendarId = params.calendarId as string;
  const dateISO = params.date as string;
  
  const [calendar, setCalendar] = useState<SharedCalendar | null>(null);
  const [shareSession, setShareSession] = useState<ShareSession | null>(null);
  const [zones, setZones] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // カレンダー情報とセッション情報を読み込む
  useEffect(() => {
    const calendars = getSharedCalendars();
    const foundCalendar = calendars.find(c => c.id === calendarId);
    
    if (!foundCalendar) {
      router.push('/share');
      return;
    }
    
    setCalendar(foundCalendar);
    
    const session = getShareSession();
    if (!session || session.calendarId !== calendarId) {
      router.push(`/share/${calendarId}/users`);
      return;
    }
    
    setShareSession(session);
    setIsInitialized(true);
  }, [calendarId, router]);
  
  // localStorageからタイムゾーンを読み込む
  useEffect(() => {
    const savedZones = localStorage.getItem('shared_dayview_zones');
    
    if (savedZones) {
      try {
        const parsed = JSON.parse(savedZones);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setZones(parsed);
        } else {
          // 空の場合、デフォルト値を設定
          const userSession = getUserSession();
          setZones(userSession?.timezone ? [userSession.timezone] : ['Asia/Tokyo']);
        }
      } catch (e) {
        console.error('Failed to parse saved zones:', e);
        const userSession = getUserSession();
        setZones(userSession?.timezone ? [userSession.timezone] : ['Asia/Tokyo']);
      }
    } else {
      // localStorageにない場合
      const userSession = getUserSession();
      setZones(userSession?.timezone ? [userSession.timezone] : ['Asia/Tokyo']);
    }
  }, [dateISO]);

  const handleAddZone = () => {
    setIsModalOpen(true);
  };

  const handleTimezoneSelect = (timezone: string) => {
    const newZones = [...zones, timezone];
    setZones(newZones);
    localStorage.setItem('shared_dayview_zones', JSON.stringify(newZones));
  };

  // タイムゾーンから都市名と国名を取得
  const getCityName = (timezone: string): string => {
    const timezoneOption = TIMEZONE_OPTIONS.find(option => option.value === timezone);
    if (timezoneOption) {
      const match = timezoneOption.label.match(/^([^(]+)\s*\(([^)]+)\)/);
      if (match) {
        const cityName = match[1].trim();
        const countryName = match[2].trim();
        return `${cityName}（${countryName}）`;
      }
      return timezoneOption.label;
    }
    return timezone.split('/').pop() || timezone;
  };

  if (!calendar || !shareSession || !isInitialized) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </main>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <main className="min-h-screen bg-white">
      {/* ===== 日付ヘッダー ===== */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/shared/${calendarId}`)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            title="共有カレンダーに戻る"
          >
            <ArrowLeft size={16} />
            カレンダー
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {dayjs(dateISO).format('YYYY年MM月DD日（ddd）')}
          </h2>
        </div>
        <button
          onClick={handleAddZone}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
        >
          <Plus size={18} />
          国を追加
        </button>
      </div>

      {/* ===== 参加者一覧 === */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {calendar.name} - 参加者 ({calendar.participants.length}人)
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

      {/* ===== タイムゾーンヘッダー ===== */}
      <div className="sticky z-20 bg-white border-b">
        <div
          className="grid"
          style={{
            gridTemplateColumns: zones.map(() => '80px 1fr').join(' '),
          }}
        >
          {zones.map((tz) => (
            <div key={tz} className="contents">
              {/* ← 時間列ヘッダー（空） */}
              <div className="h-[64px] border-r bg-white" />

              {/* ← 都市名（国名）ヘッダー */}
              <div className="h-[64px] border-r bg-white flex items-center justify-center font-bold text-gray-800">
                {getCityName(tz)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== タイムライン本体 ===== */}
      <div
        className="grid border-t border-gray-200 pt-[20px]"
        style={{
          gridTemplateColumns: zones.map(() => '80px 1fr').join(' '),
        }}
      >
        {hours.map((h) => (
          <div key={h} className="contents">
            {zones.map((tz) => {
              const base = dayjs(dateISO)
                .tz('Asia/Tokyo')
                .hour(h)
                .minute(0)
                .second(0);
              const local = base.tz(tz);

              return (
                <div key={`${tz}-${h}`} className="contents">
                  {/* 時間セル */}
                  <div className="h-16 border-b border-gray-200 flex items-start justify-end pr-2 text-gray-700 text-sm font-medium relative">
                    <span className="absolute top-0 -translate-y-1/2">
                      {local.format('HH:mm')}
                    </span>
                  </div>

                  {/* 予定欄セル */}
                  <div className="h-16 border-b border-r border-gray-200 bg-white" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* タイムゾーン選択モーダル */}
      <TimezoneSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleTimezoneSelect}
        existingTimezones={zones}
      />
    </main>
  );
}
