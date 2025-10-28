// 予定管理ユーティリティ

import dayjs from '@/utils/time';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  timezone: string;
  color: string; // ユーザーカラー
  allDay?: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  timezone: string;
  allDay: boolean;
}

const EVENTS_KEY = 'calendar_events';

// 予定を保存
export function saveEvent(event: Event): void {
  try {
    const events = getEvents();
    const existingIndex = events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      events[existingIndex] = { ...event, updatedAt: new Date().toISOString() };
    } else {
      events.push(event);
    }
    
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    
    // カスタムイベントを発火して、月カレンダーなどに変更を通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eventsUpdated'));
    }
  } catch (error) {
    console.error('Error saving event:', error);
  }
}

// 予定を削除
export function deleteEvent(eventId: string): void {
  try {
    const events = getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(filteredEvents));
    
    // カスタムイベントを発火して、月カレンダーなどに変更を通知
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eventsUpdated'));
    }
  } catch (error) {
    console.error('Error deleting event:', error);
  }
}

// 全ての予定を取得
export function getEvents(): Event[] {
  try {
    const eventsJson = sessionStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// 特定の日付の予定を取得
export function getEventsForDate(dateISO: string, timezone: string): Event[] {
  const events = getEvents();
  
  return events.filter(event => {
    try {
      // 予定のタイムゾーンを取得
      const eventTimezone = event.timezone || 'Asia/Tokyo';
      
      // 予定のstartTime/endTimeを予定のタイムゾーンで解釈
      const eventStartLocal = dayjs.tz(event.startTime, eventTimezone);
      const eventEndLocal = dayjs.tz(event.endTime, eventTimezone);
      
      // ユーザーのタイムゾーンに変換
      const eventStart = eventStartLocal.tz(timezone);
      const eventEnd = eventEndLocal.tz(timezone);
      
      // 予定の開始日の日付部分を取得 (YYYY-MM-DD)
      const eventStartDate = eventStart.format('YYYY-MM-DD');
      const eventEndDate = eventEnd.format('YYYY-MM-DD');
      
      // dateISOが予定の範囲内にあるかチェック
      const matches = eventStartDate <= dateISO && dateISO <= eventEndDate;
      
      return matches;
    } catch (error) {
      // エラーが発生した場合は予定を除外
      console.error('Error filtering event:', error);
      return false;
    }
  });
}

// 予定フォームデータからEventオブジェクトを作成
export function createEventFromForm(formData: EventFormData, userColor: string): Event {
  // タイムゾーンを考慮してUTC時刻に変換
  const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
  const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
  
  // 指定されたタイムゾーンで解釈して、UTC時刻を取得
  const startTimeUTC = dayjs.tz(startDateTime, formData.timezone).utc().toISOString();
  const endTimeUTC = dayjs.tz(endDateTime, formData.timezone).utc().toISOString();
  
  return {
    id: generateEventId(),
    title: formData.title,
    description: formData.description,
    startTime: startTimeUTC,
    endTime: endTimeUTC,
    timezone: formData.timezone,
    color: userColor,
    allDay: formData.allDay,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ユニークなIDを生成
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 予定を更新
export function updateEvent(eventId: string, updates: Partial<Event>): void {
  try {
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex >= 0) {
      events[eventIndex] = {
        ...events[eventIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      
      // カスタムイベントを発火して、月カレンダーなどに変更を通知
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('eventsUpdated'));
      }
    }
  } catch (error) {
    console.error('Error updating event:', error);
  }
}
