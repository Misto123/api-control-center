import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `web${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

export async function GET() {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data: website, error } = await supabase
    .from('websites')
    .insert({
      id: generateId(),
      name: body.name,
      url: body.url,
      description: body.description || null,
      niche: body.niche || null,
      added_to_seo_flow: body.added_to_seo_flow || false,
      added_to_gctr: body.added_to_gctr || false,
      target_keywords: body.target_keywords || [],
      monthly_budget: body.monthly_budget || null,
      priority: body.priority || 'medium',
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-create rank tracker for each target keyword
  if (website && body.target_keywords && Array.isArray(body.target_keywords)) {
    const domain = new URL(website.url).hostname.replace(/^www\./, '');
    
    for (const keyword of body.target_keywords) {
      if (keyword && keyword.trim()) {
        await supabase.from('rank_trackers').insert({
          id: `rkt${Date.now()}${Math.random().toString(36).substring(2, 10)}`,
          domain,
          keyword: keyword.trim(),
          country: 'us',
          language: 'en',
        });
      }
    }
  }

  return NextResponse.json(website, { status: 201 });
}
