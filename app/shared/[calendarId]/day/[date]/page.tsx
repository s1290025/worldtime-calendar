'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSharedCalendars, getShareSession, type SharedCalendar, type ShareSession, type SharedUser } from '@/utils/share';
import { getUserSession } from '@/utils/session';
import { getEvents, type Event } from '@/utils/events';
import { TIMEZONE_OPTIONS } from '@/utils/timezones';
import dayjs from '@/utils/time';
import { Plus, ArrowLeft, Users, Calendar } from 'lucide-react';
import TimezoneSelectorModal from '@/components/TimezoneSelectorModal';
import EventForm from '@/components/EventForm';

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
  const [events, setEvents] = useState<Event[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [visibleDates, setVisibleDates] = useState<Record<string, string>>({});
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; time: string; timezone: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

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

  // 予定を取得
  useEffect(() => {
    const allEvents = getEvents();
    setEvents(allEvents);
  }, [dateISO]);
  
  // 初期スクロール位置を24時の位置に設定
  useEffect(() => {
    if (timelineRef.current) {
      // 24時の位置にスクロール（-24から数えて24番目）
      timelineRef.current.scrollTop = 24 * 64; // 64pxは各行の高さ
    }
  }, [isInitialized]);
  
  // スクロール位置を監視して日付を更新
  useEffect(() => {
    const scrollContainer = timelineRef.current;
    if (!scrollContainer) return;
    
    const updateVisibleDates = () => {
      const scrollTop = scrollContainer.scrollTop;
      const rowIndex = Math.floor(scrollTop / 64); // 64pxは各行の高さ
      const rowHour = -24 + rowIndex; // -24から始まる
      
      // 各タイムゾーンの日付を計算
      const dates: Record<string, string> = {};
      
      zones.forEach((tz) => {
        const baselineDayStart = dayjs(dateISO).tz('Asia/Tokyo').startOf('day');
        let baselineTimeAtRow;
        
        if (rowHour < 0) {
          baselineTimeAtRow = baselineDayStart.add(rowHour, 'hour');
        } else if (rowHour >= 25) {
          baselineTimeAtRow = baselineDayStart.add(rowHour - 24, 'hour').add(1, 'day');
        } else if (rowHour === 24) {
          baselineTimeAtRow = baselineDayStart.add(24, 'hour');
        } else {
          baselineTimeAtRow = baselineDayStart.add(rowHour, 'hour');
        }
        
        const tzTimeAtRow = baselineTimeAtRow.tz(tz);
        const tzDate = tzTimeAtRow.format('M/D');
        dates[tz] = tzDate;
      });
      
      setVisibleDates(dates);
    };
    
    updateVisibleDates();
    scrollContainer.addEventListener('scroll', updateVisibleDates);
    
    return () => {
      scrollContainer.removeEventListener('scroll', updateVisibleDates);
    };
  }, [zones, dateISO]);

  const handleAddZone = () => {
    setIsModalOpen(true);
  };

  const handleTimezoneSelect = (timezone: string) => {
    const newZones = [...zones, timezone];
    setZones(newZones);
    localStorage.setItem('shared_dayview_zones', JSON.stringify(newZones));
  };

  const handleCellClick = (date: string, hour: number, timezone: string) => {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    setSelectedDateTime({ date, time, timezone });
    setIsEventFormOpen(true);
  };

  const handleEventSave = () => {
    // イベントリストを更新
    const allEvents = getEvents();
    setEvents(allEvents);
  };

  const handleAddEvent = () => {
    // 現在の日付とデフォルトのタイムゾーンで予定を追加
    const defaultTz = zones[0] || 'Asia/Tokyo';
    setSelectedDateTime({ 
      date: dateISO, 
      time: '09:00', 
      timezone: defaultTz 
    });
    setSelectedEvent(undefined);
    setIsEventFormOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素のクリックイベントを防ぐ
    setSelectedEvent(event);
    setSelectedDateTime(null);
    setIsEventFormOpen(true);
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

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0-24時

  return (
    <main className="h-screen flex flex-col bg-white">
      {/* ===== ヘッダー ===== */}
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
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddEvent}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
            title="予定を追加"
          >
            <Calendar size={18} />
            予定を追加
          </button>
          <button
            onClick={handleAddZone}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
          >
            <Plus size={18} />
            国を追加
          </button>
        </div>
      </div>

      {/* ===== 参加者一覧 + タイムゾーンヘッダー（スクロール時も固定） ===== */}
      <div className="sticky top-[60px] z-20 bg-white">
        {/* 参加者一覧 */}
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
        
        {/* タイムゾーンヘッダー */}
        <div className="border-b bg-white shadow-sm">
          <div
            className="grid"
            style={{
              gridTemplateColumns: zones.map(() => '80px 1fr').join(' '),
            }}
          >
            {/* 各タイムゾーンのヘッダー */}
            {zones.map((tz) => {
              const timezoneOption = TIMEZONE_OPTIONS.find(option => option.value === tz);
              let cityName = '';
              let countryName = '';
              
              if (timezoneOption) {
                const match = timezoneOption.label.match(/^([^(]+)\s*\(([^)]+)\)/);
                if (match) {
                  cityName = match[1].trim();
                  countryName = match[2].trim();
                } else {
                  cityName = timezoneOption.label;
                  countryName = '';
                }
              } else {
                cityName = tz.split('/').pop() || tz;
                countryName = '';
              }
              
              // 表示されている日付を取得（スクロール位置から）
              const tzDate = visibleDates[tz] || dayjs(dateISO).format('M/D');
              
              return (
                <React.Fragment key={tz}>
                  {/* 日付セル */}
                  <div className="h-[60px] border-r bg-white flex items-center justify-center">
                    <div className="text-xs font-bold text-blue-600">{tzDate}</div>
                  </div>
                  
                  {/* 国名セル */}
                  <div className="h-[60px] border-r bg-white flex flex-col items-center justify-center">
                    <div className="font-bold text-gray-800 text-sm">{cityName}</div>
                    <div className="text-xs text-gray-500">{countryName}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== タイムライン本体（スクロール可能） ===== */}
      <div ref={timelineRef} className="flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: zones.map(() => '80px 1fr').join(' ') }}>
        {/* 前後1日分（-24から48まで、72時間分）を表示 */}
        {(() => {
          // 各タイムゾーンで全体のイベントをレイアウト
          const eventLayouts: Record<string, any[]> = {};
          
          zones.forEach((tz) => {
            const tzEventLayout: any[] = [];
            const tzEvents = events.map(event => ({
              ...event,
              startTime: dayjs(event.startTime).tz(tz).toISOString(),
              endTime: dayjs(event.endTime).tz(tz).toISOString(),
            }));

            // 時間順でソート
            const sorted = [...tzEvents].sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            type LEvent = any & { col: number; cols: number };
            const placed: LEvent[] = [];
            const active: LEvent[] = [];

            const isOverlap = (a: any, b: any) =>
              !(new Date(a.endTime) <= new Date(b.startTime) || new Date(b.endTime) <= new Date(a.startTime));

            for (const ev of sorted) {
              // 終了したものをactiveから外す
              for (let i = active.length - 1; i >= 0; i--) {
                if (new Date(active[i].endTime) <= new Date(ev.startTime)) active.splice(i, 1);
              }
              
              // 使える列を探す
              const usedCols = new Set(active.map(e => e.col));
              let col = 0;
              while (usedCols.has(col)) col++;

              const lev: LEvent = { ...ev, col, cols: 1 };
              active.push(lev);
              placed.push(lev);

              // 同一クラスタに属するイベントの最大列数を更新
              const cluster = placed.filter(e => isOverlap(e, ev));
              const maxCols = Math.max(...cluster.map(e => e.col)) + 1;
              cluster.forEach(e => (e.cols = Math.max(e.cols, maxCols)));
            }
            
            eventLayouts[tz] = placed;
          });

          const displayHours = [];
          for (let h = -24; h <= 48; h++) {
            displayHours.push(h);
          }
          
          return displayHours.flatMap((rowHour) => {
            // 各タイムゾーンの列
            return zones.flatMap((tz) => {
              const baselineDayStart = dayjs(dateISO).tz('Asia/Tokyo').startOf('day');
              let baselineTimeAtRow;
              
              if (rowHour < 0) {
                baselineTimeAtRow = baselineDayStart.add(rowHour, 'hour');
              } else if (rowHour >= 25) {
                baselineTimeAtRow = baselineDayStart.add(rowHour - 24, 'hour').add(1, 'day');
              } else if (rowHour === 24) {
                baselineTimeAtRow = baselineDayStart.add(24, 'hour');
              } else {
                baselineTimeAtRow = baselineDayStart.add(rowHour, 'hour');
              }
              
              const tzTimeAtRow = baselineTimeAtRow.tz(tz);
              const tzHour = tzTimeAtRow.hour();
              const tzDayAtRow = tzTimeAtRow.format('YYYY-MM-DD');
              
              // dateISOのその日の0-24時以内かどうかを判定
              // 各タイムゾーンでのdateISOの0-24時を取得
              const tzDayStart = dayjs.tz(dateISO, tz).startOf('day');
              const tzDayEnd = tzDayStart.add(24, 'hour');
              const isInRange = (tzTimeAtRow.isSame(tzDayStart) || tzTimeAtRow.isAfter(tzDayStart)) && tzTimeAtRow.isBefore(tzDayEnd);
              const isOutOfRange = !isInRange;
              
              // 前の時刻を計算（日付が変わったかチェック）
              const prevBaselineTime = baselineTimeAtRow.subtract(1, 'hour');
              const prevTzTime = prevBaselineTime.tz(tz);
              const prevTzDay = prevTzTime.format('YYYY-MM-DD');
              const isDateChanged = tzDayAtRow !== prevTzDay;
              
              // この時間帯に該当する予定を取得（レイアウト済み）
              const hourStart = tzTimeAtRow.startOf('hour');
              const hourEnd = tzTimeAtRow.endOf('hour');
              const tzLayout = eventLayouts[tz] || [];
              const hourEvents = tzLayout.filter(event => {
                const eventStart = dayjs(event.startTime).tz(tz);
                const eventEnd = dayjs(event.endTime).tz(tz);
                return eventStart.isBefore(hourEnd) && eventEnd.isAfter(hourStart);
              });
              
              return [
                // 時刻列
                <div key={`time-${tz}-${rowHour}`} className={`border-b border-r border-gray-200 h-16 relative ${
                  isOutOfRange ? 'bg-gray-50' : 'bg-white'
                }`}>
                  {/* 時刻 */}
                  <div className={`absolute top-0 right-0 pr-2 text-sm font-medium ${
                    isOutOfRange ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {tzHour}:00
                  </div>
                  
                  {/* 日付（変わった場合のみ表示） */}
                  {isDateChanged && (
                    <div className="absolute top-0 left-0 pl-1 pt-0.5">
                      <span className="text-xs font-bold text-blue-600">
                        {dayjs(tzDayAtRow).format('M/D')}
                      </span>
                    </div>
                  )}
                </div>,
                // イベント列
                <div 
                  key={`event-${tz}-${rowHour}`} 
                  className={`border-b border-r border-gray-200 h-16 cursor-pointer hover:bg-gray-100 relative overflow-hidden ${
                    isOutOfRange ? 'bg-gray-50' : 'bg-white'
                  }`}
                  onClick={() => {
                    if (!isOutOfRange && hourEvents.length === 0) {
                      const tzDateStr = tzTimeAtRow.format('YYYY-MM-DD');
                      handleCellClick(tzDateStr, tzHour, tz);
                    }
                  }}
                >
                  {hourEvents.map((event, idx) => {
                    const widthPct = 100 / (event.cols || 1);
                    const leftPct = (event.col || 0) * widthPct;
                    
                    return (
                      <div
                        key={event.id}
                        className="px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-70 absolute z-10"
                        style={{
                          backgroundColor: event.color + '20',
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: `${idx * 16}px`,
                          height: '60px',
                        }}
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event, e);
                        }}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                </div>,
              ];
            });
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

      {/* イベントフォーム */}
      {isEventFormOpen && (
        <EventForm
          isOpen={isEventFormOpen}
          onClose={() => {
            setIsEventFormOpen(false);
            setSelectedDateTime(null);
            setSelectedEvent(undefined);
          }}
          onSave={handleEventSave}
          event={selectedEvent}
          initialDate={selectedDateTime?.date}
          initialTime={selectedDateTime?.time}
          initialTimezone={selectedDateTime?.timezone}
        />
      )}
    </main>
  );
}
