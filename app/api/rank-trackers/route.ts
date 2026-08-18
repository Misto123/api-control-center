import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `rkt${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

export async function GET() {
  const { data: trackers, error } = await supabase
    .from('rank_trackers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get latest result for each tracker
  const trackersWithResults = await Promise.all(
    (trackers || []).map(async (tracker) => {
      const { data: latestResult } = await supabase
        .from('rank_results')
        .select('*')
        .eq('tracker_id', tracker.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      return { ...tracker, latestResult };
    })
  );

  return NextResponse.json(trackersWithResults);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.domain || !body.keyword) {
    return NextResponse.json({ error: 'domain and keyword are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('rank_trackers')
    .insert({
      id: generateId(),
      domain: body.domain,
      keyword: body.keyword,
      country: body.country || 'us',
      language: body.language || 'en',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
