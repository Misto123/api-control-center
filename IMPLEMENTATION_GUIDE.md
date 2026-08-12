# API Control Center - Implementation Guide

This document outlines the complete architecture and provides guidance for implementing the remaining features of the API Control Center.

## Current Status

### ✅ Completed
- [x] Project scaffolding with Next.js 14 + TypeScript + Tailwind CSS
- [x] Complete database schema with Prisma ORM
- [x] Core TypeScript types and interfaces
- [x] Prisma client configuration (Prisma 7 compatible)
- [x] Comprehensive documentation (README.md)
- [x] Environment configuration (.env.example)

### 🔨 To Be Implemented

The following components need to be built to complete the application:

## 1. Core Library Functions

### `/lib/notifications/slack.ts`
Slack notification service using webhooks.

```typescript
export async function sendSlackNotification(webhookUrl: string, alert: Alert, service: Service)
export async function testSlackConnection(webhookUrl: string)
```

### `/lib/notifications/telegram.ts`
Telegram notification service using Bot API.

```typescript
export async function sendTelegramNotification(botToken: string, chatId: string, alert: Alert, service: Service)
export async function testTelegramConnection(botToken: string, chatId: string)
```

### `/lib/alerts/engine.ts`
Alert generation engine that:
- Checks service metrics against thresholds
- Creates alerts with deduplication
- Triggers notifications
- Handles alert lifecycle (active → resolved)

```typescript
export async function evaluateServiceAlerts(service: Service, metrics: ServiceMetric[])
export async function checkCreditThresholds(service: Service)
export async function checkDepletionEstimates(service: Service)
export async function resolveActiveAlerts(serviceId: string, alertType: AlertType)
```

### `/lib/monitoring/service-checker.ts`
Service health checker that:
- Pings service APIs
- Records metrics (response time, status)
- Updates service status
- Aggregates daily uptime

```typescript
export async function checkService(service: Service): Promise<ServiceMetric>
export async function updateDailyUptime(serviceId: string, isUp: boolean, duration: number)
export async function calculateUptimeStats(serviceId: string, days: number)
```

### `/lib/utils/calculations.ts`
Utility functions for:
- Credit depletion estimation
- Uptime percentage calculation
- Response time statistics (avg, P95)

```typescript
export function estimateDepletionDays(usedCredits: number, totalCredits: number, dailyUsage: number): number
export function calculateUptimePercent(upMinutes: number, totalMinutes: number): number
export function calculateResponseStats(metrics: ServiceMetric[])
```

## 2. API Routes

### Services API
- `GET /api/services` - List all services with filters
- `POST /api/services` - Create new service
- `GET /api/services/[id]` - Get service details with metrics
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service
- `POST /api/services/[id]/check` - Manually trigger health check

### Alerts API
- `GET /api/alerts` - List alerts (filter by service, type, date, read status)
- `POST /api/alerts/[id]/read` - Mark as read
- `POST /api/alerts/[id]/acknowledge` - Acknowledge alert
- `POST /api/alerts/[id]/dismiss` - Dismiss alert
- `POST /api/alerts/mark-all-read` - Bulk mark as read

### Projects API
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project with services
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete/Archive project
- `POST /api/projects/[id]/services` - Add service to project
- `DELETE /api/projects/[id]/services/[serviceId]` - Remove service

### Settings API
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings
- `POST /api/settings/notifications/test` - Send test notification

### Dashboard API
- `GET /api/dashboard/summary` - Get dashboard statistics
- `GET /api/metrics/[serviceId]` - Get service metrics (time-series)
- `GET /api/uptime/[serviceId]` - Get uptime data

### Categories API
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

## 3. React Components

### Layout Components

#### `/components/layout/Sidebar.tsx`
Main navigation sidebar with:
- Dashboard link
- Services link
- Projects link
- Alerts link (with unread count badge)
- Categories link
- Settings link

#### `/components/layout/Header.tsx`
Top header with:
- Current page title
- Breadcrumbs
- User actions (future: profile, logout)

### Dashboard Components

#### `/components/dashboard/ServiceCard.tsx`
Service card displaying:
- Service name and status indicator
- Credits bar (visual percentage)
- Estimated depletion time
- 30-day uptime mini-bar
- Project count
- Quick actions (view, edit)

