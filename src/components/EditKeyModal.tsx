import React, { useState, useEffect } from 'react';
import { X, Edit, Save } from 'lucide-react';
import { ApiKey } from '../types';

interface EditKeyModalProps {
  apiKey: ApiKey | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, dailyLimit: number, expiryDate: string) => Promise<boolean>;
}

export const EditKeyModal: React.FC<EditKeyModalProps> = ({
  apiKey,
  isOpen,
  onClose,
  onSave
}) => {
  const [dailyLimit, setDailyLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apiKey) {
      setDailyLimit(apiKey.daily_limit);
      setExpiryDate(apiKey.expiry_date || '');
    }
  }, [apiKey]);

  if (!isOpen || !apiKey) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(apiKey.id, Number(dailyLimit) || 0, expiryDate);
    if (ok) {
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">
              Edit API Key <span className="font-mono text-xs text-gray-500">({apiKey.key_text})</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Daily Limit
            </label>
            <input
              type="number"
              min="0"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700"
            />
            <small className="text-[11px] text-gray-400 mt-1 block">
              0 = unlimited queries per day
            </small>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700"
            />
            <small className="text-[11px] text-gray-400 mt-1 block">
              Leave blank for no expiry
            </small>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
