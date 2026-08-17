'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Activity, Database } from 'lucide-react';
import type { Service, ServiceInput, Category } from '@/lib/types';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceForm } from '@/components/ServiceForm';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DOWN' | 'NOT_CONFIGURED'>('ALL');

  const fetchServices = useCallback(async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [fetchServices, fetchCategories]);

  const handleSave = async (data: ServiceInput) => {
    if (editingService) {
      const res = await fetch(`/api/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update service');
        return;
      }
    } else {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create service');
        return;
      }
    }
    setShowForm(false);
    setEditingService(null);
    await fetchServices();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Failed to delete');
      return;
    }
    await fetchServices();
  };

  const activeCount = services.filter((s) => s.status === 'ACTIVE').length;
  const downCount = services.filter((s) => s.status === 'DOWN').length;
  const avgUptime = services.length ? 99.9 : 0;

  const filteredServices = statusFilter === 'ALL' 
    ? services 
    : services.filter(s => s.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-2">Services</h1>
            <p className="text-gray-600">Manage and monitor your API services</p>
          </div>
          <button
            onClick={() => { setEditingService(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Total Services</div>
            <div className="text-3xl font-bold">{services.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Down</div>
            <div className="text-3xl font-bold text-red-600">{downCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 text-sm mb-1">Avg Uptime</div>
            <div className="text-3xl font-bold text-blue-600">{avgUptime.toFixed(1)}%</div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({services.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('DOWN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'DOWN' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Down ({downCount})
            </button>
            <button
              onClick={() => setStatusFilter('NOT_CONFIGURED')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'NOT_CONFIGURED' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not Configured ({services.filter(s => s.status === 'NOT_CONFIGURED').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} onEdit={(s) => { setEditingService(s); setShowForm(true); }} onDelete={handleDelete} />
            ))}
          </div>
        ) : statusFilter !== 'ALL' ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No {statusFilter.toLowerCase().replace('_', ' ')} services</h3>
            <p className="text-gray-600">Try a different filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first API service to monitor</p>
            <button
              onClick={() => { setEditingService(null); setShowForm(true); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <ServiceForm
          service={editingService}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingService(null); }}
        />
      )}
    </div>
  );
}
