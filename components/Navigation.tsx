'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, Bell, CreditCard, Database, FolderKanban, Globe, LayoutDashboard, LogOut, Settings, TrendingUp } from 'lucide-react';

interface NavigationProps {
  unreadAlerts?: number;
  onCheckPayments?: () => void;
  checkingPayments?: boolean;
}

export function Navigation({ unreadAlerts = 0, onCheckPayments, checkingPayments = false }: NavigationProps) {
  const router = useRouter();
  const [liveUnreadAlerts, setLiveUnreadAlerts] = useState(unreadAlerts);

  useEffect(() => {
    const refreshAlerts = async () => {
      const response = await fetch('/api/alerts');
      if (!response.ok) return;
      const alerts = await response.json();
      if (Array.isArray(alerts)) setLiveUnreadAlerts(alerts.filter(alert => !alert.isRead && !alert.isDismissed).length);
    };
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center gap-2 overflow-x-auto px-4 py-3">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
      <Link href="/services" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><Activity className="w-4 h-4" /> Services</Link>
      <Link href="/websites" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><Globe className="w-4 h-4" /> Websites</Link>
      <Link href="/rank-tracker" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><TrendingUp className="w-4 h-4" /> Rankings</Link>
      <Link href="/alerts" className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 ${liveUnreadAlerts > 0 ? 'text-red-600' : 'text-gray-700'}`}>
        <Bell className={`w-4 h-4 ${liveUnreadAlerts > 0 ? 'fill-red-100' : ''}`} /> Alerts
        {liveUnreadAlerts > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">{liveUnreadAlerts}</span>}
      </Link>
      <Link href="/projects" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><FolderKanban className="w-4 h-4" /> Projects</Link>
      <Link href="/settings" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"><Settings className="w-4 h-4" /> Settings</Link>
      {onCheckPayments && (
        <button
          onClick={onCheckPayments}
          disabled={checkingPayments}
          className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <CreditCard className={`w-4 h-4 ${checkingPayments ? 'animate-spin' : ''}`} />
          {checkingPayments ? 'Checking...' : 'Check Payments'}
        </button>
      )}
      <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </button>
      </div>
    </header>
  );
}
