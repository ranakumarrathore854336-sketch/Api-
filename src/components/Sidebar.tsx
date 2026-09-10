import React from 'react';
import {
  Home,
  PlusCircle,
  Key,
  Code,
  RotateCcw,
  LogOut,
  Shield,
  Activity,
  Terminal,
  AlertTriangle,
  KeyRound,
  X
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onResetDaily: () => void;
  onOpenDisclaimer: () => void;
  onOpenChangeCredentials?: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  onResetDaily,
  onOpenDisclaimer,
  onOpenChangeCredentials,
  onLogout,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'create-section', label: 'Create Key', icon: PlusCircle },
    { id: 'keys-section', label: 'API Keys', icon: Key },
    { id: 'test-section', label: 'Test Console', icon: Terminal },
    { id: 'endpoint-section', label: 'Endpoint', icon: Code },
    { id: 'logs-section', label: 'Usage Logs', icon: Activity }
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-56 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-900 text-white rounded-md flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              V
            </div>
            <div>
              <strong className="text-sm font-semibold text-gray-900 block leading-tight">
                Admin Panel
              </strong>
              <small className="text-[11px] text-gray-400 block mt-0.5">
                Number Info API
              </small>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">
            Main
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#eef1f5] text-gray-950 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1">
            System
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDaily();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-gray-500" />
            <span>Reset Daily</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenDisclaimer();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Disclaimer</span>
          </button>

          {onOpenChangeCredentials && (
            <button
              type="button"
              onClick={() => {
                onOpenChangeCredentials();
                onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <KeyRound className="w-4 h-4 shrink-0 text-gray-500" />
              <span>Change Password</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Secure Session Active</span>
        </div>
      </aside>
    </>
  );
};
