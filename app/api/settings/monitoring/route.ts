import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface MonitoringSettings {
  checkInterval: number;
  depletionWarningDays: number;
  lowCreditsThreshold: number;
  criticalCreditsThreshold: number;
}

async function getSettingValue(key: string, defaultValue: string): Promise<string> {
  const { data } = await supabase
    .from('global_settings')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value || defaultValue;
}

async function setSettingValue(key: string, value: string, description: string): Promise<void> {
  await supabase
    .from('global_settings')
    .upsert({
      id: `setting_${key}`,
      key,
      value,
      description,
    }, { onConflict: 'key' });
}

export async function GET() {
  const checkInterval = await getSettingValue('monitoring_check_interval', '3600');
  const depletionWarningDays = await getSettingValue('monitoring_depletion_warning_days', '10');
  const lowCreditsThreshold = await getSettingValue('monitoring_low_credits_threshold', '20');
  const criticalCreditsThreshold = await getSettingValue('monitoring_critical_credits_threshold', '10');

  return NextResponse.json({
    checkInterval: parseInt(checkInterval),
    depletionWarningDays: parseInt(depletionWarningDays),
    lowCreditsThreshold: parseInt(lowCreditsThreshold),
    criticalCreditsThreshold: parseInt(criticalCreditsThreshold),
  });
}

export async function PUT(request: NextRequest) {
  const body: MonitoringSettings = await request.json();

  await setSettingValue('monitoring_check_interval', body.checkInterval.toString(), 'Global monitoring check interval in seconds');
  await setSettingValue('monitoring_depletion_warning_days', body.depletionWarningDays.toString(), 'Days in advance to warn about credit depletion');
  await setSettingValue('monitoring_low_credits_threshold', body.lowCreditsThreshold.toString(), 'Low credits threshold percentage');
  await setSettingValue('monitoring_critical_credits_threshold', body.criticalCreditsThreshold.toString(), 'Critical credits threshold percentage');

  return NextResponse.json({ success: true });
}
