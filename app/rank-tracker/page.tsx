'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, TrendingUp, TrendingDown, Minus, Calendar, ExternalLink, Trash2, Clock } from 'lucide-react';
import type { RankTrackerWithResults } from '@/lib/types';

export default function RankTrackersPage() {
  const [trackers, setTrackers] = useState<RankTrackerWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ domain: '', keyword: '', country: 'us', language: 'en' });

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    setLoading(true);
    const res = await fetch('/api/rank-trackers');
    const data = await res.json();
    setTrackers(data);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clean domain - remove protocol and trailing slash
    const cleanDomain = form.domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    await fetch('/api/rank-trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, domain: cleanDomain }),
    });
    setForm({ domain: '', keyword: '', country: 'us', language: 'en' });
    setShowForm(false);
    fetchTrackers();
  };

  const handleCheckAll = async () => {
    setChecking(true);
    await fetch('/api/rank-trackers/check', { method: 'POST', body: JSON.stringify({}) });
    setChecking(false);
    fetchTrackers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rank tracker?')) return;
    await fetch(`/api/rank-trackers/${id}`, { method: 'DELETE' });
    fetchTrackers();
  };

  const getRankTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    if (current < previous) return 'up'; // Lower position number = higher rank
    if (current > previous) return 'down';
    return 'same';
  };

  const getRankColor = (position: number | null) => {
    if (!position) return 'text-gray-400';
    if (position <= 3) return 'text-green-600';
    if (position <= 10) return 'text-blue-600';
    if (position <= 20) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rank Tracker
              </h1>
              <p className="text-gray-600 mt-1">Monitor your domain rankings on Google (checked every 3 days)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Tracker
            </button>
            <button
              onClick={handleCheckAll}
              disabled={checking || trackers.length === 0}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Check All Now'}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold mb-4">Add New Rank Tracker</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Domain (e.g., example.com)"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Keyword to track"
                value={form.keyword}
                onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="nl">Netherlands</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Tracker
              </button>
            </form>
          </div>
        )}

        {/* Trackers List */}
        {trackers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No rank trackers yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {trackers.map((tracker) => {
              const latestPos = tracker.latestResult?.position ?? null;
              const trend = getRankTrend(latestPos, null); // TODO: Get previous result for trend

              return (
                <div key={tracker.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tracker.domain}</h3>
                        {latestPos && (
                          <span className={`text-2xl font-bold ${getRankColor(latestPos)}`}>
                            #{latestPos}
                          </span>
                        )}
                        {!latestPos && tracker.latestResult && (
                          <span className="text-gray-400 text-sm">Not in top 100</span>
                        )}
                        {!tracker.latestResult && (
                          <span className="text-yellow-600 text-sm flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Never checked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">"{tracker.keyword}"</span>
                        <span className="uppercase text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{tracker.country}</span>
                      </div>
                      {tracker.latestResult && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            Last checked: {new Date(tracker.latestResult.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {tracker.latestResult?.url && (
                        <a
                          href={tracker.latestResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {tracker.latestResult.url.substring(0, 60)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(tracker.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
