import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateId() {
  return `alr${Date.now()}${Math.random().toString(36).substring(2, 10)}`;
}

// Keywords that indicate payment issues (Dutch)
const PAYMENT_KEYWORDS = [
  'betaal',
  'factuur',
  'openstaand',
  'blokkade',
  'betaling',
  'achterstallig',
  'incasso',
  'herinnering',
  'payment',
  'invoice',
  'overdue',
  'reminder',
];

function containsPaymentKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return PAYMENT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

async function checkTelegramMessages(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Look for payment-related messages in the HTML
    const paymentMessages: string[] = [];
    
    // Simple text extraction - look for common patterns
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (containsPaymentKeywords(line)) {
        // Extract text content (remove HTML tags)
        const textContent = line.replace(/<[^>]*>/g, '').trim();
        if (textContent.length > 20 && textContent.length < 500) {
          paymentMessages.push(textContent);
        }
      }
    }

    return {
      success: true,
      messagesFound: paymentMessages.length,
      messages: paymentMessages.slice(0, 5), // Return max 5 messages
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
  const url = 'http://185.14.187.8:6903/';
  
  const result = await checkTelegramMessages(url);

  if (result.success && result.messages && result.messages.length > 0) {
    // Create alerts for payment messages
    for (const message of result.messages) {
      await createAlert(message, 'Telegram Monitor');
    }

    return NextResponse.json({
      status: 'Payment messages detected',
      count: result.messagesFound,
      alertsCreated: result.messages.length,
      messages: result.messages,
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
  return POST(new Request('http://localhost'));
}
