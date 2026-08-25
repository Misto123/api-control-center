'use client';

import { useState } from 'react';
import { Activity, AlertCircle, Eye, EyeOff, Copy, Check, Trash2, Pencil, Key } from 'lucide-react';
import type { Service } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => Promise<void>;
}

function formatCredits(amount: number, unit: string | null): string {
  const unitStr = unit || 'credits';
  if (unitStr === 'USD') return `$${amount.toFixed(2)}`;
  if (unitStr === 'EUR') return `€${amount.toFixed(2)}`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ${unitStr}`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K ${unitStr}`;
  return `${amount.toFixed(unitStr === 'USD' || unitStr === 'EUR' ? 2 : 0)} ${unitStr}`;
}

function formatBalance(service: Service): string | null {
  if (service.totalCredits === null && service.usedCredits === null) return null;
  const amount = service.credit_unit === 'USD' || service.credit_unit === 'EUR'
    ? service.totalCredits ?? 0
    : service.totalCredits !== null && service.usedCredits !== null
      ? service.totalCredits - service.usedCredits
      : service.totalCredits ?? service.usedCredits ?? 0;
  return formatCredits(amount, service.credit_unit);
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const maskApiKey = (key: string) => {
    if (key.length <= 4) return '****';
    return '•'.repeat(key.length - 4) + key.slice(-4);
  };

  const copyKey = async () => {
    if (!service.apiKey) return;
    await navigator.clipboard.writeText(service.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(service.id);
  };

  const maskedKey = service.apiKey
    ? service.apiKey.substring(0, 4) + '•'.repeat(Math.max(0, service.apiKey.length - 8)) + service.apiKey.substring(service.apiKey.length - 4)
    : null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'DOWN': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCreditColor = (pct: number | null) => {
    if (pct === null) return 'text-gray-400';
    if (pct < 20) return 'text-red-600';
    if (pct < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getCreditBarColor = (pct: number | null) => {
    if (pct === null) return 'bg-gray-300';
    if (pct < 20) return 'bg-red-500';
    if (pct < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const balance = formatBalance(service);
  const displayStatus = service.status_detail === 'logged_out' ? 'Logged out' : service.status === 'ACTIVE' ? 'Online' : service.status === 'DOWN' ? 'Offline' : 'Pending connection';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-semibold">{service.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(service.status)}`}>
                ● {displayStatus}
              </span>
            </div>
            {service.description && <p className="text-gray-600 text-sm">{service.description}</p>}
            {service.category && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                {service.category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(service)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Key className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">API Key</span>
          </div>
          {service.apiKey ? (
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-gray-800 flex-1 truncate">
                {showKey ? service.apiKey : maskApiKey(service.apiKey)}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title={showKey ? 'Hide' : 'Show'}>
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={copyKey} className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No API key configured</p>
          )}
        </div>

        {balance !== null ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-gray-600 text-sm mb-2">Balance</div>
            <div className="text-2xl font-bold text-gray-900">{balance} <span className="text-sm font-normal text-gray-500">{service.credit_unit || 'credits'}</span></div>
          </div>
          <div>
            <div className="text-gray-600 text-sm mb-2">Last check</div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-5 w-5 text-blue-500" />
              {service.lastCheckedAt ? new Date(service.lastCheckedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not checked yet'}
            </div>
          </div>
        </div> : (
          <div className="flex items-center gap-2 border-t border-gray-100 pt-4 text-sm font-semibold">
            <Activity className={`h-5 w-5 ${service.status === 'ACTIVE' ? 'text-green-500' : service.status === 'DOWN' ? 'text-red-500' : 'text-yellow-500'}`} />
            {displayStatus}
          </div>
        )}

        {/* Subscription Info */}
        {service.subscription_plan && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-semibold text-blue-900 mb-2">💳 Subscription Details</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600 text-xs">Plan</div>
                <div className="font-medium text-gray-900">{service.subscription_plan}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Price</div>
                <div className="font-medium text-gray-900">${service.subscription_price}/mo</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Monthly Credits</div>
                <div className="font-medium text-gray-900">{service.subscription_credits?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Renewal Date</div>
                <div className="font-medium text-gray-900">
                  {service.subscription_renewal_date ? new Date(service.subscription_renewal_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
