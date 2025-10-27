'use client';

import { useEffect, useMemo, useRef } from 'react';
import dayjs from '@/utils/time';

type CalEvent = {
  id: string;
  title: string;
  start: string; // ISO: "2025-10-22T13:30:00"
  end: string;   // ISO
  color?: string;
};

// --- 設定 ---
const HOUR_HEIGHT = 64;         // 1時間の高さ(px) Googleカレンダーっぽく
const START_HOUR = 0;           // 0:00開始
const END_HOUR = 24;            // 24:00まで
const GUTTER_WIDTH = 64;        // 左の時間目盛り幅

// 重なり解決: 同時間帯でぶつかるイベントを列分割する
function layoutEvents(events: CalEvent[]) {
  // ① 時間順でソート
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // ② アクティブなイベントを追跡しつつ列割り当て
  type LEvent = CalEvent & { col: number; cols: number };
  const placed: LEvent[] = [];
  const active: LEvent[] = [];

  const isOverlap = (a: CalEvent, b: CalEvent) =>
    !(new Date(a.end) <= new Date(b.start) || new Date(b.end) <= new Date(a.start));

  for (const ev of sorted) {
    // 終了したものをactiveから外す
    for (let i = active.length - 1; i >= 0; i--) {
      if (new Date(active[i].end) <= new Date(ev.start)) active.splice(i, 1);
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
  return placed;
}

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

export default function DayView({
  dateISO,
  events,
  timezone = 'Asia/Tokyo',
}: {
  dateISO: string;     // 例: "2025-10-22"
  events: CalEvent[];  // 当日のイベント配列
  timezone?: string;   // 表示タイムゾーン
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const dayStart = useMemo(
    () => dayjs.tz(`${dateISO}T00:00:00`, timezone).toDate(),
    [dateISO, timezone]
  );
  const dayEnd = useMemo(
    () => dayjs.tz(`${dateISO}T23:59:59`, timezone).toDate(),
    [dateISO, timezone]
  );

  // 当日イベントだけに絞る（はみ出しは切り詰め）
  const dayEvents = useMemo<CalEvent[]>(() => {
    return events
      .map(ev => {
        const s = dayjs.tz(ev.start, timezone).toDate();
        const e = dayjs.tz(ev.end, timezone).toDate();
        if (e <= dayStart || s >= dayEnd) return null;
        const start = dayjs(Math.max(s.getTime(), dayStart.getTime())).toDate();
        const end = dayjs(Math.min(e.getTime(), dayEnd.getTime())).toDate();
        return { ...ev, start: start.toISOString(), end: end.toISOString() };
      })
      .filter(Boolean) as CalEvent[];
  }, [events, dayStart, dayEnd, timezone]);

  const laid = useMemo(() => layoutEvents(dayEvents), [dayEvents]);

  // 現在時刻ラインの位置（当日なら表示）
  const nowInfo = useMemo(() => {
    const now = dayjs().tz(timezone);
    const sameDay = now.format('YYYY-MM-DD') === dateISO;
    if (!sameDay) return null;
    const mins = minutesSinceMidnight(now.toDate());
    const top = (mins / 60) * HOUR_HEIGHT;
    return { top, label: now.format('HH:mm') };
  }, [dateISO, timezone]);

  // 初回、現在時刻付近へスクロール
  useEffect(() => {
    if (!containerRef.current || !nowInfo) return;
    containerRef.current.scrollTo({ top: Math.max(nowInfo.top - 200, 0), behavior: 'instant' as ScrollBehavior });
  }, [nowInfo]);

  // クリックで新規イベント入口（実装は後で）
  const handleCellClick = (_hour: number) => {
    // ここでモーダル起動などに繋げる
    // console.log('create at', hour, ':00');
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl border shadow">
      {/* ヘッダー（固定） */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {dayjs.tz(dateISO, timezone).format('YYYY年M月D日（ddd）')}
        </h2>
        <div className="text-sm text-gray-600">{timezone}</div>
      </div>

      {/* 本体：時間グリッド＆イベント */}
      <div ref={containerRef} className="relative h-[80vh] overflow-auto">
        {/* 左の時間目盛り */}
        <div
          className="absolute left-0 top-0 border-r text-xs text-gray-500 select-none"
          style={{ width: GUTTER_WIDTH }}
        >
          {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i).map(h => (
            <div
              key={h}
              className="relative"
              style={{ height: HOUR_HEIGHT, borderBottom: '1px solid #eee' }}
            >
              <div className="absolute -translate-y-2 right-2">{`${h}:00`}</div>
            </div>
          ))}
        </div>

        {/* 右側：時間セル（クリック可能） */}
        <div className="ml-[64px] relative">
          {/* グリッド背景 */}
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map(h => (
            <div
              key={h}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              style={{ height: HOUR_HEIGHT }}
              onClick={() => handleCellClick(h)}
            />
          ))}

          {/* 現在時刻ライン */}
          {nowInfo && (
            <>
              <div
                className="absolute left-0 right-0"
                style={{ top: nowInfo.top, height: 0 }}
              >
                <div className="ml-[-4px] w-2 h-2 rounded-full bg-red-500" />
                <div className="absolute left-0 right-0 h-[2px] bg-red-500" />
              </div>
            </>
          )}

          {/* イベント描画（絶対配置） */}
          {laid.map(ev => {
            const s = dayjs(ev.start).toDate();
            const e = dayjs(ev.end).toDate();
            const top =
              ((minutesSinceMidnight(s) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
            const height =
              ((minutesSinceMidnight(e) - minutesSinceMidnight(s)) / 60) *
              HOUR_HEIGHT;

            const widthPct = 100 / ev.cols;
            const leftPct = ev.col * widthPct;

            return (
              <div
                key={ev.id}
                className="absolute rounded-md px-2 py-1 text-xs text-white shadow"
                style={{
                  top,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: Math.max(height, 20),
                  backgroundColor: ev.color || '#3b82f6', // blue-500
                }}
                title={`${dayjs(ev.start).format('HH:mm')}–${dayjs(ev.end).format('HH:mm')}`}
              >
                <div className="font-semibold truncate">{ev.title}</div>
                <div className="opacity-90">
                  {dayjs(ev.start).format('HH:mm')}–{dayjs(ev.end).format('HH:mm')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
