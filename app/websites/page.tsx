'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, ExternalLink, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Website, WebsiteInput } from '@/lib/types';
import { Navigation } from '@/components/Navigation';

type SortField = 'name' | 'created_at' | 'priority' | 'niche';
type SortDirection = 'asc' | 'desc';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [filter, setFilter] = useState<'all' | 'seo_flow' | 'gctr' | 'none'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const res = await fetch('/api/websites');
    const data = await res.json();
    setWebsites(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this website?')) return;
    await fetch(`/api/websites/${id}`, { method: 'DELETE' });
    fetchWebsites();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  let filteredWebsites = websites.filter(site => {
    // Apply filter
    if (filter === 'seo_flow' && !site.added_to_seo_flow) return false;
    if (filter === 'gctr' && !site.added_to_gctr) return false;
    if (filter === 'none' && (site.added_to_seo_flow || site.added_to_gctr)) return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(query) ||
        site.url.toLowerCase().includes(query) ||
        site.niche?.toLowerCase().includes(query) ||
        site.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Apply sorting
  filteredWebsites = [...filteredWebsites].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'created_at') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortField === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      aVal = priorityOrder[a.priority];
      bVal = priorityOrder[b.priority];
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">High</span>;
      case 'medium': return <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">Medium</span>;
      case 'low': return <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">Low</span>;
      default: return null;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">SEO Boost Websites</h1>
                <p className="text-sm text-gray-600 mt-1">Manage websites for ranking optimization</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Navigation />
              <button
                onClick={() => { setEditingWebsite(null); setShowForm(true); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" /> Add Website
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({websites.length})
              </button>
              <button
                onClick={() => setFilter('seo_flow')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'seo_flow' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                SEO Flow ({websites.filter(w => w.added_to_seo_flow).length})
              </button>
              <button
                onClick={() => setFilter('gctr')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'gctr' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                G CTR ({websites.filter(w => w.added_to_gctr).length})
              </button>
              <button
                onClick={() => setFilter('none')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'none' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Configured ({websites.filter(w => !w.added_to_seo_flow && !w.added_to_gctr).length})
              </button>
            </div>
            <input
              type="text"
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {filteredWebsites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No websites found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search query' : 'Add your first website to start tracking'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => { setEditingWebsite(null); setShowForm(true); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Website
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900">
                      Website <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('niche')} className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900">
                      Niche <SortIcon field="niche" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('priority')} className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900">
                      Priority <SortIcon field="priority" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-sm text-gray-700">SEO Tools</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Keywords</th>
                  <th className="text-left px-4 py-3 font-semibold text-sm text-gray-700">Budget</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 font-semibold text-sm text-gray-700 hover:text-gray-900">
                      Added <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredWebsites.map((website) => (
                  <tr key={website.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{website.name}</div>
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {website.url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {website.niche ? (
                        <span className="text-sm px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">{website.niche}</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(website.priority)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        {website.added_to_seo_flow ? (
                          <span title="SEO Flow"><CheckCircle className="w-5 h-5 text-green-600" /></span>
                        ) : (
                          <span title="SEO Flow"><XCircle className="w-5 h-5 text-gray-300" /></span>
                        )}
                        {website.added_to_gctr ? (
                          <span title="G CTR"><CheckCircle className="w-5 h-5 text-purple-600" /></span>
                        ) : (
                          <span title="G CTR"><XCircle className="w-5 h-5 text-gray-300" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {website.target_keywords?.length || 0} keywords
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {website.monthly_budget ? (
                        <span className="text-sm text-gray-900 font-medium">${website.monthly_budget}/mo</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">{getMonthYear(website.created_at)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { setEditingWebsite(website); setShowForm(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(website.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <WebsiteForm
          website={editingWebsite}
          onSave={async (data) => {
            if (editingWebsite) {
              await fetch(`/api/websites/${editingWebsite.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            } else {
              await fetch('/api/websites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
            }
            setShowForm(false);
            setEditingWebsite(null);
            fetchWebsites();
          }}
          onCancel={() => { setShowForm(false); setEditingWebsite(null); }}
        />
      )}
    </div>
  );
}

// Website Form Component
function WebsiteForm({ website, onSave, onCancel }: {
  website: Website | null;
  onSave: (data: WebsiteInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WebsiteInput>({
    name: website?.name || '',
    url: website?.url || '',
    description: website?.description || '',
    niche: website?.niche || '',
    added_to_seo_flow: website?.added_to_seo_flow || false,
    added_to_gctr: website?.added_to_gctr || false,
    target_keywords: website?.target_keywords || [],
    monthly_budget: website?.monthly_budget || undefined,
    priority: website?.priority || 'medium',
    notes: website?.notes || '',
  });
  const [keywordInput, setKeywordInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof WebsiteInput, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    set('target_keywords', [...(form.target_keywords || []), keywordInput.trim()]);
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    set('target_keywords', (form.target_keywords || []).filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold">{website ? 'Edit Website' : 'Add Website'}</h2>
            <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My Coupon Site"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                  <input
                    type="url"
                    required
                    value={form.url}
                    onChange={(e) => set('url', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
                  <input
                    type="text"
                    value={form.niche || ''}
                    onChange={(e) => set('niche', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Coupons, Travel, Tech..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => set('priority', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the website..."
                />
              </div>
            </div>

            {/* SEO Flow Integration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="seo_flow"
                  checked={form.added_to_seo_flow}
                  onChange={(e) => set('added_to_seo_flow', e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="seo_flow" className="text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                  Added to SEO Flow API
                </label>
              </div>
              <p className="text-xs text-gray-500">Configure universal API key in Settings</p>
            </div>

            {/* G CTR Tool Integration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="gctr"
                  checked={form.added_to_gctr}
                  onChange={(e) => set('added_to_gctr', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="gctr" className="text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer">
                  Added to G CTR Tool
                </label>
              </div>
              <p className="text-xs text-gray-500">Configure universal API key in Settings</p>
            </div>

            {/* Target Keywords */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Target Keywords</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add keyword..."
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {form.target_keywords && form.target_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.target_keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Budget & Notes */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.monthly_budget || ''}
                  onChange={(e) => set('monthly_budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or strategy details..."
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : website ? 'Update Website' : 'Add Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
