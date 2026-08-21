'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Globe, TrendingUp, Settings, LogOut, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  unreadAlerts?: number;
  onCheckPayments?: () => void;
  checkingPayments?: boolean;
}

export function Navigation({ unreadAlerts = 0, onCheckPayments, checkingPayments = false }: NavigationProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <Link href="/websites" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <Globe className="w-4 h-4" /> SEO Websites
      </Link>
      <Link href="/rank-tracker" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> Rank Tracker
      </Link>
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
      <Link href="/alerts" className="relative px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Alerts
        {unreadAlerts > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadAlerts}
          </span>
        )}
      </Link>
      <Link href="/settings" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <Settings className="w-4 h-4" /> Settings
      </Link>
      <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}
