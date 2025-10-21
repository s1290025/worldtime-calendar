// 共有システムユーティリティ

export interface SharedCalendar {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  createdBy: string;
  participants: SharedUser[];
}

export interface SharedUser {
  id: string;
  name: string;
  color: string;
  joinedAt: string;
  isActive: boolean;
}

export interface ShareSession {
  calendarId: string;
  userId: string;
  isHost: boolean;
}

const SHARED_CALENDARS_KEY = 'shared_calendars';
const SHARE_SESSION_KEY = 'share_session';

// 共有カレンダーを作成
export function createSharedCalendar(name: string, createdBy: string): SharedCalendar {
  const calendarId = generateCalendarId();
  const calendar: SharedCalendar = {
    id: calendarId,
    name,
    url: generateShareUrl(calendarId),
    createdAt: new Date().toISOString(),
    createdBy,
    participants: []
  };
  
  saveSharedCalendar(calendar);
  return calendar;
}

// 共有カレンダーを保存
export function saveSharedCalendar(calendar: SharedCalendar): void {
  try {
    const calendars = getSharedCalendars();
    const existingIndex = calendars.findIndex(c => c.id === calendar.id);
    
    if (existingIndex >= 0) {
      calendars[existingIndex] = calendar;
    } else {
      calendars.push(calendar);
    }
    
    sessionStorage.setItem(SHARED_CALENDARS_KEY, JSON.stringify(calendars));
  } catch (error) {
    console.error('Error saving shared calendar:', error);
  }
}

// 共有カレンダーを取得
export function getSharedCalendars(): SharedCalendar[] {
  try {
    const calendarsJson = sessionStorage.getItem(SHARED_CALENDARS_KEY);
    return calendarsJson ? JSON.parse(calendarsJson) : [];
  } catch (error) {
    console.error('Error getting shared calendars:', error);
    return [];
  }
}

// IDで共有カレンダーを検索
export function findCalendarById(calendarId: string): SharedCalendar | null {
  const calendars = getSharedCalendars();
  return calendars.find(c => c.id === calendarId) || null;
}

// 共有カレンダーにユーザーを追加
export function addUserToCalendar(calendarId: string, userName: string, userColor: string): SharedUser {
  const calendars = getSharedCalendars();
  const calendar = calendars.find(c => c.id === calendarId);
  
  if (!calendar) {
    throw new Error('Calendar not found');
  }
  
  const user: SharedUser = {
    id: generateUserId(),
    name: userName,
    color: userColor,
    joinedAt: new Date().toISOString(),
    isActive: true
  };
  
  calendar.participants.push(user);
  saveSharedCalendar(calendar);
  
  return user;
}

// 利用可能な色を取得（重複を避ける）
export function getAvailableColors(calendarId: string): string[] {
  const calendars = getSharedCalendars();
  const calendar = calendars.find(c => c.id === calendarId);
  
  if (!calendar) {
    return getAllColors();
  }
  
  const usedColors = calendar.participants.map(p => p.color);
  return getAllColors().filter(color => !usedColors.includes(color));
}

// 全ての色を取得
function getAllColors(): string[] {
  return [
    '#DC143C', // 赤
    '#FF8C00', // オレンジ
    '#FFD700', // 黄
    '#32CD32', // 黄緑
    '#228B22', // 緑
    '#0000FF', // 青
    '#00FFFF', // 水色
    '#8A2BE2', // 紫
    '#FF1493', // ピンク
    '#A0522D', // 茶色
  ];
}

// ランダムな利用可能な色を取得
export function getRandomAvailableColor(calendarId: string): string {
  const availableColors = getAvailableColors(calendarId);
  if (availableColors.length === 0) {
    // 全ての色が使用されている場合はランダムに選択
    const allColors = getAllColors();
    return allColors[Math.floor(Math.random() * allColors.length)];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

// 共有セッションを保存
export function saveShareSession(session: ShareSession): void {
  try {
    sessionStorage.setItem(SHARE_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving share session:', error);
  }
}

// 共有セッションを取得
export function getShareSession(): ShareSession | null {
  try {
    const sessionJson = sessionStorage.getItem(SHARE_SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Error getting share session:', error);
    return null;
  }
}

// 共有セッションをクリア
export function clearShareSession(): void {
  sessionStorage.removeItem(SHARE_SESSION_KEY);
}

// ユニークなIDを生成
function generateCalendarId(): string {
  return `calendar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 共有URLを生成
function generateShareUrl(calendarId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/shared/${calendarId}`;
}
