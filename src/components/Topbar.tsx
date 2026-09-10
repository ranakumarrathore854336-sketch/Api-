import React from 'react';
import { Menu, ShieldCheck, LogOut, AlertTriangle, Radio } from 'lucide-react';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenDisclaimer: () => void;
  onOpenChangeCredentials?: () => void;
  onLogout: () => void;
  adminUsername: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onOpenDisclaimer,
  onOpenChangeCredentials,
  onLogout,
  adminUsername
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-xs text-gray-500 font-medium">
          Admin / <strong className="text-gray-900 font-semibold">Dashboard</strong>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          type="button"
          onClick={onOpenDisclaimer}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-medium hover:bg-amber-100 transition"
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Disclaimer</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Secure</span>
        </div>

        {onOpenChangeCredentials ? (
          <button
            type="button"
            onClick={onOpenChangeCredentials}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 hidden sm:flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
            title="Change username or password"
          >
            <span>Hi, <strong className="text-gray-900 font-semibold">{adminUsername}</strong></span>
          </button>
        ) : (
          <div className="text-xs font-medium text-gray-600 hidden lg:block">
            Hi, <span className="font-semibold text-gray-900">{adminUsername}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-gray-700 rounded text-xs font-medium transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
