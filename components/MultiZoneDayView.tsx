'use client';

import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from '@/utils/time';
import { Plus, ArrowLeft } from 'lucide-react';
import { getUserSession } from '@/utils/session';
import { TIMEZONE_OPTIONS } from '@/utils/timezones';
import TimezoneSelectorModal from './TimezoneSelectorModal';
import EventForm from './EventForm';
import { getEventsForDate } from '@/utils/events';

type Props = {
  dateISO: string;
  baselineTz?: string;
};

export default function MultiZoneDayView({
  dateISO,
  baselineTz = 'Asia/Tokyo',
}: Props) {
  const router = useRouter();
  
  const [zones, setZones] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const globalHeaderRef = useRef<HTMLDivElement>(null);
  const zoneHeaderRowRef = useRef<HTMLDivElement>(null);
  
  // localStorageから読み込む
  useEffect(() => {
    const savedZones = localStorage.getItem('dayview_zones');
    
    if (savedZones) {
      try {
        const parsed = JSON.parse(savedZones);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setZones(parsed);
        } else {
          // 空の場合、デフォルト値を設定
          const userSession = getUserSession();
          setZones([userSession?.timezone || baselineTz]);
        }
      } catch (e) {
        console.error('Failed to parse saved zones:', e);
        const userSession = getUserSession();
        setZones([userSession?.timezone || baselineTz]);
      }
    } else {
      // localStorageにない場合
      const userSession = getUserSession();
      setZones([userSession?.timezone || baselineTz]);
    }
  }, [baselineTz, dateISO]);
  
  // タイムゾーンの変更をlocalStorageに保存
  const handleTimezoneSelect = (timezone: string) => {
    const newZones = [...zones, timezone];
    setZones(newZones);
    localStorage.setItem('dayview_zones', JSON.stringify(newZones));
  };


  // ✅ 各ヘッダーの高さを取得し、Sticky位置を動的に調整
  useLayoutEffect(() => {
    const updateHeights = () => {
      const gh = globalHeaderRef.current?.offsetHeight ?? 0;
      const zh = zoneHeaderRowRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--globalH', `${gh}px`);
      document.documentElement.style.setProperty('--zoneH', `${zh}px`);
      document.documentElement.style.setProperty('--zonesTop', `${gh}px`);
    };
    updateHeights();
    window.addEventListener('resize', updateHeights);
    const obs = new ResizeObserver(updateHeights);
    if (zoneHeaderRowRef.current) obs.observe(zoneHeaderRowRef.current);
    return () => {
      window.removeEventListener('resize', updateHeights);
      obs.disconnect();
    };
  }, []);

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0-24時を表示

  const handleAddZone = () => {
    setIsModalOpen(true);
  };
  
  const handleEventFormClose = () => {
    setIsEventFormOpen(false);
  };

  const handleEventSave = () => {
    // 予定が保存された時の処理（再レンダリングをトリガー）
    setZones([...zones]); // 強制的に再レンダリング
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

  // タイムゾーンから都市名と国名を取得
  const getCityName = (timezone: string): string => {
    const timezoneOption = TIMEZONE_OPTIONS.find(option => option.value === timezone);
    if (timezoneOption) {
      // ラベルから都市名と国名を抽出（例：「東京 (日本)」→「東京（日本）」）
      const match = timezoneOption.label.match(/^([^(]+)\s*\(([^)]+)\)/);
      if (match) {
        const cityName = match[1].trim();
        const countryName = match[2].trim();
        return `${cityName}（${countryName}）`;
      }
      // 括弧がない場合はそのまま返す
      return timezoneOption.label;
    }
    // フォールバック：タイムゾーン文字列から最後の部分を取得
    return timezone.split('/').pop() || timezone;
  };


  return (
    <main className="min-h-screen bg-white">
      {/* ===== 日付ヘッダー ===== */}
      <div
        ref={globalHeaderRef}
        className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/calendar')}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            title="月カレンダーに戻る"
          >
            <ArrowLeft size={16} />
            月カレンダー
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {dayjs(dateISO).format('YYYY年MM月DD日（ddd）')}
          </h2>
        </div>
        <button
          onClick={handleAddZone}
          className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition"
          title="国を追加"
        >
          <Plus size={18} />
          国を追加
        </button>
      </div>

      {/* ===== タイムゾーンヘッダー ===== */}
      <div
        ref={zoneHeaderRowRef}
        className="sticky z-20 bg-white border-b"
        style={{
          top: 'var(--zonesTop)',
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: zones.map(() => '80px 1fr').join(' '),
          }}
        >
          {zones.map((tz) => (
            <React.Fragment key={tz}>
              {/* ← 時間列ヘッダー（空） */}
              <div className="h-[64px] border-r bg-white" />

              {/* ← 都市名（国名）ヘッダー */}
              <div className="h-[64px] border-r bg-white flex items-center justify-center font-bold text-gray-800">
                {getCityName(tz)}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== タイムライン本体 ===== */}
      <div className="border-t border-gray-200 pt-[20px]">
        {hours.map((rowHour) => (
          <div key={rowHour} className="flex">
            {/* 時間列 */}
            <div className="w-20 border-b border-gray-200 flex items-start justify-end pr-2 text-sm font-medium relative h-16">
              <span className="absolute top-0 -translate-y-1/2">
                {rowHour === 24 ? '24:00' : `${rowHour}:00`}
              </span>
            </div>
            
            {/* 各タイムゾーンの列 */}
            {zones.map((tz) => {
              // baselineのrowHour時をこのタイムゾーンに変換
              const baselineDayStart = dayjs(dateISO).tz(baselineTz).startOf('day');
              const baselineTimeAtRow = rowHour === 24 ? baselineDayStart.add(24, 'hour') : baselineDayStart.add(rowHour, 'hour');
              const tzTimeAtRow = baselineTimeAtRow.tz(tz);
              
              const tzDayAtRow = tzTimeAtRow.format('YYYY-MM-DD');
              const tzHourAtRow = tzTimeAtRow.hour();
              
              // 基準日をはみ出しているかチェック
              const isPreviousDay = tzDayAtRow < dateISO;
              const isNextDay = tzDayAtRow > dateISO;
              const isOutOfRange = isPreviousDay || isNextDay;
              
              // 予定を取得
              const userSession = getUserSession();
              const timezone = userSession?.timezone || baselineTz;
              const eventsInThisHour = getEventsForDate(dateISO, timezone).filter(event => {
                const eventStart = dayjs(event.startTime);
                const eventEnd = dayjs(event.endTime);
                const hourStart = baselineTimeAtRow.startOf('hour');
                const hourEnd = baselineTimeAtRow.endOf('hour');
                
                return eventStart.isBefore(hourEnd) && eventEnd.isAfter(hourStart);
              });
              
              return (
                <div
                  key={`${tz}-${rowHour}`}
                  className={`flex-1 border-b border-r border-gray-200 relative h-16 ${
                    isOutOfRange ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {/* 時刻表示 */}
                  <span className={`text-xs ml-1 ${isOutOfRange ? 'text-gray-400 opacity-50' : 'text-gray-900'}`}>
                    {tzHourAtRow}:00
                  </span>
                  
                  {/* 予定表示 */}
                  {eventsInThisHour.map(event => (
                    <div
                      key={event.id}
                      className="absolute inset-x-0 top-0 h-full text-xs p-1 rounded font-semibold shadow-sm overflow-hidden"
                      style={{
                        backgroundColor: event.color,
                        color: getContrastColor(event.color),
                        height: '100%'
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
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
      
      {/* 予定入力フォーム */}
      <EventForm
        isOpen={isEventFormOpen}
        onClose={handleEventFormClose}
        onSave={handleEventSave}
        initialDate={dateISO}
        initialTimezone={baselineTz}
      />
      
      {/* フローティングアクションボタン - 予定追加 */}
      <button
        onClick={() => {
          console.log('予定追加ボタンがクリックされました');
          setIsEventFormOpen(true);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 hover:shadow-blue-500/50 transition-all hover:scale-110 flex items-center justify-center z-50"
        title="予定を追加"
        style={{
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 10px 10px -5px rgba(59, 130, 246, 0.2)'
        }}
      >
        <Plus size={28} strokeWidth={3} />
      </button>
    </main>
  );
}
