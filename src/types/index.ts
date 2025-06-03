export interface HotmartConfig {
  clientId: string;
  clientSecret: string;
  isSandbox?: boolean;
  baseUrl?: string;
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
}

export interface PageInfo {
  total_results?: number;
  next_page_token?: string;
  prev_page_token?: string;
  results_per_page: number;
}

export interface ApiResponse<T> {
  items: T[];
  page_info: PageInfo;
}

export type StudentRole = 'STUDENT' | 'FREE_STUDENT' | 'OWNER' | 'ADMIN' | 'CONTENT_EDITOR' | 'MODERATOR';

export type PlusAccess = 'WITHOUT_PLUS_ACCESS' | 'HOLDER' | 'DEPENDENT' | 'HOLDER_WITH_DEPENDENTS' | 'HOLDER_WITHOUT_DEPENDENTS';

export type StudentStatus = 'ACTIVE' | 'BLOCKED' | 'BLOCKED_BY_OWNER' | 'OVERDUE';

export type StudentType = 'BUYER' | 'IMPORTED' | 'FREE' | 'OWNER' | 'GUEST';

export type StudentEngagement = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface StudentProgress {
  completed_percentage: number;
  total: number;
  completed: number;
}

export interface Student {
  user_id: string;
  engagement: StudentEngagement;
  name: string;
  email: string;
  last_access_date?: number;
  role: StudentRole;
  first_access_date?: number;
  locale: string;
  plus_access: PlusAccess;
  progress: StudentProgress;
  status: StudentStatus;
  purchase_date?: number;
  access_count: number;
  is_deletable: boolean;
  class_id: string;
  type: StudentType;
}

export type PageType = 'CONTENT' | 'ADVERTISEMENT' | 'QUIZ' | 'WEBINAR';

export type LiberationType = 'BY_DATE' | 'BY_DAYS' | 'BY_QUIZ';

export interface Rate {
  rate: number;
  total: number;
}

export interface Liberation {
  type: LiberationType;
  liberation_days?: number;
  liberation_date?: string;
  page_id?: string;
}

export interface Expiration {
  type: 'BY_DAYS';
  duration_days: number;
}

export interface Class {
  id: string;
  name: string;
  default_class: boolean;
}

export interface DrippingConfig {
  liberation: Liberation;
  expiration?: Expiration;
  classes: Class[];
}

export interface Page {
  page_id: string;
  name: string;
  type: PageType;
  page_order: number;
  total_comments: number;
  rates: Rate[];
  rates_average: number;
  published: boolean;
  has_media: boolean;
  dripping_configs: DrippingConfig[];
}

export interface Lesson {
  page_id: string;
  page_name: string;
  module_name: string;
  is_module_extra: boolean;
  is_completed: boolean;
  completed_date?: number;
}

export interface StudentLessons {
  lessons: Lesson[];
}

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'DELAYED' | 'CANCELLED_BY_CUSTOMER' | 'CANCELLED_BY_SELLER' | 'CANCELLED_BY_ADMIN' | 'STARTED' | 'OVERDUE';

export type BillingType = 'SUBSCRIPTION' | 'SMART_INSTALLMENT' | 'SMART_RECOVERY';

export interface Plan {
  name: string;
  id: number;
  recurrency_period: number;
  max_charge_cycles?: number;
}

export interface Product {
  id: number;
  name: string;
  ucode?: string;
}

export interface Price {
  value: number;
  currency_code: string;
}

export interface Subscriber {
  name: string;
  email: string;
  ucode?: string;
  id?: number;
  phone?: string;
}

export interface Subscription {
  subscriber_code: string;
  subscription_id: number;
  status: SubscriptionStatus;
  accession_date: number;
  end_accession_date?: number;
  request_date?: number;
  date_next_charge?: number;
  trial: boolean;
  transaction?: string;
  plan: Plan;
  product: Product;
  price?: Price;
  subscriber: Subscriber;
}

export interface LastRecurrency {
  number: number;
  request_date: number;
  status: string;
  transaction_number: number;
  billing_type: BillingType;
}

export interface UnpaidRecurrency {
  number: number;
  charge_date: number;
}

export interface Offer {
  code: string;
}

export interface SubscriptionSummary {
  subscriber_code: string;
  subscription_id: number;
  status: SubscriptionStatus;
  lifetime: number;
  accession_date: number;
  end_accession_date?: number;
  trial: boolean;
  plan: Omit<Plan, 'id' | 'max_charge_cycles'>;
  product: Omit<Product, 'ucode'>;
  offer?: Offer;
  last_recurrency: LastRecurrency;
  unpaid_recurrencies: UnpaidRecurrency[];
  subscriber: Subscriber;
}

export interface CancelSubscriptionRequest {
  subscriber_code: string[];
  send_mail?: boolean;
}

export interface ReactivateSubscriptionRequest {
  subscriber_code?: string[];
  charge?: boolean;
}

export interface ChangeBillingDayRequest {
  due_day: number;
}

export interface SuccessSubscriptionAction {
  status: SubscriptionStatus;
  subscriber_code: string;
  creation_date: string;
  current_recurrence?: number;
  date_last_recurrence?: string;
  date_next_charge?: string;
  due_day?: number;
  trial_period?: number;
  interval_type_between_charges?: string;
  interval_between_charges: number;
  max_charge_cycles?: number;
  activation_date?: string;
  shopper: Subscriber;
}

export interface FailSubscriptionAction {
  status: SubscriptionStatus;
  error: string;
  subscriber_code: string;
  creation_date: string;
  interval_between_charges: number;
  shopper: Subscriber;
}

export interface SubscriptionActionResponse {
  success_subscriptions: SuccessSubscriptionAction[];
  fail_subscriptions: FailSubscriptionAction[];
}

export interface HotmartApiError {
  error: string;
  error_description: string;
  error_uri?: string;
} 