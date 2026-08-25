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
  status_detail: string | null;
  apiUrl: string | null;
  apiKey: string | null;
  checkEndpoint: string | null;
  totalCredits: number | null;
  usedCredits: number | null;
  creditsPercent: number | null;
  credit_unit: string | null;
  subscription_plan: string | null;
  subscription_price: number | null;
  subscription_credits: number | null;
  subscription_renewal_date: string | null;
  minimum_balance: number | null;
  lowCreditsThreshold: number | null;
  criticalCreditsThreshold: number | null;
  depletionWarningDays: number | null;
  depletionCriticalDays: number | null;
  highUsageThreshold: number | null;
  slowResponseThreshold: number | null;
  monitoringEnabled: boolean;
  checkInterval: number;
  lastCheckedAt: string | null;
  dashboard_visible: boolean;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface ServiceInput {
  name: string;
  slug?: string;
  description?: string;
  status?: ServiceStatus;
  apiUrl?: string;
  apiKey?: string;
  checkEndpoint?: string;
  totalCredits?: number | null;
  usedCredits?: number | null;
  credit_unit?: string;
  subscription_plan?: string;
  subscription_price?: number;
  subscription_credits?: number;
  subscription_renewal_date?: string;
  minimum_balance?: number;
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

export interface RankTracker {
  id: string;
  domain: string;
  keyword: string;
  country: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface RankResult {
  id: string;
  tracker_id: string;
  position: number | null;
  url: string | null;
  date: string;
  created_at: string;
}

export interface RankTrackerWithResults extends RankTracker {
  results?: RankResult[];
  latestResult?: RankResult;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  description: string | null;
  niche: string | null;
  added_to_seo_flow: boolean;
  added_to_gctr: boolean;
  target_keywords: string[];
  monthly_budget: number | null;
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteInput {
  name: string;
  url: string;
  description?: string;
  niche?: string;
  added_to_seo_flow?: boolean;
  added_to_gctr?: boolean;
  target_keywords?: string[];
  monthly_budget?: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}
