// 予定管理ユーティリティ

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
  const targetDate = new Date(dateISO);
  
  return events.filter(event => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    // 日付が予定の開始日と終了日の間に含まれるかチェック
    return eventStart <= targetDate && eventEnd >= targetDate;
  });
}

// 予定フォームデータからEventオブジェクトを作成
export function createEventFromForm(formData: EventFormData, userColor: string): Event {
  const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
  const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
  
  return {
    id: generateEventId(),
    title: formData.title,
    description: formData.description,
    startTime: startDateTime,
    endTime: endDateTime,
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
    }
  } catch (error) {
    console.error('Error updating event:', error);
  }
}
