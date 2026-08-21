import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';
import type { ServiceInput } from '@/lib/types';

export async function GET() {
  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body: ServiceInput = await request.json();

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('services')
    .insert({
      id: generateId(),
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      status: 'NOT_CONFIGURED',
      apiUrl: body.apiUrl || null,
      apiKey: body.apiKey || null,
      checkEndpoint: body.checkEndpoint || null,
      totalCredits: body.totalCredits || null,
      usedCredits: body.usedCredits || null,
      creditsPercent: body.totalCredits && body.usedCredits
        ? Math.round(((body.totalCredits - body.usedCredits) / body.totalCredits) * 100)
        : null,
      credit_unit: body.credit_unit || 'credits',
      subscription_plan: body.subscription_plan || null,
      subscription_price: body.subscription_price || null,
      subscription_credits: body.subscription_credits || null,
      subscription_renewal_date: body.subscription_renewal_date || null,
      minimum_balance: body.minimum_balance ?? 5,
      lowCreditsThreshold: body.lowCreditsThreshold ?? 20,
      criticalCreditsThreshold: body.criticalCreditsThreshold ?? 10,
      depletionWarningDays: body.depletionWarningDays ?? 14,
      depletionCriticalDays: body.depletionCriticalDays ?? 7,
      highUsageThreshold: body.highUsageThreshold || null,
      slowResponseThreshold: body.slowResponseThreshold ?? 5000,
      monitoringEnabled: body.monitoringEnabled ?? true,
      checkInterval: body.checkInterval ?? 60,
      categoryId: body.categoryId || null,
    })
    .select('*, category:categories(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
