import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  if (body.action === 'read') update.isRead = true;
  if (body.action === 'acknowledge') update.isAcknowledged = true;
  if (body.action === 'dismiss') update.isDismissed = true;

  const { data, error } = await supabase
    .from('alerts')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
