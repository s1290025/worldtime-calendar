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
    <main className="h-screen flex flex-col bg-white">
      {/* ===== ヘッダー ===== */}
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
            gridTemplateColumns: `80px ${zones.map(() => '80px 1fr').join(' ')}`,
          }}
        >
          {/* 左端の時刻列ヘッダー（空） */}
          <div className="h-[64px] border-r bg-white" />
          
          {/* 各タイムゾーンのヘッダー */}
          {zones.map((tz) => {
            const tzDayStart = dayjs(dateISO).tz(tz).startOf('day');
            const tzDate = dayjs(tzDayStart).format('MM/DD(ddd)');
            
            return (
              <React.Fragment key={tz}>
                {/* 時刻列ヘッダー: 日付と都市名 */}
                <div className="h-[64px] border-r bg-white flex items-center justify-center font-bold text-gray-800">
                  <div className="text-center">
                    <div>{tzDate}</div>
                    <div className="text-sm font-normal">{getCityName(tz)}</div>
                  </div>
                </div>

                {/* イベント列ヘッダー（空） */}
                <div className="h-[64px] border-r bg-white" />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ===== タイムライン本体（スクロール可能） ===== */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200 pt-[20px]">
        <div className="grid" style={{ gridTemplateColumns: `80px ${zones.map(() => '80px 1fr').join(' ')}` }}>
        {/* 各行: 各タイムゾーンの0-24時を含む範囲を表示 */}
        {(() => {
          // 各タイムゾーンの0-24時をbaselineに変換して、最小・最大時刻を求める
          let minHour = Infinity;
          let maxHour = -Infinity;
          
          zones.forEach((tz) => {
            const tzDayStart = dayjs(dateISO).tz(tz).startOf('day');
            hours.forEach(tzHour => {
              const tzTime = tzHour === 24 ? tzDayStart.add(24, 'hour') : tzDayStart.add(tzHour, 'hour');
              const baselineTime = tzTime.tz(baselineTz);
              const baselineDay = baselineTime.format('YYYY-MM-DD');
              const baselineHour = baselineTime.hour();
              
              let normalizedHour;
              if (baselineDay < dateISO) {
                normalizedHour = baselineHour; // 前日
              } else if (baselineDay > dateISO) {
                normalizedHour = baselineHour + 24; // 翌日
              } else {
                normalizedHour = baselineHour; // 当日
              }
              
              minHour = Math.min(minHour, normalizedHour);
              maxHour = Math.max(maxHour, normalizedHour);
            });
          });
          
          // 表示すべき行のリストを生成
          const displayHours: number[] = [];
          for (let h = minHour; h <= maxHour; h++) {
            displayHours.push(h);
          }
          
          return displayHours.map((baselineRowHour) => {
            const baselineDayStart = dayjs(dateISO).tz(baselineTz).startOf('day');
            let baselineTimeAtRow;
            
            if (baselineRowHour >= 25) {
              baselineTimeAtRow = baselineDayStart.add(baselineRowHour - 24, 'hour').add(1, 'day');
            } else if (baselineRowHour === 24) {
              baselineTimeAtRow = baselineDayStart.add(24, 'hour');
            } else {
              baselineTimeAtRow = baselineDayStart.add(baselineRowHour, 'hour');
            }
            
            const baselineRowDate = baselineTimeAtRow.format('YYYY-MM-DD');
            const isPreviousDay = baselineRowDate < dateISO;
            const isNextDay = baselineRowDate > dateISO;
            const isOutOfRange = isPreviousDay || isNextDay;
            
            return (
              <React.Fragment key={baselineRowHour}>
                {/* 左端のbaseline時刻列 */}
                <div className={`border-b border-gray-200 h-16 flex items-start justify-end pr-2 text-sm font-medium relative ${
                  isOutOfRange ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <span className={`absolute top-0 -translate-y-1/2 ${
                    isOutOfRange ? 'text-gray-400 opacity-50' : 'text-gray-700'
                  }`}>
                    {baselineRowHour >= 25 ? `${baselineRowHour}:00` : baselineRowHour === 24 ? '24:00' : `${baselineRowHour}:00`}
                  </span>
                </div>
                
                {/* 各タイムゾーンの時刻列とイベント列 */}
                {zones.map((tz) => {
                  const tzTimeAtRow = baselineTimeAtRow.tz(tz);
                  const tzHour = tzTimeAtRow.hour();
                  const tzDayAtRow = tzTimeAtRow.format('YYYY-MM-DD');
                  
                  const isPreviousDay = tzDayAtRow < dateISO;
                  const isNextDay = tzDayAtRow > dateISO;
                  const tzIsOutOfRange = isPreviousDay || isNextDay;
                  
                  // 前の時刻を計算（日付が変わったかチェック）
                  const prevBaselineTime = baselineTimeAtRow.subtract(1, 'hour');
                  const prevTzTime = prevBaselineTime.tz(tz);
                  const prevTzDay = prevTzTime.format('YYYY-MM-DD');
                  const isDateChanged = tzDayAtRow !== prevTzDay;
                  
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
                    <React.Fragment key={`${tz}-${baselineRowHour}`}>
                      {/* 時刻列 */}
                      <div className={`border-b border-r border-gray-200 h-16 flex items-start justify-end pr-2 text-sm font-medium relative ${
                        tzIsOutOfRange ? 'bg-gray-50' : 'bg-white'
                      }`}>
                        {/* 日付が変わった場合は日付を表示 */}
                        {isDateChanged && (
                          <span className="absolute left-1 top-0 text-xs font-bold text-blue-600">
                            {dayjs(tzDayAtRow).format('M/D')}
                          </span>
                        )}
                        <span className={`absolute top-0 -translate-y-1/2 ${tzIsOutOfRange ? 'text-gray-400 opacity-50' : 'text-gray-700'}`}>
                          {tzHour}:00
                        </span>
                      </div>
                      
                      {/* イベント列 */}
                      <div className={`border-b border-r border-gray-200 h-16 relative ${
                        tzIsOutOfRange ? 'bg-gray-50' : 'bg-white'
                      }`}>
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
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          });
        })()}
        </div>
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
