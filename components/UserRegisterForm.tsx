'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserSession, UserData } from '@/utils/session';
import { TIMEZONE_OPTIONS, getTimezonesByCountry, getCountries } from '@/utils/timezones';
import { UNIVERSAL_COLORS, getRandomColor } from '@/utils/colors';
import SearchableSelect from './SearchableSelect';

interface UserRegisterFormProps {
  onComplete?: (data: UserData) => void;
}

export default function UserRegisterForm({ onComplete }: UserRegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Japan');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [color, setColor] = useState(getRandomColor());
  const [isInitialColor, setIsInitialColor] = useState(true);
  
  const countries = getCountries();
  const timezonesByCountry = getTimezonesByCountry();
  
  // 国選択用のオプション配列を作成
  const countryOptions = countries.map(country => ({
    value: country,
    label: country
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const userData: UserData = { 
        name: name.trim(), 
        country, 
        timezone,
        color 
      };
      saveUserSession(userData);
      
      if (onComplete) {
        onComplete(userData);
      } else {
        router.push('/calendar');
      }
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    // 国が変更されたら、その国の最初のタイムゾーンを選択
    const countryTimezones = timezonesByCountry[newCountry];
    if (countryTimezones && countryTimezones.length > 0) {
      setTimezone(countryTimezones[0].value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          ユーザー登録
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              お名前
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ニックネーム"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900"
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              国・地域
            </label>
            <SearchableSelect
              options={countryOptions}
              value={country}
              onChange={handleCountryChange}
              placeholder="国・地域を選択してください"
              searchPlaceholder="国名で検索..."
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              タイムゾーン
            </label>
            <SearchableSelect
              options={timezonesByCountry[country]?.map(tz => ({
                value: tz.value,
                label: `${tz.label} (${tz.offset})`
              })) || []}
              value={timezone}
              onChange={setTimezone}
              placeholder="タイムゾーンを選択してください"
              searchPlaceholder="都市名で検索..."
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              ユーザーカラー
            </label>
            
             {/* ユニバーサルカラー選択 */}
             <div className="mt-2">
               <div className="grid grid-cols-5 gap-2 mb-3">
                 {UNIVERSAL_COLORS.map((colorOption) => (
                   <button
                     key={colorOption.value}
                     type="button"
                     onClick={() => {
                       setColor(colorOption.value);
                       setIsInitialColor(false);
                     }}
                     className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                       color === colorOption.value 
                         ? 'border-gray-800 ring-2 ring-gray-300' 
                         : 'border-gray-300 hover:border-gray-400'
                     }`}
                     style={{ backgroundColor: colorOption.value }}
                     title={`${colorOption.name} - ${colorOption.description}`}
                   />
                 ))}
              </div>
            </div>

             {/* カスタムカラー選択 */}
             <div className="mt-3">
               <p className="text-sm text-gray-600 mb-2">カスタム</p>
               <input
                 id="color"
                 type="color"
                 value={color}
                 onChange={(e) => {
                   setColor(e.target.value);
                   setIsInitialColor(false);
                 }}
                 className="block w-full h-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            登録
          </button>
        </form>
      </div>
    </div>
  );
}