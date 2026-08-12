# Quick Start - Build the API Control Center

This guide will help you build a working application step-by-step.

## ✅ What's Already Done

- Next.js 14 project with TypeScript and Tailwind
- Complete database schema in `prisma/schema.prisma`
- All TypeScript types in `lib/types.ts`
- Prisma client setup
- All dependencies installed

## 🚀 Build Your Application

### Step 1: Set Up Your Database

1. Create a PostgreSQL database (I recommend Supabase):
   - Go to https://supabase.com
   - Create a new project
   - Get your connection string

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and add your database URL:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Push the database schema:
```bash
npx prisma db push
```

5. Open Prisma Studio to see your database:
```bash
npx prisma studio
```

### Step 2: Create a Simple Homepage

Create `app/page.tsx`:

```typescript
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">API Control Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Services</h2>
            <p className="text-gray-600">Manage your API services</p>
            <a href="/services" className="text-blue-600 mt-4 inline-block">
              View Services →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Alerts</h2>
            <p className="text-gray-600">Monitor alerts and notifications</p>
            <a href="/alerts" className="text-blue-600 mt-4 inline-block">
              View Alerts →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Projects</h2>
            <p className="text-gray-600">Organize services by project</p>
            <a href="/projects" className="text-blue-600 mt-4 inline-block">
              View Projects →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create Your First API Route

Create `app/api/services/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        _count: {
          select: { projects: true }
        }
      }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await prisma.service.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        apiUrl: body.apiUrl,
        status: 'NOT_CONFIGURED',
        monitoringEnabled: body.monitoringEnabled ?? true,
      }
    });
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
```

### Step 4: Create a Services Page

Create `app/services/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Services</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Service
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  service.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  service.status === 'DOWN' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {service.status}
                </span>
              </div>
              
              {service.description && (
                <p className="text-gray-600 mb-4">{service.description}</p>
              )}
              
              <div className="text-sm text-gray-500">
                Last checked: {service.lastCheckedAt ? new Date(service.lastCheckedAt).toLocaleString() : 'Never'}
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No services yet</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Add Your First Service
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 5: Test Your Application

```bash
npm run dev
```

Visit http://localhost:3000

You should see your homepage with three cards linking to Services, Alerts, and Projects.

### Step 6: Add Sample Data via Prisma Studio

1. Open Prisma Studio:
```bash
npx prisma studio
```

2. Create a test service:
   - Click on "Service"
   - Click "Add record"
   - Fill in:
     - name: "Serper.dev"
     - slug: "serper-dev"
     - description: "Google Search API"
     - status: "ACTIVE"
     - monitoringEnabled: true
   - Save

3. Refresh your services page - you should see the service!

## 📦 Next Steps - Build More Features

### Add More API Routes

Create these files to expand functionality:

1. **`app/api/projects/route.ts`** - Projects CRUD
2. **`app/api/alerts/route.ts`** - Alerts listing
3. **`app/api/categories/route.ts`** - Categories management
4. **`app/api/dashboard/summary/route.ts`** - Dashboard stats

### Add More Pages

1. **`app/projects/page.tsx`** - Projects list
2. **`app/alerts/page.tsx`** - Alerts center
3. **`app/settings/page.tsx`** - Settings and configuration

### Add Monitoring

Create `lib/monitoring/checker.ts`:

```typescript
import { prisma } from '../prisma';

export async function checkService(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });
  
  if (!service || !service.apiUrl) return;

  try {
    const startTime = Date.now();
    const response = await fetch(service.apiUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    const responseTime = Date.now() - startTime;

    // Record metric
    await prisma.serviceMetric.create({
      data: {
        serviceId,
        responseTime,
        statusCode: response.status,
        isUp: response.ok,
        timestamp: new Date()
      }
    });

    // Update service status
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status: response.ok ? 'ACTIVE' : 'DOWN',
        lastCheckedAt: new Date()
      }
    });

    console.log(`✓ Checked ${service.name}: ${response.status} (${responseTime}ms)`);
  } catch (error) {
    console.error(`✗ Failed to check ${service.name}:`, error);
    
    // Mark as down
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status: 'DOWN',
        lastCheckedAt: new Date()
      }
    });
  }
}
```

### Add Notifications

Create `lib/notifications/slack.ts`:

```typescript
export async function sendSlackNotification(webhookUrl: string, message: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return false;
  }
}
```

## 🎨 Improve the UI

Install Shadcn UI for better components:

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
```

## 📚 Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts** (for charts): https://recharts.org

## 🐛 Troubleshooting

### Database connection fails
- Check your DATABASE_URL in `.env`
- Make sure your IP is allowed in Supabase
- Test connection: `npx prisma db push`

### TypeScript errors
- Run: `npm run build` to see all errors
- Make sure Prisma client is generated: `npx prisma generate`

### Page not found
- Check file names match exactly (case-sensitive)
- Make sure you're using the App Router structure
- Restart dev server: `npm run dev`

## 💡 Tips

1. **Start Simple**: Build one feature at a time
2. **Use Prisma Studio**: Great for testing and viewing data
3. **Check Console**: Open browser dev tools to see errors
4. **Read Error Messages**: They usually tell you exactly what's wrong
5. **Use the Existing Schema**: Everything is already designed - just build the UI!

## 🎯 Your Goal

Build a functional app where you can:
1. ✅ Add services
2. ✅ See service status
3. ✅ View alerts
4. ✅ Group services into projects
5. ✅ Get Slack notifications

Start with the basics and add features incrementally!
