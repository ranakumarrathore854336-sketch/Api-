import React from 'react';
import { Key, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Total Keys */}
      <div id="stat-total-keys" className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-md bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {stats.totalKeys}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Total Keys</div>
        </div>
      </div>

      {/* Today */}
      <div id="stat-today-usage" className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-md bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {stats.todayUsage}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Today</div>
        </div>
      </div>

      {/* Total Requests */}
      <div id="stat-total-requests" className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-md bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {stats.totalUsage}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Total Requests</div>
        </div>
      </div>

      {/* Active Keys */}
      <div id="stat-active-keys" className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-md bg-[#eef1f5] text-gray-800 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 leading-tight">
            {stats.activeKeys}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Active</div>
        </div>
      </div>
    </div>
  );
};
