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
  description: string | null;
  status: ServiceStatus;
  apiUrl: string | null;
  apiKey: string | null;
  checkEndpoint: string | null;
  totalCredits: number | null;
  usedCredits: number | null;
  creditsPercent: number | null;
  creditUnit: string | null;
  lowCreditsThreshold: number | null;
  criticalCreditsThreshold: number | null;
  depletionWarningDays: number | null;
  depletionCriticalDays: number | null;
  highUsageThreshold: number | null;
  slowResponseThreshold: number | null;
  monitoringEnabled: boolean;
  checkInterval: number;
  lastCheckedAt: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface ServiceInput {
  name: string;
  slug: string;
  description?: string;
  apiUrl?: string;
  apiKey?: string;
  checkEndpoint?: string;
  totalCredits?: number;
  usedCredits?: number;
  creditsPercent?: number;
  creditUnit?: string;
  lowCreditsThreshold?: number;
  criticalCreditsThreshold?: number;
  depletionWarningDays?: number;
  depletionCriticalDays?: number;
  highUsageThreshold?: number;
  slowResponseThreshold?: number;
  monitoringEnabled?: boolean;
  checkInterval?: number;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  serviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  isRead: boolean;
  isAcknowledged: boolean;
  isDismissed: boolean;
  isActive: boolean;
  resolvedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

export interface DashboardSummary {
  totalServices: number;
  activeServices: number;
  downServices: number;
  notConfiguredServices: number;
  totalAlerts: number;
  unreadAlerts: number;
  lowCreditsCount: number;
  averageUptime30d: number;
}
