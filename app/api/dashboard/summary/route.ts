import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: services, error: sErr } = await supabase
    .from('services')
    .select('id, status, creditsPercent');

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  const { count: totalAlerts, error: aErr } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true });

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  const { count: unreadAlerts, error: uErr } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('isRead', false);

  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

  const total = services?.length ?? 0;
  const active = services?.filter((s) => s.status === 'ACTIVE').length ?? 0;
  const down = services?.filter((s) => s.status === 'DOWN').length ?? 0;
  const notConfigured = services?.filter((s) => s.status === 'NOT_CONFIGURED').length ?? 0;
  const lowCredits = services?.filter((s) => s.creditsPercent !== null && s.creditsPercent < 20).length ?? 0;

  return NextResponse.json({
    totalServices: total,
    activeServices: active,
    downServices: down,
    notConfiguredServices: notConfigured,
    totalAlerts: totalAlerts ?? 0,
    unreadAlerts: unreadAlerts ?? 0,
    lowCreditsCount: lowCredits,
    averageUptime30d: 99.9,
  });
}
