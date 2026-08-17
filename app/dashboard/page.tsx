'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Activity, AlertTriangle, CheckCircle, XCircle, Bell, Key,
  Clock, TrendingUp, BarChart3, Settings, FolderKanban
} from 'lucide-react';
import type { Service, DashboardSummary, Alert } from '@/lib/types';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [servicesRes, summaryRes, alertsRes] = await Promise.all([
      fetch('/api/services'),
      fetch('/api/dashboard/summary'),
      fetch('/api/alerts'),
    ]);
    const [servicesData, summaryData, alertsData] = await Promise.all([
      servicesRes.json(),
      summaryRes.json(),
      alertsRes.json(),
    ]);
    setServices(Array.isArray(servicesData) ? servicesData : []);
    setSummary(summaryData);
    setAlerts(Array.isArray(alertsData) ? alertsData : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAcknowledge = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acknowledge' }),
    });
    fetchData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'DOWN': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-800';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Overview of all your API services and alerts</p>
          </div>
          <div className="flex gap-3">
            <Link href="/services" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" /> Services
            </Link>
            <Link href="/settings" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Services</p>
                <p className="text-3xl font-bold">{summary?.totalServices ?? 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-3xl font-bold text-green-600">{summary?.activeServices ?? 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Down</p>
                <p className="text-3xl font-bold text-red-600">{summary?.downServices ?? 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Credits</p>
                <p className="text-3xl font-bold text-yellow-600">{summary?.lowCreditsCount ?? 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" /> Services Overview
                </h2>
                <Link href="/services" className="text-sm text-blue-600 hover:underline">View all →</Link>
              </div>
              {services.length > 0 ? (
                <div className="divide-y">
                  {services.slice(0, 8).map((service) => (
                    <div key={service.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Key className="w-3 h-3" />
                              {service.apiKey ? 'Key set' : 'No key'}
                            </span>
                            {service.creditsPercent !== null && (
                              <span>Credits: {service.creditsPercent}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          service.status === 'DOWN' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No services yet. <Link href="/services" className="text-blue-600 hover:underline">Add one →</Link></p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500" /> Recent Alerts
                  {summary && summary.unreadAlerts > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{summary.unreadAlerts}</span>
                  )}
                </h2>
                <Link href="/alerts" className="text-sm text-blue-600 hover:underline">View all →</Link>
              </div>
              {alerts.length > 0 ? (
                <div className="divide-y">
                  {alerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="px-6 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`inline-block px-2 py-0.5 rounded text-xs font-medium border mb-1 ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </p>
                          <p className="text-sm font-medium truncate">{alert.title}</p>
                          <p className="text-xs text-gray-500 truncate">{alert.service?.name || 'Unknown'}</p>
                        </div>
                        {!alert.isAcknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          >
                            Ack
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
