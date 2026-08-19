# Payment Monitor Setup Guide

## Overview
The Payment Monitor checks specified URLs daily for payment-related notifications (invoices, bills, reminders) and creates alerts automatically.

## How It Works

### 1. **Flexible Scraping**
The monitor uses multiple text extraction methods:
- Extracts text from HTML tags: `<p>`, `<div>`, `<span>`, `<td>`, `<li>`, `<h1-6>`
- Falls back to line-by-line text extraction
- Removes scripts, styles, and HTML markup
- Deduplicates similar messages

### 2. **Multi-Provider Support**
Detects payment keywords in **Dutch and English**:

**Dutch Keywords:**
- betaal, factuur, openstaand, blokkade, herinnering
- budget thuis, ziggo, kpn, odido, vodafone
- energie, gas, stroom, water, belasting, huur, verzekering

**English Keywords:**
- payment, invoice, overdue, reminder, bill, due
- outstanding, debt, collection, suspend, disconnect

### 3. **Authentication Support**
Handles password-protected URLs via:
- HTTP Basic Auth
- Environment variables: `TELEGRAM_USERNAME` and `TELEGRAM_PASSWORD`
- Or pass credentials in API request body

## Setup Instructions

### Step 1: Add Environment Variables (If URL requires auth)

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   ```
   TELEGRAM_USERNAME = your_username
   TELEGRAM_PASSWORD = your_password
   ```
3. Redeploy

### Step 2: Configure Monitored URL

**Option A: Use default URL**
- Current: `http://185.14.187.8:6903/`
- Auto-checked daily at 9:00 AM

**Option B: Add custom URLs**
Edit `/app/api/payment-monitor/route.ts`:
```typescript
const MONITORED_URLS = [
  { url: 'http://185.14.187.8:6903/', name: 'Telegram Monitor' },
  { url: 'https://your-other-url.com', name: 'Email Forwarder' },
];
```

### Step 3: Test Manually

Click **"Check Payments"** button on the dashboard to test immediately.

## API Usage

### Manual Check via API
```bash
# With default URL
curl -X POST https://api-control-center.vercel.app/api/payment-monitor

# With custom URL and auth
curl -X POST https://api-control-center.vercel.app/api/payment-monitor \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://your-url.com",
    "username": "user",
    "password": "pass"
  }'
```

### Response Examples

**Success (messages found):**
```json
{
  "status": "Payment messages detected",
  "count": 3,
  "alertsCreated": 3,
  "samples": [
    "Let op! Betaal uw openstaande factuur van € 20,66...",
    "Reminder: Your invoice is overdue...",
    "Budget Thuis: Betaal voor 22:00 uur..."
  ]
}
```

**No messages:**
```json
{
  "status": "No payment messages found",
  "checked": true,
  "url": "http://185.14.187.8:6903/"
}
```

**Auth required:**
```json
{
  "status": "Authentication required",
  "error": "Please provide username and password",
  "hint": "Set TELEGRAM_USERNAME and TELEGRAM_PASSWORD in environment variables"
}
```

## Automatic Schedule

- **Daily check:** Every day at 9:00 AM (UTC)
- **Configured in:** `vercel.json`
- **Cron expression:** `0 9 * * *`

## Alert Format

When payment issues detected:
```
Title: 💰 Payment Notification Detected
Message: Telegram Monitor: Let op! Betaal uw openstaande factuur...
Severity: HIGH
Source: Payment Monitor
```

Alerts appear on:
- Dashboard (unread count badge)
- Alerts page (/alerts)
- Email notifications (if configured)

## Troubleshooting

### URL returns 401
→ Add username/password via environment variables

### No messages detected
→ Check if URL contains actual payment keywords
→ Inspect HTML structure (may need custom parsing)

### Messages in different format
→ Add custom keywords to `PAYMENT_KEYWORDS` array
→ Or adjust `extractTextFromHtml()` function for specific HTML structure

## Extending for Multiple Providers

To monitor multiple URLs with different formats:

1. Create provider-specific parsers:
```typescript
function parseTelegramHtml(html: string) { ... }
function parseEmailForwarder(html: string) { ... }
function parseCustomProvider(html: string) { ... }
```

2. Route to appropriate parser based on URL
3. Keep keyword detection flexible for all providers
