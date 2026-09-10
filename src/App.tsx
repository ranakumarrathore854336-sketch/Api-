/**
 * Number Info API - Administration Dashboard & API Gateway
 * Compatible with anish.php and api.php
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ApiKey, DashboardStats, UsageLog } from './types';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LoginCard } from './components/LoginCard';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { StatsCards } from './components/StatsCards';
import { CreateKeyCard } from './components/CreateKeyCard';
import { KeysTable } from './components/KeysTable';
import { EditKeyModal } from './components/EditKeyModal';
import { ChangeCredentialsModal } from './components/ChangeCredentialsModal';
import { ApiTester } from './components/ApiTester';
import { EndpointDocs } from './components/EndpointDocs';
import { UsageLogsTable } from './components/UsageLogsTable';
import { CheckCircle2, AlertCircle, Shield } from 'lucide-react';

export default function App() {
  // Authentication
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token') || 'demo_auth_active';
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    return localStorage.getItem('admin_user') || 'Abhi';
  });

  // Disclaimer popup state
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleCloseDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active navigation section
  const [activeSection, setActiveSection] = useState('dashboard');

  // Change credentials modal
  const [isChangeCredsOpen, setIsChangeCredsOpen] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats>({
    totalKeys: 0,
    todayUsage: 0,
    totalUsage: 0,
    activeKeys: 0
  });
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Notification message
  const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit Modal
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Selected key for testing console
  const [testKeyText, setTestKeyText] = useState('');

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch Keys
  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/keys');
      if (res.ok) {
        const data: ApiKey[] = await res.json();
        setKeys(data);
        if (data.length > 0 && !testKeyText) {
          const activeKey = data.find((k) => k.active === 1) || data[0];
          setTestKeyText(activeKey.key_text);
        }
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    }
  }, [testKeyText]);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs?limit=50');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (authToken) {
      fetchStats();
      fetchKeys();
      fetchLogs();
    }
  }, [authToken, fetchStats, fetchKeys, fetchLogs]);

  const showAlert = (text: string, type: 'success' | 'error' = 'success') => {
    setAlert({ text, type });
    setTimeout(() => {
      setAlert((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const handleLogin = (token: string, username: string) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', username);
    setAuthToken(token);
    setAdminUser(username);
    showAlert(`Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuthToken(null);
  };

  const handleCreateKey = async (
    keyText: string,
    dailyLimit: number,
    expiryDate: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_text: keyText, daily_limit: dailyLimit, expiry_date: expiryDate })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'Failed to create key', 'error');
        return false;
      }
      showAlert('API Key created successfully!');
      fetchKeys();
      fetchStats();
      return true;
    } catch {
      showAlert('Server error creating key', 'error');
      return false;
    }
  };

  const handleEditOpen = (key: ApiKey) => {
    setEditingKey(key);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (
    id: number,
    dailyLimit: number,
    expiryDate: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ daily_limit: dailyLimit, expiry_date: expiryDate })
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'Failed to update key', 'error');
        return false;
      }
      showAlert('API Key updated successfully!');
      fetchKeys();
      fetchStats();
      return true;
    } catch {
      showAlert('Server error updating key', 'error');
      return false;
    }
  };

  const handleToggleKey = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/keys/${id}/toggle`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'Failed to toggle status', 'error');
        return;
      }
      showAlert('Key status updated!');
      fetchKeys();
      fetchStats();
    } catch {
      showAlert('Server error toggling key status', 'error');
    }
  };

  const handleDeleteKey = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'Failed to delete key', 'error');
        return;
      }
      showAlert('Key deleted successfully!');
      fetchKeys();
      fetchStats();
    } catch {
      showAlert('Server error deleting key', 'error');
    }
  };

  const handleResetDaily = async () => {
    if (!window.confirm('Are you sure you want to reset all daily usage counts to zero?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/reset-daily', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert(data.error || 'Failed to reset', 'error');
        return;
      }
      showAlert('Daily usage reset successfully!');
      fetchKeys();
      fetchStats();
    } catch {
      showAlert('Server error resetting daily usage', 'error');
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!authToken) {
    return (
      <>
        <DisclaimerModal
          isOpen={showDisclaimer}
          onClose={handleCloseDisclaimer}
        />
        <LoginCard onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f4f7] text-gray-800 flex flex-col font-sans">
      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onClose={handleCloseDisclaimer}
      />

      {/* Edit Key Modal */}
      <EditKeyModal
        apiKey={editingKey}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Change Credentials Modal */}
      <ChangeCredentialsModal
        isOpen={isChangeCredsOpen}
        onClose={() => setIsChangeCredsOpen(false)}
        currentUsername={adminUser}
        onSuccess={(newUsername) => {
          setAdminUser(newUsername);
          localStorage.setItem('admin_user', newUsername);
          showAlert(`Admin credentials updated successfully for ${newUsername}!`);
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onResetDaily={handleResetDaily}
        onOpenDisclaimer={() => setShowDisclaimer(true)}
        onOpenChangeCredentials={() => setIsChangeCredsOpen(true)}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:ml-56 flex-1 flex flex-col">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenDisclaimer={() => setShowDisclaimer(true)}
          onOpenChangeCredentials={() => setIsChangeCredsOpen(true)}
          onLogout={handleLogout}
          adminUsername={adminUser}
        />

        <main className="p-4 sm:p-6 lg:p-7 flex-1 max-w-7xl w-full mx-auto">
          {/* Page Header */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              API Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage API keys, limits, expiry and access control for the Number Info service.
            </p>
          </div>

          {/* Flash Alert Banner */}
          {alert && (
            <div
              className={`p-3 rounded-md mb-6 text-xs sm:text-sm flex items-center gap-2.5 transition animate-in fade-in duration-150 ${
                alert.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {alert.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span className="font-medium">{alert.text}</span>
            </div>
          )}

          {/* 4 Stats Cards */}
          <StatsCards stats={stats} />

          {/* Create Key Card */}
          <CreateKeyCard onCreate={handleCreateKey} />

          {/* API Keys Table */}
          <KeysTable
            keys={keys}
            onEdit={handleEditOpen}
            onToggle={handleToggleKey}
            onDelete={handleDeleteKey}
            onSelectForTest={(keyText) => {
              setTestKeyText(keyText);
              scrollToSection('test-section');
            }}
          />

          {/* API Tester Console */}
          <ApiTester
            keys={keys}
            selectedKeyText={testKeyText}
            onKeyChange={setTestKeyText}
            onRefreshLogs={() => {
              fetchLogs();
              fetchStats();
            }}
          />

          {/* Endpoint Documentation */}
          <EndpointDocs apiKeySample={testKeyText || 'YOUR_KEY'} />

          {/* Recent Usage Logs */}
          <UsageLogsTable
            logs={logs}
            onRefresh={() => {
              fetchLogs();
              fetchStats();
            }}
            loading={loadingLogs}
          />

          {/* Footer Bar */}
          <footer className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>&copy; 2026 Number Info API Management</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <span>Secure Administration Panel</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
