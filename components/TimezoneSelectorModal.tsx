'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TIMEZONE_OPTIONS, getTimezonesByCountry, getCountries } from '@/utils/timezones';

interface TimezoneSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (timezone: string) => void;
  existingTimezones: string[];
}

export default function TimezoneSelectorModal({
  isOpen,
  onClose,
  onSelect,
  existingTimezones
}: TimezoneSelectorModalProps) {
  const [selectedCountry, setSelectedCountry] = useState('Japan');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  
  const countries = getCountries();
  const timezonesByCountry = getTimezonesByCountry();
  
  // 国選択用のオプション配列を作成
  const countryOptions = countries.map(country => ({
    value: country,
    label: country
  }));

  // 国が変更されたら、その国の最初のタイムゾーンを選択
  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    const countryTimezones = timezonesByCountry[newCountry];
    if (countryTimezones && countryTimezones.length > 0) {
      setSelectedTimezone(countryTimezones[0].value);
    } else {
      setSelectedTimezone('');
    }
  };

  // タイムゾーンオプションを作成
  const getAvailableTimezones = () => {
    const countryTimezones = timezonesByCountry[selectedCountry] || [];
    return countryTimezones.map(tz => ({
      value: tz.value,
      label: `${tz.label} (${tz.offset})`
    }));
  };

  const handleSelect = () => {
    if (selectedTimezone) {
      onSelect(selectedTimezone);
      onClose();
      // リセット
      setSelectedCountry('Japan');
      setSelectedTimezone('');
    }
  };

  // モーダルが開かれた時に初期化
  useEffect(() => {
    if (isOpen) {
      setSelectedCountry('Japan');
      const countryTimezones = timezonesByCountry['Japan'];
      if (countryTimezones && countryTimezones.length > 0) {
        setSelectedTimezone(countryTimezones[0].value);
      }
    }
  }, [isOpen, timezonesByCountry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">タイムゾーンを追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              国・地域
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              {countryOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイムゾーン
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              {getAvailableTimezones().map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedTimezone}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
