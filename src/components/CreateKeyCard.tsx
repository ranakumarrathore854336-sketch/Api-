import React, { useState } from 'react';
import { PlusCircle, Key, Phone, Sparkles } from 'lucide-react';

interface CreateKeyCardProps {
  onCreate: (keyText: string, dailyLimit: number, expiryDate: string) => Promise<boolean>;
}

export const CreateKeyCard: React.FC<CreateKeyCardProps> = ({ onCreate }) => {
  const [keyText, setKeyText] = useState('');
  const [dailyLimit, setDailyLimit] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGenerateKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const timeHex = Date.now().toString(36).slice(-4);
    setKeyText(`num_${randomHex}_${timeHex}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyText.trim()) return;

    setSubmitting(true);
    const ok = await onCreate(keyText.trim(), Number(dailyLimit) || 0, expiryDate);
    if (ok) {
      setKeyText('');
      setDailyLimit(100);
      setExpiryDate('');
    }
    setSubmitting(false);
  };

  return (
    <div id="create-section" className="bg-white border border-gray-200 rounded-md p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
        <div className="w-8 h-8 rounded bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <PlusCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
            Create New API Key
          </h3>
          <span className="text-xs text-gray-400 mt-1 block">
            Generate a new access credential
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-700">
              API Key Text <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Generate Random
            </button>
          </div>
          <input
            id="create-key-text"
            type="text"
            value={keyText}
            onChange={(e) => setKeyText(e.target.value)}
            placeholder="Enter a unique API key (e.g. client_pro_88)"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Service Type
          </label>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eef1f5] border border-gray-200 rounded text-xs font-semibold text-gray-800">
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            <span>NUMBER INFO (Fixed)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Daily Limit
            </label>
            <input
              id="create-key-limit"
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
              id="create-key-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:border-gray-700"
            />
            <small className="text-[11px] text-gray-400 mt-1 block">
              Leave blank for no expiry
            </small>
          </div>
        </div>

        <div>
          <button
            id="submit-create-key-btn"
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition shadow-xs disabled:opacity-50"
          >
            <Key className="w-3.5 h-3.5" />
            {submitting ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </form>
    </div>
  );
};
