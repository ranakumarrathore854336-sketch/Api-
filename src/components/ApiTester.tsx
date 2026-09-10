import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, AlertCircle, Copy, Check, Radio, Globe, PhoneCall } from 'lucide-react';
import { ApiKey, ApiResponse } from '../types';

interface ApiTesterProps {
  keys: ApiKey[];
  selectedKeyText: string;
  onKeyChange: (key: string) => void;
  onRefreshLogs?: () => void;
}

const SAMPLE_NUMBERS = [
  { num: '9876543210', label: 'Airtel Punjab' },
  { num: '7000123456', label: 'Jio Delhi' },
  { num: '9820012345', label: 'Vi Mumbai' },
  { num: '9414012345', label: 'BSNL Rajasthan' }
];

export const ApiTester: React.FC<ApiTesterProps> = ({
  keys,
  selectedKeyText,
  onKeyChange,
  onRefreshLogs
}) => {
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedKeyText || !phoneNumber) return;

    setLoading(true);
    setResponse(null);
    setHttpStatus(null);

    const startTime = performance.now();
    try {
      const res = await fetch(
        `/api/number.php?key=${encodeURIComponent(selectedKeyText)}&num=${encodeURIComponent(phoneNumber)}`
      );
      const data = await res.json();
      const endTime = performance.now();

      setLatency(Math.round(endTime - startTime));
      setHttpStatus(res.status);
      setResponse(data);
      if (onRefreshLogs) onRefreshLogs();
    } catch {
      setHttpStatus(500);
      setResponse({ error: 'Network request failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="test-section" className="bg-white border border-gray-200 rounded-md p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-5">
        <div className="w-8 h-8 rounded bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
            API Test Console & Simulator
          </h3>
          <span className="text-xs text-gray-400 mt-1 block">
            Test real-time phone number lookup with chosen API credentials
          </span>
        </div>
      </div>

      <form onSubmit={handleTest} className="space-y-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Key selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select API Key
            </label>
            <select
              value={selectedKeyText}
              onChange={(e) => onKeyChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-700"
            >
              {keys.length === 0 && <option value="">No keys found</option>}
              {keys.map((k) => (
                <option key={k.id} value={k.key_text}>
                  {k.key_text} {k.active ? '(Active)' : '(Revoked)'} — {k.used_today}/{k.daily_limit || '∞'}
                </option>
              ))}
            </select>
          </div>

          {/* Number input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              10-Digit Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400 font-mono">
                +91
              </span>
              <input
                id="test-phone-input"
                type="text"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full pl-12 pr-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono text-gray-900 focus:outline-none focus:border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-gray-500">Quick Samples:</span>
          {SAMPLE_NUMBERS.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                setPhoneNumber(s.num);
              }}
              className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] rounded transition font-mono"
            >
              {s.num} ({s.label})
            </button>
          ))}
        </div>

        <div>
          <button
            id="test-send-btn"
            type="submit"
            disabled={loading || !selectedKeyText || phoneNumber.length !== 10}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {loading ? 'Querying API...' : 'Send Request'}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {response && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  httpStatus === 200
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                HTTP {httpStatus}
              </span>
              {latency !== null && (
                <span className="text-xs text-gray-500 font-mono">
                  {latency}ms
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          {/* Visual card summary if success */}
          {response.data && (
            <div className="bg-[#f8fafc] border border-blue-100 rounded-md p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Carrier / Operator
                </span>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  {response.data.carrier}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Telecom Circle
                </span>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  {response.data.circle}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Line Type
                </span>
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1 mt-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  {response.data.line_type}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Allotment Series
                </span>
                <span className="text-xs font-mono font-medium text-gray-800 mt-0.5 block">
                  {response.data.series}xxxx (MCC: {response.data.mcc})
                </span>
              </div>
            </div>
          )}

          {/* Raw JSON viewer */}
          <div className="bg-[#1e1e1e] text-[#d4d4d4] rounded-md p-4 font-mono text-xs overflow-x-auto border border-gray-800 max-h-72">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
