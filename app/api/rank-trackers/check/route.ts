import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `rkr${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

async function getSerperApiKey() {
  const { data } = await supabase
    .from('services')
    .select('apiKey')
    .eq('slug', 'serper-dev')
    .single();
  return data?.apiKey;
}

async function checkRanking(keyword: string, domain: string, country: string, apiKey: string) {
  // Clean the keyword - remove quotes if present
  const cleanKeyword = keyword.replace(/^["']|["']$/g, '');
  
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: cleanKeyword,
      gl: country,
      num: 100, // Check top 100 results
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  const data = await response.json();
  const results = data.organic || [];

  // Clean the domain - remove protocol and www
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  // Find the domain in the results
  let position = null;
  let url = null;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    try {
      const resultUrl = new URL(result.link);
      const resultDomain = resultUrl.hostname.replace(/^www\./, '');
      
      // Check if result domain matches or is a subdomain/path of the target domain
      if (resultDomain === cleanDomain || resultDomain.endsWith('.' + cleanDomain)) {
        position = i + 1;
        url = result.link;
        break;
      }
    } catch (e) {
      // Skip invalid URLs
      continue;
    }
  }

  return { position, url };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { trackerId } = body;

  if (!trackerId) {
    // Check all trackers
    const { data: trackers } = await supabase
      .from('rank_trackers')
      .select('*');

    if (!trackers || trackers.length === 0) {
      return NextResponse.json({ message: 'No trackers to check' });
    }

    const apiKey = await getSerperApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Serper API key not configured' }, { status: 500 });
    }

    const results = [];

    for (const tracker of trackers) {
      try {
        const { position, url } = await checkRanking(
          tracker.keyword,
          tracker.domain,
          tracker.country,
          apiKey
        );

        // Save result
        const { data: result } = await supabase
          .from('rank_results')
          .insert({
            id: generateId(),
            tracker_id: tracker.id,
            position,
            url,
            date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        results.push({
          tracker: tracker.domain,
          keyword: tracker.keyword,
          position,
          url,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error checking ${tracker.domain}:`, error);
        results.push({
          tracker: tracker.domain,
          keyword: tracker.keyword,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({ checked: results.length, results });
  } else {
    // Check specific tracker
    const { data: tracker } = await supabase
      .from('rank_trackers')
      .select('*')
      .eq('id', trackerId)
      .single();

    if (!tracker) {
      return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
    }

    const apiKey = await getSerperApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'Serper API key not configured' }, { status: 500 });
    }

    const { position, url } = await checkRanking(
      tracker.keyword,
      tracker.domain,
      tracker.country,
      apiKey
    );

    // Save result
    const { data: result } = await supabase
      .from('rank_results')
      .insert({
        id: generateId(),
        tracker_id: tracker.id,
        position,
        url,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    return NextResponse.json(result);
  }
}
