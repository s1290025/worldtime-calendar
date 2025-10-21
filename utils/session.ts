// セッション管理ユーティリティ

export interface UserData {
  name: string;
  country: string;
  timezone: string;
  color: string;
  loginTime?: number;
}

export const SESSION_KEY = 'user';
export const SESSION_EXPIRY_KEY = 'user_expiry';

// セッションの有効期限（24時間）
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function saveUserSession(userData: UserData): void {
  const sessionData = {
    ...userData,
    loginTime: Date.now()
  };
  
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  sessionStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + SESSION_DURATION).toString());
}

export function getUserSession(): UserData | null {
  try {
    const userData = sessionStorage.getItem(SESSION_KEY);
    const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (!userData || !expiryTime) {
      return null;
    }
    
    // セッションの有効期限をチェック
    if (Date.now() > parseInt(expiryTime)) {
      clearUserSession();
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user session:', error);
    clearUserSession();
    return null;
  }
}

export function clearUserSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_EXPIRY_KEY);
}

export function isSessionValid(): boolean {
  return getUserSession() !== null;
}

export function getSessionTimeRemaining(): number {
  const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiryTime) return 0;
  
  const remaining = parseInt(expiryTime) - Date.now();
  return Math.max(0, remaining);
}
