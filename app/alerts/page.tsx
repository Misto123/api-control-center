'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { Alert } from '@/lib/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchAlerts = useCallback(async () => {
    const res = await fetch('/api/alerts');
    const data = await res.json();
    setAlerts(Array.isArray(data) ? data.filter((alert: Alert) => !alert.isDismissed) : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    fetchAlerts();
  };

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'active') return a.isActive;
    if (filter === 'critical') return a.severity === 'CRITICAL';
    return true;
  });

  const getSeverityIcon = (s: string) => {
    switch (s) {
      case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBg = (s: string) => {
    switch (s) {
      case 'CRITICAL': return 'bg-red-50 border-red-200';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8 text-red-500" /> Alerts
            </h1>
            <p className="text-gray-600">Monitor and manage service alerts</p>
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'active', 'critical'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" /></div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((alert) => (
              <div key={alert.id} className={`bg-white rounded-xl shadow-md border p-5 ${getSeverityBg(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{alert.service?.name || 'Unknown service'}</span>
                        <span>{alert.type.replace(/_/g, ' ')}</span>
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.isRead && (
                      <button onClick={() => handleAction(alert.id, 'read')} className="text-xs text-blue-600 hover:underline">Mark Read</button>
                    )}
                    {!alert.isAcknowledged && (
                      <button onClick={() => handleAction(alert.id, 'acknowledge')} className="text-xs text-green-600 hover:underline">Acknowledge</button>
                    )}
                    {!alert.isDismissed && (
                      <button onClick={() => handleAction(alert.id, 'dismiss')} className="text-xs text-gray-500 hover:underline">Dismiss</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <h3 className="text-xl font-semibold mb-1">No alerts</h3>
            <p className="text-gray-500">All systems operating normally</p>
          </div>
        )}
      </div>
    </div>
  );
}