#### `/components/dashboard/DashboardSummary.tsx`
Summary statistics:
- Total services count
- Active/Down/Not Configured breakdown
- Alert counts
- Low credits warnings
- Average uptime

#### `/components/dashboard/UptimeBar.tsx`
Visual uptime bar with:
- 30 segments (one per day)
- Color coding (green=up, red=down, gray=no data)
- Tooltip on hover showing date and uptime %

### Service Components

#### `/components/services/ServiceForm.tsx`
Form for creating/editing services:
- Name, slug, description
- API URL and credentials
- Category selection
- Credit thresholds (with defaults)
- Monitoring configuration

#### `/components/services/ServiceDetail.tsx`
Detailed service view:
- Current status
- Credit information
- Uptime statistics (24h, 7d, 30d, 90d)
- Response time chart
- Recent alerts
- Projects using this service
- Configuration panel

#### `/components/services/ResponseTimeChart.tsx`
Chart showing response time over time using Recharts.

### Alert Components

#### `/components/alerts/AlertList.tsx`
List of alerts with:
- Filtering (service, type, date, status)
- Sorting
- Pagination
- Bulk actions

#### `/components/alerts/AlertCard.tsx`
Individual alert display:
- Icon based on severity
- Service name
- Alert message
- Timestamp
- Actions (read, acknowledge, dismiss)

#### `/components/alerts/AlertFilters.tsx`
Filter controls for alerts.

### Project Components

#### `/components/projects/ProjectCard.tsx`
Project card showing:
- Project name and description
- Service count
- Active/Down service status
- Quick link to project detail

#### `/components/projects/ProjectForm.tsx`
Form for creating/editing projects.

#### `/components/projects/ProjectDetail.tsx`
Detailed project view:
- Project information
- List of associated services
- Add/remove service actions
- Service status summary

#### `/components/projects/ServiceSelector.tsx`
Multi-select component for choosing services.

### Settings Components

#### `/components/settings/NotificationSettings.tsx`
Notification configuration:
- Slack enable/disable + webhook URL
- Telegram enable/disable + bot config
- Alert type toggles per channel
- Test notification buttons

#### `/components/settings/ThresholdSettings.tsx`
Global and per-service threshold configuration.

### UI Components

Create reusable UI components in `/components/ui/`:
- `Button.tsx` - Styled buttons
- `Badge.tsx` - Status badges
- `Card.tsx` - Container cards
- `Input.tsx` - Form inputs
- `Select.tsx` - Dropdowns
- `Toggle.tsx` - On/off switches
- `Modal.tsx` - Modal dialogs
- `Tooltip.tsx` - Hover tooltips
- `Spinner.tsx` - Loading indicators

## 4. App Routes (Pages)

### `/app/(dashboard)/page.tsx`
Dashboard home page:
- Dashboard summary
- Service cards grid
- Recent alerts

### `/app/(dashboard)/services/page.tsx`
Services list page with category filters.

### `/app/(dashboard)/services/[slug]/page.tsx`
Service detail page.

### `/app/(dashboard)/services/new/page.tsx`
Create new service form.

### `/app/(dashboard)/projects/page.tsx`
Projects list page.

### `/app/(dashboard)/projects/[slug]/page.tsx`
Project detail page.

### `/app/(dashboard)/projects/new/page.tsx`
Create new project form.

### `/app/(dashboard)/alerts/page.tsx`
Alerts center with filters.

### `/app/(dashboard)/categories/page.tsx`
Categories management.

### `/app/(dashboard)/settings/page.tsx`
Settings page with tabs:
- Notifications
- Thresholds
- General

## 5. Background Jobs

### Monitoring Cron Job
Create a cron job (using node-cron or Vercel Cron Jobs) that:
1. Runs every minute
2. Fetches all services where `monitoringEnabled = true`
3. For each service due for a check (based on `checkInterval`):
   - Call `checkService()`
   - Record metric
   - Update service status
   - Evaluate alerts
   - Send notifications if needed
4. Update daily uptime records

Implementation options:
- **Development**: Use node-cron in `/lib/cron/monitor.ts`
- **Production**: Use Vercel Cron Jobs at `/app/api/cron/monitor/route.ts`

### Daily Aggregation Job
Runs once per day to:
- Calculate uptime percentages
- Archive old metrics
- Clean up resolved alerts

