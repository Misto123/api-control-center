
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'DOWN', 'NOT_CONFIGURED');
CREATE TYPE "AlertType" AS ENUM ('SERVICE_DOWN', 'SERVICE_RECOVERED', 'LOW_CREDITS', 'CRITICAL_CREDITS', 'DEPLETION_WARNING', 'DEPLETION_CRITICAL', 'HIGH_USAGE', 'SLOW_RESPONSE');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "NotificationChannel" AS ENUM ('SLACK', 'TELEGRAM', 'EMAIL');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED');

CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "apiUrl" TEXT,
    "apiKey" TEXT,
    "checkEndpoint" TEXT,
    "totalCredits" DOUBLE PRECISION,
    "usedCredits" DOUBLE PRECISION,
    "creditsPercent" DOUBLE PRECISION,
    "lowCreditsThreshold" DOUBLE PRECISION DEFAULT 20,
    "criticalCreditsThreshold" DOUBLE PRECISION DEFAULT 10,
    "depletionWarningDays" INTEGER DEFAULT 14,
    "depletionCriticalDays" INTEGER DEFAULT 7,
    "highUsageThreshold" DOUBLE PRECISION,
    "slowResponseThreshold" INTEGER DEFAULT 5000,
    "monitoringEnabled" BOOLEAN NOT NULL DEFAULT true,
    "checkInterval" INTEGER NOT NULL DEFAULT 60,
    "lastCheckedAt" TIMESTAMP(3),
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_metrics" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "responseTime" INTEGER,
    "statusCode" INTEGER,
    "isUp" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "creditsUsed" DOUBLE PRECISION,
    "creditsRemaining" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_metrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "uptime_records" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "upMinutes" INTEGER NOT NULL DEFAULT 0,
    "downMinutes" INTEGER NOT NULL DEFAULT 0,
    "uptimePercent" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "incidents" INTEGER NOT NULL DEFAULT 0,
    "longestOutageMinutes" INTEGER DEFAULT 0,
    CONSTRAINT "uptime_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_services" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "slackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slackWebhookUrl" TEXT,
    "slackChannel" TEXT,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "telegramBotToken" TEXT,
    "telegramChatId" TEXT,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailRecipients" TEXT,
    "slackAlertTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "telegramAlertTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailAlertTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "downReminderInterval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "global_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "global_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE UNIQUE INDEX "uptime_records_serviceId_date_key" ON "uptime_records"("serviceId", "date");
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
CREATE UNIQUE INDEX "project_services_projectId_serviceId_key" ON "project_services"("projectId", "serviceId");
CREATE UNIQUE INDEX "global_settings_key_key" ON "global_settings"("key");

CREATE INDEX "service_metrics_serviceId_timestamp_idx" ON "service_metrics"("serviceId", "timestamp");
CREATE INDEX "uptime_records_serviceId_date_idx" ON "uptime_records"("serviceId", "date");
CREATE INDEX "alerts_serviceId_type_isActive_idx" ON "alerts"("serviceId", "type", "isActive");
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");
CREATE INDEX "notifications_alertId_channel_idx" ON "notifications"("alertId", "channel");
CREATE INDEX "notifications_status_createdAt_idx" ON "notifications"("status", "createdAt");
CREATE INDEX "project_services_projectId_idx" ON "project_services"("projectId");
CREATE INDEX "project_services_serviceId_idx" ON "project_services"("serviceId");

ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "service_metrics" ADD CONSTRAINT "service_metrics_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "uptime_records" ADD CONSTRAINT "uptime_records_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_services" ADD CONSTRAINT "project_services_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_services" ADD CONSTRAINT "project_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
