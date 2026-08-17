import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

export async function GET() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, services:services(count)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('categories')
    .insert({ id: generateId(), name: body.name, description: body.description, icon: body.icon, color: body.color })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
