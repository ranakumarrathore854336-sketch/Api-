import React, { useState } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { UsageLog } from '../types';

interface UsageLogsTableProps {
  logs: UsageLog[];
  onRefresh: () => void;
  loading?: boolean;
}

export const UsageLogsTable: React.FC<UsageLogsTableProps> = ({
  logs,
  onRefresh,
  loading = false
}) => {
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.query.includes(search) ||
      l.key_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="logs-section" className="bg-white border border-gray-200 rounded-md p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-none">
              Recent Usage Logs
            </h3>
            <span className="text-xs text-gray-400 mt-1 block">
              Audit trail of recent requests and queries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-48">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-gray-400">
              <Search className="w-3 h-3" />
            </span>
            <input
              type="text"
              placeholder="Filter logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-800 focus:outline-none focus:border-gray-600"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition disabled:opacity-50"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#f2f4f7] border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Log ID</th>
              <th className="py-2.5 px-3">Queried Number</th>
              <th className="py-2.5 px-3">API Key Used</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[#fafbfc] transition">
                <td className="py-2 px-3 font-semibold text-gray-400">
                  #{log.id}
                </td>
                <td className="py-2 px-3 font-mono font-medium text-gray-900">
                  +91 {log.query}
                </td>
                <td className="py-2 px-3 font-mono text-gray-600">
                  {log.key_text}
                </td>
                <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                  {new Date(log.used_at).toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}{' '}
                  <span className="text-[10px] text-gray-400">
                    ({new Date(log.used_at).toLocaleDateString('en-GB')})
                  </span>
                </td>
                <td className="py-2 px-3">
                  {log.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  {search ? 'No matching logs found' : 'No query logs recorded yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
