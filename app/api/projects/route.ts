import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_services(serviceId, service:services(id, name, status))')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.slug) {
    return NextResponse.json({ error: 'name and slug required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description,
      color: body.color,
      icon: body.icon,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
