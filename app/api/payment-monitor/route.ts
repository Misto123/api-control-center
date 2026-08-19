import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `alr${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

// Keywords that indicate payment issues (Dutch and English)
const PAYMENT_KEYWORDS = [
  // Dutch
  'betaal',
  'factuur',
  'openstaand',
  'blokkade',
  'betaling',
  'achterstallig',
  'incasso',
  'herinnering',
  'budget thuis',
  'ziggo',
  'kpn',
  'odido',
  'vodafone',
  'energie',
  'gas',
  'stroom',
  'water',
  'belasting',
  'huur',
  'verzekering',
  // English
  'payment',
  'invoice',
  'overdue',
  'reminder',
  'bill',
  'due',
  'outstanding',
  'debt',
  'collection',
  'suspend',
  'disconnect',
];

function containsPaymentKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PAYMENT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

function extractTextFromHtml(html: string): string[] {
  const messages: string[] = [];
  
  // Remove script and style tags
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract text content from various patterns
  // Pattern 1: Between <p>, <div>, <span>, <td> tags
  const tagPattern = /<(?:p|div|span|td|li|h[1-6])[^>]*>([\s\S]*?)<\/(?:p|div|span|td|li|h[1-6])>/gi;
  let match;
  while ((match = tagPattern.exec(cleaned)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text.length > 20 && text.length < 1000 && containsPaymentKeywords(text)) {
      messages.push(text);
    }
  }
  
  // Pattern 2: Text nodes (fallback)
  if (messages.length === 0) {
    const lines = cleaned.split('\n');
    for (const line of lines) {
      const text = line.replace(/<[^>]*>/g, '').trim();
      if (text.length > 20 && text.length < 1000 && containsPaymentKeywords(text)) {
        messages.push(text);
      }
    }
  }
  
  // Deduplicate similar messages
  const uniqueMessages = messages.filter((msg, index) => {
    return messages.findIndex(m => m === msg) === index;
  });
  
  return uniqueMessages.slice(0, 10); // Return max 10 messages
}

async function checkUrl(url: string, username?: string, password?: string) {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    };
    
    // Add basic auth if provided
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    const response = await fetch(url, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        needsAuth: response.status === 401,
      };
    }

    const html = await response.text();
    const messages = extractTextFromHtml(html);

    return {
      success: true,
      messagesFound: messages.length,
      messages,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function createAlert(message: string, source: string) {
  await supabase.from('alerts').insert({
    id: generateId(),
    title: '💰 Payment Notification Detected',
    message: `${source}: ${message}`,
    severity: 'HIGH',
    source: 'Payment Monitor',
    isRead: false,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  
  // Support custom URL and auth from request
  const url = body.url || 'http://185.14.187.8:6903/';
  const username = body.username || process.env.TELEGRAM_USERNAME;
  const password = body.password || process.env.TELEGRAM_PASSWORD;
  
  const result = await checkUrl(url, username, password);

  if (!result.success) {
    if (result.needsAuth) {
      return NextResponse.json({
        status: 'Authentication required',
        error: 'Please provide username and password via environment variables or request body',
        hint: 'Set TELEGRAM_USERNAME and TELEGRAM_PASSWORD in Vercel environment variables',
      }, { status: 401 });
    }
    
    return NextResponse.json({
      status: 'Error checking URL',
      error: result.error,
    }, { status: 500 });
  }

  if (result.messages && result.messages.length > 0) {
    // Create alerts for payment messages
    for (const message of result.messages) {
      await createAlert(message, 'Telegram Monitor');
    }

    return NextResponse.json({
      status: 'Payment messages detected',
      count: result.messagesFound,
      alertsCreated: result.messages.length,
      samples: result.messages.slice(0, 3), // Show first 3 as samples
    });
  }

  return NextResponse.json({
    status: 'No payment messages found',
    checked: true,
    url,
  });
}

export async function GET() {
  // Allow manual trigger via GET as well
  return POST(new Request('http://localhost', { method: 'POST' }));
}
