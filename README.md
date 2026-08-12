# API Control Center

A comprehensive monitoring and management platform for tracking API services, credits, uptime, and sending alerts via Slack and Telegram.

## Features

### 🎯 Core Functionality
- **Service Monitoring** - Track multiple API services with configurable health checks
- **Status Tracking** - Real-time service status (Active, Down, Not Configured)
- **Credits Management** - Monitor API credit consumption and remaining balance
- **Uptime Tracking** - Historical uptime data with visual charts (24h, 7d, 30d, 90d)
- **Response Time Monitoring** - Track API response times and performance metrics

### 🚨 Alerts & Notifications
- **Smart Alert Engine** - Configurable thresholds per service:
  - Service Down / Recovery
  - Low Credits (default: 20%)
  - Critical Credits (default: 10%)
  - Estimated Depletion (default: 14 days warning, 7 days critical)
  - High Usage detection
  - Slow Response detection

- **Multi-Channel Notifications**:
  - Slack integration with webhook support
  - Telegram bot integration
  - Email notifications (planned)
  - Per-channel alert type configuration
  - Test alert functionality

- **Alert Deduplication** - Prevents spam by sending alerts only once until resolved
- **Alert History** - Complete audit trail of all alerts
- **Notification Logging** - Track delivery status and failures

### 📊 Projects Management
- **Project Organization** - Group services by project
- **Many-to-Many Relationships** - Services can belong to multiple projects
- **Project Dashboard** - See all services used by each project
- **Service Impact View** - See which projects depend on each service

### 📈 Dashboard & Analytics
- **Service Cards** - Visual cards showing status, credits, uptime
- **Uptime Visualization** - 30-day uptime bars with hover details
- **Summary Statistics** - Active/Down/Not Configured counts
- **Alert Center** - Centralized view of all alerts with filtering
- **Response Time Charts** - Historical performance data

### ⚙️ Configuration
- **Per-Service Thresholds** - Customize alert thresholds for each service
- **Category Management** - Organize services into categories
- **Flexible Monitoring** - Configure check intervals per service
- **Notification Settings** - Control which alerts go to which channels

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **UI Components**: Lucide React (icons), Recharts (charts)
- **Notifications**: Slack Webhooks, Telegram Bot API
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- (Optional) Slack workspace with webhook URL
- (Optional) Telegram bot token and chat ID

### Installation

1. **Clone and install dependencies**:
```bash
cd api-control-center
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Slack (stored in database, but can be set here for initial setup)
SLACK_WEBHOOK_URL="your-slack-webhook-url"

# Optional: Telegram (stored in database, but can be set here for initial setup)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"
```

3. **Set up the database**:
```bash
# Push the schema to your database
npx prisma db push

# (Optional) Seed with sample data
npm run seed
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open the application**:
```
http://localhost:3000
```

## Database Setup

### Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection String
3. Copy the connection string and add it to `.env` as `DATABASE_URL`
4. Run `npx prisma db push` to create tables

### Using Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:
```sql
CREATE DATABASE api_control_center;
```
3. Add connection string to `.env`:
```env
DATABASE_URL="postgresql://localhost:5432/api_control_center"
```
4. Run `npx prisma db push`

## Configuration

### Adding Services

1. Navigate to **Services** page
2. Click **Add Service**
3. Fill in:
   - Name (e.g., "Serper.dev")
   - Description
   - API URL
   - Category
   - Credit thresholds (optional, uses defaults)
   - Monitoring interval (default: 60 seconds)

### Setting Up Slack Notifications

1. Create a Slack App and Incoming Webhook:
   - Go to https://api.slack.com/apps
   - Create New App → From Scratch
   - Enable Incoming Webhooks
   - Add New Webhook to Workspace
   - Copy the Webhook URL

2. In API Control Center:
   - Go to **Settings** → **Notifications**
   - Enable Slack
   - Paste Webhook URL
   - Configure which alert types to send
   - Click **Send Test Alert** to verify

### Setting Up Telegram Notifications

1. Create a Telegram Bot:
   - Message @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. Get your Chat ID:
   - Message your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your `chat.id` in the response

3. In API Control Center:
   - Go to **Settings** → **Notifications**
   - Enable Telegram
   - Paste Bot Token and Chat ID
   - Configure alert types
   - Click **Send Test Alert** to verify

### Creating Projects

1. Go to **Projects** page
2. Click **Create Project**
3. Add project details (name, description, color, icon)
4. Associate services with the project
5. View project dashboard to see all related services

## Architecture

### Database Schema

```
Category
  ↓
Service ←→ Project (many-to-many via ProjectService)
  ↓
ServiceMetric (time-series data)
UptimeRecord (daily aggregates)
Alert
  ↓
Notification (multi-channel delivery)

NotificationSettings (global config)
GlobalSettings (key-value store)
```

### Key Entities

- **Service**: API service being monitored
- **ServiceMetric**: Individual check results (response time, status, credits)
- **UptimeRecord**: Daily uptime aggregates for historical charts
- **Alert**: Generated when thresholds are breached
- **Notification**: Delivery attempts to Slack/Telegram/Email
- **Project**: Logical grouping of services
- **ProjectService**: Junction table for many-to-many relationship

### Alert Deduplication Logic

- When a service goes DOWN, one alert is created with `isActive = true`
- No new DOWN alerts are sent while `isActive = true`
- When service recovers, the alert is resolved and a RECOVERED alert is sent
- Credit alerts follow similar logic based on threshold crossing

### Monitoring System

The monitoring system runs as a cron job that:
1. Checks each enabled service at its configured interval
2. Records metrics (response time, status, credits)
3. Updates service status (ACTIVE/DOWN)
4. Triggers alerts based on configured thresholds
5. Sends notifications to configured channels
6. Updates daily uptime records

## API Routes

- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

- `GET /api/alerts` - List alerts with filtering
- `POST /api/alerts/[id]/read` - Mark alert as read
- `POST /api/alerts/[id]/acknowledge` - Acknowledge alert
- `POST /api/alerts/mark-all-read` - Mark all as read

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/projects/[id]/services` - Add service to project

- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings
- `POST /api/notifications/test` - Send test notification

- `GET /api/dashboard/summary` - Get dashboard statistics
- `GET /api/metrics/[serviceId]` - Get service metrics
- `GET /api/uptime/[serviceId]` - Get uptime data

## Development

### Project Structure

```
api-control-center/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── page.tsx       # Dashboard home
│   │   ├── services/      # Services pages
│   │   ├── projects/      # Projects pages
│   │   ├── alerts/        # Alerts center
│   │   ├── categories/    # Categories management
│   │   └── settings/      # Settings pages
│   ├── api/               # API routes
│   │   ├── services/
│   │   ├── alerts/
│   │   ├── projects/
│   │   ├── notifications/
│   │   └── settings/
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/
│   ├── services/
│   ├── alerts/
│   ├── projects/
│   ├── ui/
│   └── layout/
├── lib/                   # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── types.ts           # TypeScript types
│   ├── alerts/            # Alert engine
│   ├── monitoring/        # Monitoring system
│   └── notifications/     # Notification services
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

Slack and Telegram credentials are stored in the database via the Settings UI.

## Roadmap

- [ ] Email notifications
- [ ] SMS alerts via Twilio
- [ ] API usage per project tracking
- [ ] Cost analysis per project
- [ ] Custom dashboards
- [ ] Alert escalation policies
- [ ] Maintenance windows
- [ ] API key rotation reminders
- [ ] Team collaboration features
- [ ] Audit logs
- [ ] Export reports (PDF/CSV)
- [ ] Mobile app
- [ ] Public status pages

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
