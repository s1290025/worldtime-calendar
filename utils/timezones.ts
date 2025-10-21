import moment from 'moment-timezone';

// 主要なタイムゾーンを国・地域別に整理
export interface TimezoneOption {
  value: string;
  label: string;
  country: string;
  offset: string;
}

// 主要なタイムゾーン一覧（国・地域別に整理）
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // 日本
  { value: 'Asia/Tokyo', label: '東京 (日本)', country: 'Japan', offset: '+09:00' },
  
  // アメリカ
  { value: 'America/New_York', label: 'ニューヨーク (アメリカ東部)', country: 'United States', offset: '-05:00/-04:00' },
  { value: 'America/Chicago', label: 'シカゴ (アメリカ中部)', country: 'United States', offset: '-06:00/-05:00' },
  { value: 'America/Denver', label: 'デンバー (アメリカ山岳部)', country: 'United States', offset: '-07:00/-06:00' },
  { value: 'America/Los_Angeles', label: 'ロサンゼルス (アメリカ西部)', country: 'United States', offset: '-08:00/-07:00' },
  { value: 'America/Anchorage', label: 'アンカレッジ (アラスカ)', country: 'United States', offset: '-09:00/-08:00' },
  { value: 'Pacific/Honolulu', label: 'ホノルル (ハワイ)', country: 'United States', offset: '-10:00' },
  
  // イギリス・ヨーロッパ
  { value: 'Europe/London', label: 'ロンドン (イギリス)', country: 'United Kingdom', offset: '+00:00/+01:00' },
  { value: 'Europe/Paris', label: 'パリ (フランス)', country: 'France', offset: '+01:00/+02:00' },
  { value: 'Europe/Berlin', label: 'ベルリン (ドイツ)', country: 'Germany', offset: '+01:00/+02:00' },
  { value: 'Europe/Rome', label: 'ローマ (イタリア)', country: 'Italy', offset: '+01:00/+02:00' },
  { value: 'Europe/Madrid', label: 'マドリード (スペイン)', country: 'Spain', offset: '+01:00/+02:00' },
  { value: 'Europe/Amsterdam', label: 'アムステルダム (オランダ)', country: 'Netherlands', offset: '+01:00/+02:00' },
  { value: 'Europe/Stockholm', label: 'ストックホルム (スウェーデン)', country: 'Sweden', offset: '+01:00/+02:00' },
  { value: 'Europe/Moscow', label: 'モスクワ (ロシア)', country: 'Russia', offset: '+03:00' },
  
  // アジア
  { value: 'Asia/Shanghai', label: '上海 (中国)', country: 'China', offset: '+08:00' },
  { value: 'Asia/Hong_Kong', label: '香港', country: 'Hong Kong', offset: '+08:00' },
  { value: 'Asia/Taipei', label: '台北 (台湾)', country: 'Taiwan', offset: '+08:00' },
  { value: 'Asia/Seoul', label: 'ソウル (韓国)', country: 'South Korea', offset: '+09:00' },
  { value: 'Asia/Singapore', label: 'シンガポール', country: 'Singapore', offset: '+08:00' },
  { value: 'Asia/Bangkok', label: 'バンコク (タイ)', country: 'Thailand', offset: '+07:00' },
  { value: 'Asia/Jakarta', label: 'ジャカルタ (インドネシア)', country: 'Indonesia', offset: '+07:00' },
  { value: 'Asia/Manila', label: 'マニラ (フィリピン)', country: 'Philippines', offset: '+08:00' },
  { value: 'Asia/Kolkata', label: 'コルカタ (インド)', country: 'India', offset: '+05:30' },
  { value: 'Asia/Dubai', label: 'ドバイ (UAE)', country: 'United Arab Emirates', offset: '+04:00' },
  
  // オセアニア
  { value: 'Australia/Sydney', label: 'シドニー (オーストラリア東部)', country: 'Australia', offset: '+10:00/+11:00' },
  { value: 'Australia/Melbourne', label: 'メルボルン (オーストラリア東部)', country: 'Australia', offset: '+10:00/+11:00' },
  { value: 'Australia/Perth', label: 'パース (オーストラリア西部)', country: 'Australia', offset: '+08:00' },
  { value: 'Australia/Adelaide', label: 'アデレード (オーストラリア中部)', country: 'Australia', offset: '+09:30/+10:30' },
  { value: 'Pacific/Auckland', label: 'オークランド (ニュージーランド)', country: 'New Zealand', offset: '+12:00/+13:00' },
  
  // カナダ
  { value: 'America/Toronto', label: 'トロント (カナダ東部)', country: 'Canada', offset: '-05:00/-04:00' },
  { value: 'America/Vancouver', label: 'バンクーバー (カナダ西部)', country: 'Canada', offset: '-08:00/-07:00' },
  { value: 'America/Montreal', label: 'モントリオール (カナダ東部)', country: 'Canada', offset: '-05:00/-04:00' },
  
  // ブラジル
  { value: 'America/Sao_Paulo', label: 'サンパウロ (ブラジル)', country: 'Brazil', offset: '-03:00' },
  { value: 'America/Rio_de_Janeiro', label: 'リオデジャネイロ (ブラジル)', country: 'Brazil', offset: '-03:00' },
  
  // その他
  { value: 'Africa/Cairo', label: 'カイロ (エジプト)', country: 'Egypt', offset: '+02:00' },
  { value: 'Africa/Johannesburg', label: 'ヨハネスブルグ (南アフリカ)', country: 'South Africa', offset: '+02:00' },
  { value: 'America/Mexico_City', label: 'メキシコシティ (メキシコ)', country: 'Mexico', offset: '-06:00/-05:00' },
  { value: 'America/Argentina/Buenos_Aires', label: 'ブエノスアイレス (アルゼンチン)', country: 'Argentina', offset: '-03:00' },
];

// 国別にグループ化したタイムゾーン一覧を取得
export function getTimezonesByCountry(): Record<string, TimezoneOption[]> {
  const grouped: Record<string, TimezoneOption[]> = {};
  
  TIMEZONE_OPTIONS.forEach(tz => {
    if (!grouped[tz.country]) {
      grouped[tz.country] = [];
    }
    grouped[tz.country].push(tz);
  });
  
  return grouped;
}

// 国一覧を取得（アルファベット順）
export function getCountries(): string[] {
  const countries = Array.from(new Set(TIMEZONE_OPTIONS.map(tz => tz.country)));
  return countries.sort();
}

// 特定の国のタイムゾーン一覧を取得
export function getTimezonesForCountry(country: string): TimezoneOption[] {
  return TIMEZONE_OPTIONS.filter(tz => tz.country === country);
}

// タイムゾーンから現在時刻を取得
export function getCurrentTimeInTimezone(timezone: string): string {
  return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
}

// タイムゾーンのオフセットを取得
export function getTimezoneOffset(timezone: string): string {
  return moment().tz(timezone).format('Z');
}
