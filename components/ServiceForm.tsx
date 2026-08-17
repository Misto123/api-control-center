'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Service, ServiceInput, Category } from '@/lib/types';
import { ApiKeyInput } from './ApiKeyInput';

interface ServiceFormProps {
  service?: Service | null;
  categories: Category[];
  onSave: (data: ServiceInput) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({ service, categories, onSave, onCancel }: ServiceFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceInput>({
    name: service?.name || '',
    slug: service?.slug || '',
    description: service?.description || '',
    apiUrl: service?.apiUrl || '',
    apiKey: service?.apiKey || '',
    checkEndpoint: service?.checkEndpoint || '',
    totalCredits: service?.totalCredits ?? undefined,
    usedCredits: service?.usedCredits ?? undefined,
    lowCreditsThreshold: service?.lowCreditsThreshold ?? 20,
    criticalCreditsThreshold: service?.criticalCreditsThreshold ?? 10,
    depletionWarningDays: service?.depletionWarningDays ?? 14,
    depletionCriticalDays: service?.depletionCriticalDays ?? 7,
    slowResponseThreshold: service?.slowResponseThreshold ?? 5000,
    monitoringEnabled: service?.monitoringEnabled ?? true,
    checkInterval: service?.checkInterval ?? 60,
    categoryId: service?.categoryId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof ServiceInput, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">{service ? 'Edit Service' : 'Add Service'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="auto-generated from name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => set('categoryId', e.target.value || null)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">API Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="url"
                value={form.apiUrl || ''}
                onChange={(e) => set('apiUrl', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="https://api.example.com/v1"
              />
            </div>
            <ApiKeyInput
              value={form.apiKey || ''}
              onChange={(v) => set('apiKey', v)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Health Check Endpoint</label>
              <input
                type="text"
                value={form.checkEndpoint || ''}
                onChange={(e) => set('checkEndpoint', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="/health"
              />
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Credits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Credits</label>
                <input
                  type="number"
                  value={form.totalCredits ?? ''}
                  onChange={(e) => set('totalCredits', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used Credits</label>
                <input
                  type="number"
                  value={form.usedCredits ?? ''}
                  onChange={(e) => set('usedCredits', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Alert Thresholds</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Credits %</label>
                <input
                  type="number"
                  value={form.lowCreditsThreshold ?? 20}
                  onChange={(e) => set('lowCreditsThreshold', Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Critical Credits %</label>
                <input
                  type="number"
                  value={form.criticalCreditsThreshold ?? 10}
                  onChange={(e) => set('criticalCreditsThreshold', Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depletion Warning (days)</label>
                <input
                  type="number"
                  value={form.depletionWarningDays ?? 14}
                  onChange={(e) => set('depletionWarningDays', Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Depletion Critical (days)</label>
                <input
                  type="number"
                  value={form.depletionCriticalDays ?? 7}
                  onChange={(e) => set('depletionCriticalDays', Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Monitoring */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Monitoring</h3>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.monitoringEnabled ?? true}
                  onChange={(e) => set('monitoringEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
              <span className="text-sm text-gray-700">Monitoring Enabled</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check Interval (seconds)</label>
              <input
                type="number"
                value={form.checkInterval ?? 60}
                onChange={(e) => set('checkInterval', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
