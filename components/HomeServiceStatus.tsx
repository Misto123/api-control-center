'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Service } from '@/lib/types';

export function HomeServiceStatus() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : []);
      }
    };
    load();
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="mb-12 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">API Status</h2>
          <p className="text-sm text-gray-500">Latest completed health check</p>
        </div>
        <span className="text-sm text-gray-500">{services.length} services</span>
      </div>
      <div className="divide-y divide-gray-100">
        {services.map(service => (
          <div key={service.id} className="flex items-center justify-between gap-4 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              {service.status === 'ACTIVE' ? <CheckCircle className="h-4 w-4 shrink-0 text-green-500" /> : service.status === 'DOWN' ? <XCircle className="h-4 w-4 shrink-0 text-red-500" /> : <Clock className="h-4 w-4 shrink-0 text-yellow-500" />}
              <span className="truncate font-medium">{service.name}</span>
            </div>
            <div className="shrink-0 text-right text-gray-500">
              <div className={service.status_detail === 'logged_out' ? 'font-medium text-orange-600' : service.status === 'ACTIVE' ? 'font-medium text-green-600' : service.status === 'DOWN' ? 'font-medium text-red-600' : 'font-medium text-yellow-600'}>
                {service.status_detail === 'logged_out' ? 'Logged out' : service.status === 'ACTIVE' ? 'Online' : service.status === 'DOWN' ? 'Offline' : 'Pending connection'}
              </div>
              <div className="text-xs">{service.lastCheckedAt ? new Date(service.lastCheckedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not checked yet'}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
