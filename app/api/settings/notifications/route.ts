import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

export async function GET() {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: created, error: cErr } = await supabase
      .from('notification_settings')
      .insert({ id: generateId() })
      .select()
      .single();
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    return NextResponse.json(created);
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const { data: existing } = await supabase
    .from('notification_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('notification_settings')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .insert({ id: generateId(), ...body })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
