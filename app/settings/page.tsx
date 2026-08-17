'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Send, MessageSquare, Activity } from 'lucide-react';

interface NotificationSettings {
  id: string;
  slackEnabled: boolean;
  slackWebhookUrl: string | null;
  slackChannel: string | null;
  telegramEnabled: boolean;
  telegramBotToken: string | null;
  telegramChatId: string | null;
  emailEnabled: boolean;
  emailRecipients: string | null;
  downReminderEnabled: boolean;
  downReminderInterval: number | null;
}

interface MonitoringSettings {
  checkInterval: number;
  depletionWarningDays: number;
  lowCreditsThreshold: number;
  criticalCreditsThreshold: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [monitoringSettings, setMonitoringSettings] = useState<MonitoringSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    const [notifRes, monitorRes] = await Promise.all([
      fetch('/api/settings/notifications'),
      fetch('/api/settings/monitoring'),
    ]);
    const [notifData, monitorData] = await Promise.all([
      notifRes.json(),
      monitorRes.json(),
    ]);
    setSettings(notifData);
    setMonitoringSettings(monitorData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings || !monitoringSettings) return;
    setSaving(true);
    await Promise.all([
      fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
      fetch('/api/settings/monitoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monitoringSettings),
      }),
    ]);
    setSaving(false);
  };

  const update = (key: string, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const updateMonitoring = (key: string, value: unknown) => {
    if (!monitoringSettings) return;
    setMonitoringSettings({ ...monitoringSettings, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-gray-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto p-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-600" /> Settings
        </h1>
        <p className="text-gray-600 mb-8">Configure notifications and monitoring settings</p>

        {settings && monitoringSettings && (
          <div className="space-y-6">
            {/* Monitoring Settings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Global Monitoring Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check Interval (seconds)</label>
                  <input
                    type="number"
                    value={monitoringSettings.checkInterval}
                    onChange={(e) => updateMonitoring('checkInterval', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm"
                    min="60"
                    step="60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 3600 (1 hour)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depletion Warning (days in advance)</label>
                  <input
                    type="number"
                    value={monitoringSettings.depletionWarningDays}
                    onChange={(e) => updateMonitoring('depletionWarningDays', Number(e.target.value))}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when credits will run out in X days</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Credits Threshold (%)</label>
                    <input
                      type="number"
                      value={monitoringSettings.lowCreditsThreshold}
                      onChange={(e) => updateMonitoring('lowCreditsThreshold', Number(e.target.value))}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Critical Credits Threshold (%)</label>
                    <input
                      type="number"
                      value={monitoringSettings.criticalCreditsThreshold}
                      onChange={(e) => updateMonitoring('criticalCreditsThreshold', Number(e.target.value))}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slack */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" /> Slack Integration
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.slackEnabled} onChange={(e) => update('slackEnabled', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">Enable Slack Notifications</span>
                </label>
                {settings.slackEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input type="url" value={settings.slackWebhookUrl || ''} onChange={(e) => update('slackWebhookUrl', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg text-sm" placeholder="https://hooks.slack.com/..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channel (optional)</label>
                      <input type="text" value={settings.slackChannel || ''} onChange={(e) => update('slackChannel', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg text-sm" placeholder="#alerts" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Telegram */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" /> Telegram Integration
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.telegramEnabled} onChange={(e) => update('telegramEnabled', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">Enable Telegram Notifications</span>
                </label>
                {settings.telegramEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                      <input type="text" value={settings.telegramBotToken || ''} onChange={(e) => update('telegramBotToken', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                      <input type="text" value={settings.telegramChatId || ''} onChange={(e) => update('telegramChatId', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg text-sm" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Down Reminder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Down Alert Reminders</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={settings.downReminderEnabled} onChange={(e) => update('downReminderEnabled', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium">Send reminders while service is down</span>
                </label>
                {settings.downReminderEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Interval (minutes)</label>
                    <input type="number" value={settings.downReminderInterval ?? 30} onChange={(e) => update('downReminderInterval', Number(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg text-sm" />
                  </div>
                )}
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg text-sm ${testResult.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {testResult}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
