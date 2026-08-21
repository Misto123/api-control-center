import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 'settings')
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || { id: 'settings', seo_flow_api_key: null, gctr_api_key: null });
}

export async function PUT(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      id: 'settings',
      seo_flow_api_key: body.seo_flow_api_key || null,
      gctr_api_key: body.gctr_api_key || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
