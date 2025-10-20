'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import dayjs from '@/utils/time';
import { Plus } from 'lucide-react';

type Props = {
  dateISO: string;
  baselineTz?: string;
};

export default function MultiZoneDayView({
  dateISO,
  baselineTz = 'Asia/Tokyo',
}: Props) {
  const [zones, setZones] = useState(['Asia/Tokyo', 'America/New_York']);
  const globalHeaderRef = useRef<HTMLDivElement>(null);
  const zoneHeaderRowRef = useRef<HTMLDivElement>(null);

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

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const addZone = () => {
    const candidates = [
      'Europe/London',
      'Australia/Sydney',
      'Asia/Shanghai',
      'America/Los_Angeles',
    ];
    const next = candidates.find((z) => !zones.includes(z));
    if (next) setZones((prev) => [...prev, next]);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ===== 日付ヘッダー ===== */}
      <div
        ref={globalHeaderRef}
        className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex justify-between items-center"
      >
        <h2 className="text-2xl font-bold text-gray-800">
          {dayjs(dateISO).format('YYYY年MM月DD日（ddd）')}
        </h2>
        <button
          onClick={addZone}
          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
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

              {/* ← 国名ヘッダー */}
              <div className="h-[64px] border-r bg-white flex items-center justify-center font-bold text-gray-800">
                {tz}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ===== タイムライン本体 ===== */}
      <div
        className="grid border-t border-gray-200 pt-[20px]" // ← 上の隙間を確保して見切れ防止
        style={{
          gridTemplateColumns: zones.map(() => '80px 1fr').join(' '),
        }}
      >
        {hours.map((h) => (
          <React.Fragment key={h}>
            {zones.map((tz) => {
              const base = dayjs(dateISO)
                .tz(baselineTz)
                .hour(h)
                .minute(0)
                .second(0);
              const local = base.tz(tz);

              return (
                <React.Fragment key={`${tz}-${h}`}>
                  {/* 時間セル（線の高さに合わせる） */}
                  <div className="h-16 border-b border-gray-200 flex items-start justify-end pr-2 text-gray-700 text-sm font-medium relative">
                    <span className="absolute top-0 -translate-y-1/2">
                      {local.format('HH:mm')}
                    </span>
                  </div>

                  {/* 予定欄セル */}
                  <div className="h-16 border-b border-r border-gray-200 bg-white" />
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