## 6. Styling

### Tailwind Configuration
Extend `tailwind.config.ts` with:
- Custom colors for status (green for active, red for down, gray for not configured)
- Alert severity colors (blue for info, yellow for warning, red for critical)
- Custom spacing and typography

### Global Styles
Update `app/globals.css` with:
- Base styles
- Typography scale
- Component styles
- Animations (fade-in, slide-in, pulse for alerts)

## 7. Data Seeding

Create `/prisma/seed.ts` to populate sample data:
- Categories (APIs, Databases, Infrastructure, AI Services)
- Services (Serper.dev, DeepSeek, Supabase, Runware, etc.)
- Sample metrics
- Sample uptime records
- Sample alerts

## 8. Testing Strategy

### Unit Tests
- Alert engine logic
- Calculation utilities
- Notification services

### Integration Tests
- API route handlers
- Database operations

### E2E Tests
- User workflows (create service, view alerts, configure notifications)

## 9. Security Considerations

- **API Keys**: Encrypt sensitive data (API keys, webhook URLs) in database
- **Authentication**: Add NextAuth.js for user authentication (future)
- **Authorization**: Ensure only authenticated users can access/modify data
- **Rate Limiting**: Implement rate limiting on API routes
- **Input Validation**: Validate all inputs using Zod or similar
- **CORS**: Configure appropriate CORS headers

## 10. Performance Optimization

- **Database Indexing**: Already defined in Prisma schema
- **Caching**: Use React Query for client-side caching
- **Pagination**: Implement for large lists (services, alerts, metrics)
- **Metrics Retention**: Archive old metrics (keep 90 days by default)
- **Lazy Loading**: Code-split pages and components

## 11. Deployment Checklist

- [ ] Set up production database (Supabase/Railway/Neon)
- [ ] Configure environment variables in Vercel
- [ ] Run database migration (`npx prisma db push`)
- [ ] Set up Vercel Cron Jobs for monitoring
- [ ] Configure domain and SSL
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (optional)
- [ ] Create GitHub repository
- [ ] Set up CI/CD pipeline

## 12. Future Enhancements

- Email notifications (SendGrid/Resend)
- SMS alerts (Twilio)
- Team collaboration (multiple users, role-based access)
- Audit logs
- Webhook integrations
- Public status pages
- Mobile app (React Native)
- API usage per project
- Cost tracking per project
- Custom dashboards
- Report exports (PDF/CSV)

## Development Workflow

1. **Start Development**:
   ```bash
   npm run dev
   ```

2. **Make Changes**:
   - Create components in `/components`
   - Create API routes in `/app/api`
   - Create pages in `/app`

3. **Test Changes**:
   - Manual testing in browser
   - Run unit tests: `npm test`

4. **Database Changes**:
   - Update `prisma/schema.prisma`
   - Run `npx prisma db push` (development)
   - Or create migration: `npx prisma migrate dev`

5. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

## Priority Implementation Order

For efficient development, implement in this order:

1. **Phase 1**: Foundation
   - Create basic UI components
   - Build service CRUD API and pages
   - Create dashboard with static service cards

2. **Phase 2**: Monitoring
   - Implement service checker
   - Create metrics API
   - Build monitoring cron job
   - Add uptime visualization

3. **Phase 3**: Alerts
   - Build alert engine
   - Create alerts API and pages
   - Implement alert deduplication

4. **Phase 4**: Notifications
   - Build Slack integration
   - Build Telegram integration
   - Create notification settings UI
   - Test notification delivery

5. **Phase 5**: Projects
   - Create project CRUD
   - Implement many-to-many relationships
   - Build project pages

6. **Phase 6**: Polish
   - Add categories management
   - Create response time charts
   - Implement filtering and search
   - Add animations and transitions
   - Performance optimization

## Getting Help

For implementation questions:
1. Check the Prisma docs: https://www.prisma.io/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Check Tailwind docs: https://tailwindcss.com/docs
4. Review the database schema in `prisma/schema.prisma`
5. Review the type definitions in `lib/types.ts`

## Notes

- This is a comprehensive application. Start small and iterate.
- Focus on core functionality first (services + monitoring).
- Add features incrementally.
- Test thoroughly before deploying to production.
- Keep the database schema flexible for future enhancements.
