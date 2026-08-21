'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, CheckCircle, XCircle, Clock, AlertTriangle, Settings, LogOut, TrendingUp, CreditCard } from 'lucide-react';
import type { Service, Alert } from '@/lib/types';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPayments, setCheckingPayments] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleCheckPayments = async () => {
    setCheckingPayments(true);
    try {
      await fetch('/api/payment-monitor', { method: 'POST' });
      // Refresh alerts to show any new payment notifications
      fetchData();
    } finally {
      setCheckingPayments(false);
    }
  };

  const fetchData = useCallback(async () => {
    const [servicesRes, alertsRes] = await Promise.all([
      fetch('/api/services'),
      fetch('/api/alerts'),
    ]);
    const [servicesData, alertsData] = await Promise.all([
      servicesRes.json(),
      alertsRes.json(),
    ]);
    setServices(Array.isArray(servicesData) ? servicesData : []);
    setAlerts(Array.isArray(alertsData) ? alertsData.filter((a: Alert) => !a.isDismissed) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'DOWN': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'NOT_CONFIGURED': return <Clock className="w-6 h-6 text-yellow-500" />;
      default: return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'DOWN': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'NOT_CONFIGURED': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getCreditColor = (service: Service) => {
    const percent = service.creditsPercent;
    const creditUnit = service.credit_unit;
    const totalCredits = service.totalCredits;
    const minimumBalance = service.minimum_balance ?? 5;

    // For USD/EUR, check against minimum_balance (default 5)
    if ((creditUnit === 'USD' || creditUnit === 'EUR') && totalCredits !== null) {
      if (totalCredits < minimumBalance) return 'text-red-600';
      if (totalCredits < minimumBalance * 2) return 'text-orange-600';
      return 'text-green-600';
    }

    // For other units, use percentage
    if (percent === null) return 'text-gray-500';
    if (percent < 10) return 'text-red-600';
    if (percent < 20) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatCredits = (amount: number | null, unit: string | null) => {
    if (amount === null) return 'N/A';
    const unitStr = unit || 'credits';
    if (unitStr === 'USD') return `$${amount.toFixed(2)}`;
    if (unitStr === 'EUR') return `€${amount.toFixed(2)}`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(unitStr === 'USD' || unitStr === 'EUR' ? 2 : 0);
  };

  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const activeCount = services.filter(s => s.status === 'ACTIVE').length;
  const downCount = services.filter(s => s.status === 'DOWN').length;
  const notConfiguredCount = services.filter(s => s.status === 'NOT_CONFIGURED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">API Control Center</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/rank-tracker" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Rank Tracker
            </Link>
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
        </div>

        {/* Summary Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-lg">{services.length}</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">Active:</span>
            <span className="font-semibold text-green-600">{activeCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Down:</span>
            <span className="font-semibold text-red-600">{downCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Not Configured:</span>
            <span className="font-semibold text-gray-600">{notConfiguredCount}</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={handleCheckPayments}
            disabled={checkingPayments}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium disabled:opacity-50"
          >
            <CreditCard className={`w-4 h-4 ${checkingPayments ? 'animate-spin' : ''}`} />
            {checkingPayments ? 'Checking...' : 'Check Payments'}
          </button>
          {unreadAlerts > 0 && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Unread Alerts:</span>
                <span className="font-semibold text-orange-600">{unreadAlerts}</span>
              </div>
            </>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services?id=${service.id}`}
              className={`relative group border-2 rounded-xl p-4 transition-all ${getStatusColor(service.status)}`}
            >
              {/* Status Icon */}
              <div className="absolute top-3 right-3">
                {getStatusIcon(service.status)}
              </div>

              {/* Service Name */}
              <h3 className="text-sm font-bold mb-2 pr-8 line-clamp-2" title={service.name}>
                {service.name}
              </h3>

              {/* Credits */}
              <div className="space-y-1">
                {service.creditsPercent !== null ? (
                  <>
                    <div className={`text-2xl font-bold ${getCreditColor(service)}`}>
                      {service.creditsPercent}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatCredits(service.totalCredits, service.credit_unit)} {service.credit_unit || 'credits'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          service.creditsPercent < 10 ? 'bg-red-500' :
                          service.creditsPercent < 20 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${service.creditsPercent}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400 italic">No credit data</div>
                )}
              </div>

              {/* Hover Details */}
              <div className="absolute inset-0 bg-white rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-blue-500 shadow-lg z-10 overflow-hidden">
                <h3 className="font-bold mb-1 text-xs truncate">{service.name}</h3>
                {service.description && (
                  <p className="text-[10px] text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                )}
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-medium">{service.status}</span>
                  </div>
                  {service.totalCredits !== null && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium truncate">{formatCredits(service.totalCredits, service.credit_unit)} {service.credit_unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Used:</span>
                        <span className="font-medium truncate">{formatCredits(service.usedCredits, service.credit_unit)} {service.credit_unit}</span>
                      </div>
                    </>
                  )}
                  {service.lastCheckedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Check:</span>
                      <span className="font-medium">{new Date(service.lastCheckedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {service.apiUrl && (
                    <div className="mt-1 pt-1 border-t">
                      <span className="text-gray-500 break-all line-clamp-2">{service.apiUrl}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No services configured</h3>
            <p className="text-gray-600 mb-6">Add your first API service to start monitoring</p>
            <Link href="/services" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Go to Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
