'use client';

import { useState, useCallback } from 'react';
import { Eye, EyeOff, Copy, Check, RotateCw } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function ApiKeyInput({ value, onChange, label = 'API Key', placeholder = 'sk-...' }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const maskedValue = value
    ? value.substring(0, 4) + '•'.repeat(Math.max(0, value.length - 8)) + value.substring(value.length - 4)
    : '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative flex items-center">
        <input
          type={visible ? 'text' : 'password'}
          value={visible ? value : maskedValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-28 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
        />
        <div className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title={visible ? 'Hide' : 'Show'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!value}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors disabled:opacity-30"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => { const v = crypto.randomUUID(); onChange('sk-' + v); }}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Generate new key"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
