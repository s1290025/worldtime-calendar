'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Palette } from 'lucide-react';
import { EventFormData, createEventFromForm, saveEvent } from '@/utils/events';
import { getUserSession } from '@/utils/session';
import { getShareSession, getSharedCalendars } from '@/utils/share';
import { TIMEZONE_OPTIONS } from '@/utils/timezones';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: string; // YYYY-MM-DD
  initialTimezone?: string;
}

export default function EventForm({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTimezone
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: initialDate || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: initialDate || new Date().toISOString().split('T')[0],
    endTime: '10:00',
    timezone: initialTimezone || 'Asia/Tokyo',
    allDay: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ユーザーセッションからタイムゾーンを取得
  useEffect(() => {
    const userSession = getUserSession();
    if (userSession && userSession.timezone) {
      setFormData(prev => ({
        ...prev,
        timezone: userSession.timezone,
      }));
    }
  }, []);

  // 初期日付が変更された時の処理
  useEffect(() => {
    if (initialDate) {
      setFormData(prev => ({
        ...prev,
        startDate: initialDate,
        endDate: initialDate,
      }));
    }
  }, [initialDate]);

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    if (!formData.allDay) {
      if (!formData.startTime) {
        newErrors.startTime = '開始時間は必須です';
      }
      if (!formData.endTime) {
        newErrors.endTime = '終了時間は必須です';
      }

      // 時間の妥当性チェック
      if (formData.startTime && formData.endTime) {
        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        if (endDateTime <= startDateTime) {
          newErrors.endTime = '終了時間は開始時間より後にしてください';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 通常のユーザーセッションまたは共有セッションを取得
    const userSession = getUserSession();
    const shareSession = getShareSession();
    
    let userColor = '#3B82F6'; // デフォルト色
    let userTimezone = 'Asia/Tokyo'; // デフォルトタイムゾーン
    
    if (userSession) {
      // 通常のユーザーセッションがある場合
      userColor = userSession.color;
      userTimezone = userSession.timezone;
    } else if (shareSession) {
      // 共有セッションがある場合
      const calendars = getSharedCalendars();
      const calendar = calendars.find(c => c.id === shareSession.calendarId);
      const participant = calendar?.participants.find(p => p.id === shareSession.userId);
      
      if (participant) {
        userColor = participant.color;
        userTimezone = formData.timezone; // フォームで選択されたタイムゾーンを使用
      }
    } else {
      alert('ユーザー情報が見つかりません。再度ログインしてください。');
      return;
    }

    try {
      const event = createEventFromForm(formData, userColor);
      saveEvent(event);
      onSave();
      onClose();
      
      // フォームをリセット
      setFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '10:00',
        timezone: userTimezone,
        allDay: false,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      alert('予定の保存に失敗しました。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            予定を追加
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="予定のタイトルを入力"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-600"
              placeholder="予定の詳細を入力（任意）"
              rows={3}
            />
          </div>

          {/* 終日チェックボックス */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => handleInputChange('allDay', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
              終日
            </label>
          </div>

          {/* 日付と時間 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 開始日時 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日時 *
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {!formData.allDay && (
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                {errors.startTime && (
                  <p className="text-red-500 text-sm">{errors.startTime}</p>
                )}
              </div>
            </div>

            {/* 終了日時 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日時 *
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {!formData.allDay && (
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      errors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                {errors.endTime && (
                  <p className="text-red-500 text-sm">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* タイムゾーン */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              タイムゾーン
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.offset})
                </option>
              ))}
            </select>
          </div>

          {/* ユーザーカラー表示 */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
            <Palette className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">予定の色:</span>
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: (() => {
                const userSession = getUserSession();
                const shareSession = getShareSession();
                
                if (userSession) {
                  return userSession.color;
                } else if (shareSession) {
                  const calendars = getSharedCalendars();
                  const calendar = calendars.find(c => c.id === shareSession.calendarId);
                  const participant = calendar?.participants.find(p => p.id === shareSession.userId);
                  return participant?.color || '#3B82F6';
                }
                return '#3B82F6';
              })() }}
            />
            <span className="text-sm text-gray-600">
              {(() => {
                const userSession = getUserSession();
                const shareSession = getShareSession();
                
                if (userSession) {
                  return userSession.name;
                } else if (shareSession) {
                  const calendars = getSharedCalendars();
                  const calendar = calendars.find(c => c.id === shareSession.calendarId);
                  const participant = calendar?.participants.find(p => p.id === shareSession.userId);
                  return participant?.name || 'ユーザー';
                }
                return 'ユーザー';
              })()}の色
            </span>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
