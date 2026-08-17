import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('services')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Convert empty strings to null for foreign keys
  if (body.categoryId === '') body.categoryId = null;

  if (body.totalCredits !== undefined && body.usedCredits !== undefined) {
    body.creditsPercent = Math.round(
      ((body.totalCredits - body.usedCredits) / body.totalCredits) * 100
    );
  }

  const { data, error } = await supabase
    .from('services')
    .update(body)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await supabase.from('services').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
