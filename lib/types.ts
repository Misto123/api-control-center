// Core types for API Control Center

export type ServiceStatus = 'ACTIVE' | 'DOWN' | 'NOT_CONFIGURED';

export type AlertType = 
  | 'SERVICE_DOWN'
  | 'SERVICE_RECOVERED'
  | 'LOW_CREDITS'
  | 'CRITICAL_CREDITS'
  | 'DEPLETION_WARNING'
  | 'DEPLETION_CRITICAL'
  | 'HIGH_USAGE'
  | 'SLOW_RESPONSE';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type NotificationChannel = 'SLACK' | 'TELEGRAM' | 'EMAIL';

export type NotificationStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ServiceStatus;
  apiUrl?: string;
  totalCredits?: number;
  usedCredits?: number;
  creditsPercent?: number;
  lowCreditsThreshold?: number;
  criticalCreditsThreshold?: number;
  depletionWarningDays?: number;
  depletionCriticalDays?: number;
  monitoringEnabled: boolean;
  lastCheckedAt?: Date;
  categoryId?: string;
  category?: Category;
  projects?: ProjectService[];
  metrics?: ServiceMetric[];
  alerts?: Alert[];
  uptimeRecords?: UptimeRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  services?: Service[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceMetric {
  id: string;
  serviceId: string;
  responseTime?: number;
  statusCode?: number;
  isUp: boolean;
  errorMessage?: string;
  creditsUsed?: number;
  creditsRemaining?: number;
  timestamp: Date;
}

export interface UptimeRecord {
  id: string;
  serviceId: string;
  date: Date;
  upMinutes: number;
  downMinutes: number;
  uptimePercent: number;
  incidents: number;
  longestOutageMinutes?: number;
}

export interface Alert {
  id: string;
  serviceId: string;
  service?: Service;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  isRead: boolean;
  isAcknowledged: boolean;
  isDismissed: boolean;
  isActive: boolean;
  resolvedAt?: Date;
  metadata?: any;
  notifications?: Notification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  alertId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isArchived: boolean;
  services?: ProjectService[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectService {
  id: string;
  projectId: string;
  serviceId: string;
  project?: Project;
  service?: Service;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  id: string;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  slackChannel?: string;
  telegramEnabled: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  emailEnabled: boolean;
  emailRecipients?: string;
  slackAlertTypes: string[];
  telegramAlertTypes: string[];
  emailAlertTypes: string[];
  downReminderEnabled: boolean;
  downReminderInterval?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardSummary {
  totalServices: number;
  activeServices: number;
  downServices: number;
  notConfiguredServices: number;
  totalAlerts: number;
  unreadAlerts: number;
  lowCreditsCount: number;
  depletingSoonCount: number;
  averageUptime30d: number;
}

export interface ServiceWithProjects extends Service {
  projectCount: number;
  uptime30d?: number;
  uptime7d?: number;
  avgResponseTime?: number;
}

export interface AlertWithService extends Alert {
  service: Service;
}
