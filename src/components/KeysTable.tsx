import React, { useState } from 'react';
import { ListFilter, Copy, Check, Edit2, Ban, CheckCircle2, Trash2, Search } from 'lucide-react';
import { ApiKey } from '../types';

interface KeysTableProps {
  keys: ApiKey[];
  onEdit: (key: ApiKey) => void;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onSelectForTest?: (keyText: string) => void;
}

export const KeysTable: React.FC<KeysTableProps> = ({
  keys,
  onEdit,
  onToggle,
  onDelete,
  onSelectForTest
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredKeys = keys.filter((k) =>
    k.key_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="keys-section" className="bg-white border border-gray-200 rounded-md p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
            <ListFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
              API Key Registry
            </h3>
            <span className="text-xs text-gray-400 mt-1 block">
              Manage all issued credentials ({keys.length} total)
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded text-gray-800 focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#f2f4f7] border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">API Key</th>
              <th className="py-2.5 px-3">Limit</th>
              <th className="py-2.5 px-3">Today</th>
              <th className="py-2.5 px-3">Total</th>
              <th className="py-2.5 px-3">Created</th>
              <th className="py-2.5 px-3">Expiry</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {filteredKeys.map((k) => {
              const isExpired = k.expiry_date && new Date(k.expiry_date).getTime() < Date.now();
              const hasExpiry = Boolean(k.expiry_date);

              return (
                <tr key={k.id} className="hover:bg-[#fafbfc] transition">
                  {/* ID */}
                  <td className="py-2.5 px-3 font-semibold text-gray-400">
                    #{k.id}
                  </td>

                  {/* API Key */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono font-medium text-gray-900">
                      <span>{k.key_text}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(k.id, k.key_text)}
                        title="Copy Key"
                        className="text-gray-400 hover:text-gray-800 p-1 rounded transition"
                      >
                        {copiedId === k.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {onSelectForTest && (
                        <button
                          type="button"
                          onClick={() => onSelectForTest(k.key_text)}
                          title="Test with this key"
                          className="text-[10px] text-blue-600 hover:underline ml-1"
                        >
                          Test
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Limit */}
                  <td className="py-2.5 px-3">
                    {k.daily_limit === 0 ? '∞' : k.daily_limit}
                  </td>

                  {/* Today */}
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        k.used_today > 0
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-gray-100 border border-gray-200 text-gray-600'
                      }`}
                    >
                      {k.used_today}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-2.5 px-3 font-medium text-gray-700">
                    {k.total_used}
                  </td>

                  {/* Created */}
                  <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                    {new Date(k.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>

                  {/* Expiry */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {isExpired ? (
                      <span className="inline-block px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-[11px] font-medium">
                        Expired
                      </span>
                    ) : hasExpiry ? (
                      <span className="inline-block px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[11px] font-medium">
                        {new Date(k.expiry_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded-full text-[11px] font-medium">
                        Never
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {k.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-[11px] font-medium">
                        <Ban className="w-3 h-3" />
                        Revoked
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => onEdit(k)}
                        className="px-2 py-1 bg-[#eaf2fb] text-[#2358a0] rounded text-[11px] font-medium hover:bg-blue-100 transition flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggle(k.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
                          k.active
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {k.active ? (
                          <>
                            <Ban className="w-3 h-3" />
                            Revoke
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Activate
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this API key permanently?')) {
                            onDelete(k.id);
                          }
                        }}
                        className="px-2 py-1 bg-red-50 text-red-700 rounded text-[11px] font-medium hover:bg-red-100 transition"
                        title="Delete key"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredKeys.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  {search ? 'No matching keys found' : 'No API keys yet. Create one above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
