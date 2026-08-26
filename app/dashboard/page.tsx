'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import type { Service, Alert } from '@/lib/types';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPayments, setCheckingPayments] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedOfflineService, setSelectedOfflineService] = useState<Service | null>(null);

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

  const setDashboardVisibility = async (service: Service, visible: boolean) => {
    const response = await fetch(`/api/services/${service.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dashboardVisible: visible }),
    });

    if (response.ok) await fetchData();
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
    const checkIfDue = async () => {
      const response = await fetch('/api/services');
      const currentServices: Service[] = response.ok ? await response.json() : [];
      const latestCheck = currentServices.reduce<number | null>((latest, service) => {
        const timestamp = service.lastCheckedAt ? new Date(service.lastCheckedAt).getTime() : null;
        return timestamp !== null && (latest === null || timestamp > latest) ? timestamp : latest;
      }, null);

      if (latestCheck === null || Date.now() - latestCheck >= 12 * 60 * 60 * 1000) {
        await fetch('/api/monitoring/check', { method: 'POST' });
      }
      await fetchData();
    };

    checkIfDue();
    const refreshInterval = setInterval(fetchData, 60000); // Refresh display every minute
    const dueInterval = setInterval(checkIfDue, 12 * 60 * 60 * 1000);
    return () => {
      clearInterval(refreshInterval);
      clearInterval(dueInterval);
    };
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

  const formatBalance = (service: Service) => {
    if (service.totalCredits === null && service.usedCredits === null) return null;
    const amount = service.credit_unit === 'USD' || service.credit_unit === 'EUR'
      ? service.totalCredits ?? 0
      : service.totalCredits !== null && service.usedCredits !== null
        ? service.totalCredits - service.usedCredits
        : service.totalCredits ?? service.usedCredits ?? 0;
    return `${formatCredits(amount, service.credit_unit)} ${service.credit_unit || 'credits'}`;
  };

  const formatCheckDate = (value: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Not checked yet';

  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const activeCount = services.filter(s => s.status === 'ACTIVE').length;
  const downCount = services.filter(s => s.status === 'DOWN').length;
  const notConfiguredCount = services.filter(s => s.status === 'NOT_CONFIGURED').length;

  // Filter services: hide NOT_CONFIGURED without API key unless showInactive is true
  const filteredServices = showInactive
    ? services
    : services.filter(s => s.dashboard_visible !== false && !(s.status === 'NOT_CONFIGURED' && !s.apiKey));

  const hiddenCount = services.length - filteredServices.length;
  const latestCheckedAt = services.reduce<string | null>((latest, service) => {
    if (!service.lastCheckedAt) return latest;
    if (!latest || new Date(service.lastCheckedAt) > new Date(latest)) return service.lastCheckedAt;
    return latest;
  }, null);

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
          <div className="text-right text-sm text-gray-500">
            <div className="font-medium text-gray-700">Last checked</div>
            <div>{latestCheckedAt ? new Date(latestCheckedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not checked yet'}</div>
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
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-gray-600">Down:</span>
            <span className="font-semibold text-red-600">{downCount}</span>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Not Configured:</span>
            <span className="font-semibold text-gray-600">{notConfiguredCount}</span>
          </div>
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
          {hiddenCount > 0 && (
            <>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium"
              >
                {showInactive ? 'Hide' : 'Show'} Inactive ({hiddenCount})
              </button>
            </>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`relative group h-[92px] border-2 rounded-xl p-3 transition-all ${getStatusColor(service.status)}`}
            >
              <Link
                href={`/services?id=${service.id}`}
                className="block"
                onClick={(event) => {
                  if (service.status === 'DOWN') {
                    event.preventDefault();
                    setSelectedOfflineService(service);
                  }
                }}
              >
              {/* Status Icon */}
              <div className="absolute top-3 right-3">
                {getStatusIcon(service.status)}
              </div>

              {/* Service Name */}
              <h3 className="text-sm font-bold mb-1 pr-8 truncate" title={service.name}>
                {service.name}
              </h3>

              {/* Credits */}
              {formatBalance(service) !== null ? <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-gray-500">Balance</div>
                <div className="text-lg font-bold text-gray-900">{formatBalance(service)}</div>
                <div className="text-xs text-gray-500">Last check: {formatCheckDate(service.lastCheckedAt)}</div>
              </div> : (
                <div className={`flex items-center gap-2 pt-3 text-sm font-semibold ${service.status === 'ACTIVE' ? 'text-green-600' : service.status === 'DOWN' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {service.status_detail === 'logged_out' ? 'Logged out' : service.status === 'ACTIVE' ? 'Online' : service.status === 'DOWN' ? 'Offline' : 'Pending connection'}
                </div>
              )}

              </Link>
              <button
                type="button"
                onClick={() => setDashboardVisibility(service, false)}
                className="absolute bottom-2 right-2 z-20 rounded bg-white/90 p-1 text-gray-500 shadow-sm hover:text-red-600"
                title="Hide from dashboard"
                aria-label={`Hide ${service.name} from dashboard`}
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {showInactive && services.some(s => s.dashboard_visible === false) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {services.filter(s => s.dashboard_visible === false).map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => setDashboardVisibility(service, true)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
              >
                <Eye className="h-3.5 w-3.5" /> Show {service.name}
              </button>
            ))}
          </div>
        )}

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

        {selectedOfflineService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Service issue details">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Offline service</p>
                  <h2 className="text-xl font-bold text-gray-900">{selectedOfflineService.name}</h2>
                </div>
                <button onClick={() => setSelectedOfflineService(null)} className="rounded-lg px-3 py-1 text-gray-500 hover:bg-gray-100">Close</button>
              </div>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-gray-500">Issue</dt><dd className="font-medium text-red-700">{selectedOfflineService.last_error || 'The health check failed.'}</dd></div>
                <div><dt className="text-gray-500">HTTP status</dt><dd className="font-medium">{selectedOfflineService.last_status_code ?? 'No response'}</dd></div>
                <div><dt className="text-gray-500">Endpoint</dt><dd className="break-all font-mono text-xs">{selectedOfflineService.apiUrl}{selectedOfflineService.checkEndpoint || ''}</dd></div>
                <div><dt className="text-gray-500">Last checked</dt><dd className="font-medium">{formatCheckDate(selectedOfflineService.lastCheckedAt)}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
