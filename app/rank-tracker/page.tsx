'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { RankResult, RankTrackerWithResults } from '@/lib/types';

type SortField = 'domain' | 'keyword' | 'position' | 'date';

function cleanDomain(value: string) {
  return value.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
}

function rankLabel(position: number | null) {
  return position === null ? 'Not in top 100' : `#${position}`;
}

export default function RankTrackersPage() {
  const [trackers, setTrackers] = useState<RankTrackerWithResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [ascending, setAscending] = useState(false);
  const [form, setForm] = useState({ domain: '', keyword: '', country: 'us', language: 'en' });

  const fetchTrackers = async () => {
    setLoading(true);
    const response = await fetch('/api/rank-trackers');
    const data = await response.json();
    setTrackers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchTrackers(); }, []);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch('/api/rank-trackers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, domain: cleanDomain(form.domain), keyword: form.keyword.replace(/^["']|["']$/g, '') }),
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
    if (!confirm('Delete this rank tracker and its history?')) return;
    await fetch(`/api/rank-trackers/${id}`, { method: 'DELETE' });
    fetchTrackers();
  };

  const sortBy = (field: SortField) => {
    if (sortField === field) setAscending(value => !value);
    else { setSortField(field); setAscending(true); }
  };

  const visibleTrackers = useMemo(() => trackers
    .filter(tracker => `${tracker.domain} ${tracker.keyword}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      const aResult = a.results?.[0];
      const bResult = b.results?.[0];
      const values: Record<SortField, [string | number, string | number]> = {
        domain: [a.domain, b.domain],
        keyword: [a.keyword, b.keyword],
        position: [aResult?.position ?? 999, bResult?.position ?? 999],
        date: [aResult?.created_at || '', bResult?.created_at || ''],
      };
      const [aValue, bValue] = values[sortField];
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return ascending ? result : -result;
    }), [ascending, query, sortField, trackers]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="rounded-lg p-2 hover:bg-white"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <h1 className="text-3xl font-bold">Google Rank Tracker</h1>
              <p className="text-sm text-gray-600">Keyword checks use unquoted queries and run across the top 100 results.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(value => !value)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Tracker</button>
            <button onClick={handleCheckAll} disabled={checking || trackers.length === 0} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> {checking ? 'Checking...' : 'Check All'}</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-4">
            <input required value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="example.com or https://example.com" className="rounded-lg border px-3 py-2 text-sm" />
            <input required value={form.keyword} onChange={e => setForm({ ...form, keyword: e.target.value })} placeholder="Main keyword, without quotes" className="rounded-lg border px-3 py-2 text-sm" />
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="rounded-lg border px-3 py-2 text-sm"><option value="us">United States</option><option value="uk">United Kingdom</option><option value="nl">Netherlands</option><option value="de">Germany</option><option value="ca">Canada</option></select>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save Tracker</button>
          </form>
        )}

        <div className="mb-4 flex items-center gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter domains or keywords..." className="w-full max-w-md rounded-lg border bg-white px-4 py-2 text-sm" />
          <span className="text-sm text-gray-500">{visibleTrackers.length} trackers</span>
        </div>

        {loading ? <div className="py-12 text-center">Loading...</div> : (
          <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {([['domain', 'Domain'], ['keyword', 'Keyword'], ['position', 'Latest rank'], ['date', 'Last checked']] as [SortField, string][]).map(([field, label]) => (
                    <th key={field} className="px-4 py-3"><button onClick={() => sortBy(field)} className="font-semibold hover:text-blue-600">{label} {sortField === field ? (ascending ? '↑' : '↓') : '↕'}</button></th>
                  ))}
                  <th className="px-4 py-3">Last 7 checks</th><th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleTrackers.map(tracker => (
                  <tr key={tracker.id} className="align-top hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{tracker.domain}</td>
                    <td className="px-4 py-3 text-gray-700">{tracker.keyword}<div className="mt-1 text-xs uppercase text-gray-400">Google / {tracker.country}</div></td>
                    <td className="px-4 py-3"><span className="font-bold text-blue-600">{rankLabel(tracker.results?.[0]?.position ?? null)}</span>{tracker.results?.[0]?.url && <a href={tracker.results[0].url} target="_blank" rel="noreferrer" className="mt-1 flex max-w-[220px] items-center gap-1 truncate text-xs text-blue-500 hover:underline"><ExternalLink className="h-3 w-3 shrink-0" />{tracker.results[0].url}</a>}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600"><Calendar className="mr-1 inline h-4 w-4" />{tracker.results?.[0] ? new Date(tracker.results[0].created_at).toLocaleString() : 'Never checked'}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{(tracker.results || []).slice(0, 7).map((result: RankResult) => <span key={result.id} title={`${new Date(result.created_at).toLocaleString()} - ${result.url || 'Not in top 100'}`} className={`rounded px-2 py-1 text-xs font-medium ${result.position && result.position <= 10 ? 'bg-green-100 text-green-700' : result.position ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{result.position ? `#${result.position}` : '—'}</span>)}</div></td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(tracker.id)} className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Delete tracker"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
