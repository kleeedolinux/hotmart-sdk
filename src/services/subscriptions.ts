import { HotmartHttpClient } from '../client/http-client';
import { 
  Subscription,
  SubscriptionSummary,
  ApiResponse,
  SubscriptionStatus,
  CancelSubscriptionRequest,
  ReactivateSubscriptionRequest,
  ChangeBillingDayRequest,
  SubscriptionActionResponse
} from '../types';

export interface GetSubscriptionsOptions {
  maxResults?: number;
  pageToken?: string;
  productId?: number;
  plan?: string[];
  planId?: number;
  accessionDate?: number;
  endAccessionDate?: number;
  status?: SubscriptionStatus[];
  subscriberCode?: string;
  subscriberEmail?: string;
  transaction?: string;
  trial?: boolean;
  cancelationDate?: number;
  endCancelationDate?: number;
  dateNextCharge?: number;
  endDateNextCharge?: number;
}

export interface GetSubscriptionsSummaryOptions {
  maxResults?: number;
  pageToken?: string;
  productId?: number;
  subscriberCode?: string;
  accessionDate?: number;
  endAccessionDate?: number;
  dateNextCharge?: number;
}

export class SubscriptionsService {
  constructor(private httpClient: HotmartHttpClient) {}

  async getSubscriptions(options: GetSubscriptionsOptions = {}): Promise<ApiResponse<Subscription>> {
    const params: Record<string, any> = {};

    if (options.maxResults) params.max_results = options.maxResults;
    if (options.pageToken) params.page_token = options.pageToken;
    if (options.productId) params.product_id = options.productId;
    if (options.plan) params.plan = options.plan;
    if (options.planId) params.plan_id = options.planId;
    if (options.accessionDate) params.accession_date = options.accessionDate;
    if (options.endAccessionDate) params.end_accession_date = options.endAccessionDate;
    if (options.status) params.status = options.status;
    if (options.subscriberCode) params.subscriber_code = options.subscriberCode;
    if (options.subscriberEmail) params.subscriber_email = options.subscriberEmail;
    if (options.transaction) params.transaction = options.transaction;
    if (options.trial !== undefined) params.trial = options.trial;
    if (options.cancelationDate) params.cancelation_date = options.cancelationDate;
    if (options.endCancelationDate) params.end_cancelation_date = options.endCancelationDate;
    if (options.dateNextCharge) params.date_next_charge = options.dateNextCharge;
    if (options.endDateNextCharge) params.end_date_next_charge = options.endDateNextCharge;

    return this.httpClient.get<ApiResponse<Subscription>>('/payments/api/v1/subscriptions', { params });
  }

  async getSubscriptionsSummary(options: GetSubscriptionsSummaryOptions = {}): Promise<ApiResponse<SubscriptionSummary>> {
    const params: Record<string, any> = {};

    if (options.maxResults) params.max_results = options.maxResults;
    if (options.pageToken) params.page_token = options.pageToken;
    if (options.productId) params.product_id = options.productId;
    if (options.subscriberCode) params.subscriber_code = options.subscriberCode;
    if (options.accessionDate) params.accession_date = options.accessionDate;
    if (options.endAccessionDate) params.end_accession_date = options.endAccessionDate;
    if (options.dateNextCharge) params.date_next_charge = options.dateNextCharge;

    return this.httpClient.get<ApiResponse<SubscriptionSummary>>('/payments/api/v1/subscriptions/summary', { params });
  }

  async getSubscriptionByCode(subscriberCode: string): Promise<Subscription | null> {
    const response = await this.getSubscriptions({ subscriberCode });
    return response.items.length > 0 ? response.items[0] : null;
  }

  async getSubscriptionsByEmail(email: string): Promise<Subscription[]> {
    const response = await this.getSubscriptions({ subscriberEmail: email });
    return response.items;
  }

  async cancelSubscriptions(request: CancelSubscriptionRequest): Promise<SubscriptionActionResponse> {
    return this.httpClient.post<SubscriptionActionResponse>('/payments/api/v1/subscriptions/cancel', request);
  }

  async cancelSubscription(subscriberCode: string, sendMail: boolean = true): Promise<SubscriptionActionResponse> {
    return this.cancelSubscriptions({
      subscriber_code: [subscriberCode],
      send_mail: sendMail
    });
  }

  async reactivateSubscriptions(request: ReactivateSubscriptionRequest): Promise<SubscriptionActionResponse> {
    return this.httpClient.post<SubscriptionActionResponse>('/payments/api/v1/subscriptions/reactivate', request);
  }

  async reactivateSubscription(subscriberCode: string, charge: boolean = false): Promise<SubscriptionActionResponse> {
    return this.httpClient.post<SubscriptionActionResponse>(
      `/payments/api/v1/subscriptions/${subscriberCode}/reactivate`,
      { charge }
    );
  }

  async changeBillingDay(subscriberCode: string, dueDay: number): Promise<void> {
    if (dueDay < 1 || dueDay > 31) {
      throw new Error('Due day must be between 1 and 31');
    }

    const request: ChangeBillingDayRequest = { due_day: dueDay };
    await this.httpClient.patch<void>(`/payments/api/v1/subscriptions/${subscriberCode}`, request);
  }

  isActiveSubscription(subscription: Subscription): boolean {
    return subscription.status === 'ACTIVE';
  }

  isInactiveSubscription(subscription: Subscription): boolean {
    return subscription.status === 'INACTIVE';
  }

  isCancelledSubscription(subscription: Subscription): boolean {
    return subscription.status === 'CANCELLED_BY_CUSTOMER' || 
           subscription.status === 'CANCELLED_BY_SELLER' || 
           subscription.status === 'CANCELLED_BY_ADMIN';
  }

  isOverdueSubscription(subscription: Subscription): boolean {
    return subscription.status === 'OVERDUE';
  }

  isTrialSubscription(subscription: Subscription): boolean {
    return subscription.trial;
  }

  getAccessionDate(subscription: Subscription): Date {
    return new Date(subscription.accession_date * 1000);
  }

  getEndAccessionDate(subscription: Subscription): Date | null {
    return subscription.end_accession_date ? new Date(subscription.end_accession_date * 1000) : null;
  }

  getNextChargeDate(subscription: Subscription): Date | null {
    return subscription.date_next_charge ? new Date(subscription.date_next_charge * 1000) : null;
  }

  async verifySubscriptionAccess(email: string): Promise<{
    hasActiveSubscription: boolean;
    subscriptions: Subscription[];
    activeSubscriptions: Subscription[];
  }> {
    const subscriptions = await this.getSubscriptionsByEmail(email);
    const activeSubscriptions = subscriptions.filter(sub => this.isActiveSubscription(sub));

    return {
      hasActiveSubscription: activeSubscriptions.length > 0,
      subscriptions,
      activeSubscriptions
    };
  }

  async getAllActiveSubscriptions(productId?: number): Promise<Subscription[]> {
    let allSubscriptions: Subscription[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getSubscriptions({ 
        maxResults: 100,
        pageToken,
        productId,
        status: ['ACTIVE']
      });
      
      allSubscriptions = allSubscriptions.concat(response.items);
      pageToken = response.page_info.next_page_token;
    } while (pageToken);

    return allSubscriptions;
  }

  async getAllOverdueSubscriptions(productId?: number): Promise<Subscription[]> {
    let allSubscriptions: Subscription[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getSubscriptions({ 
        maxResults: 100,
        pageToken,
        productId,
        status: ['OVERDUE']
      });
      
      allSubscriptions = allSubscriptions.concat(response.items);
      pageToken = response.page_info.next_page_token;
    } while (pageToken);

    return allSubscriptions;
  }

  async getAllCancelledSubscriptions(productId?: number): Promise<Subscription[]> {
    let allSubscriptions: Subscription[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getSubscriptions({ 
        maxResults: 100,
        pageToken,
        productId,
        status: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_SELLER', 'CANCELLED_BY_ADMIN']
      });
      
      allSubscriptions = allSubscriptions.concat(response.items);
      pageToken = response.page_info.next_page_token;
    } while (pageToken);

    return allSubscriptions;
  }

  async getSubscriptionsByDateRange(startDate: Date, endDate: Date, productId?: number): Promise<Subscription[]> {
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    let allSubscriptions: Subscription[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getSubscriptions({ 
        maxResults: 100,
        pageToken,
        productId,
        accessionDate: startTimestamp,
        endAccessionDate: endTimestamp
      });
      
      allSubscriptions = allSubscriptions.concat(response.items);
      pageToken = response.page_info.next_page_token;
    } while (pageToken);

    return allSubscriptions;
  }

  async bulkCancelSubscriptions(subscriberCodes: string[], sendMail: boolean = true): Promise<SubscriptionActionResponse> {
    return this.cancelSubscriptions({
      subscriber_code: subscriberCodes,
      send_mail: sendMail
    });
  }

  async bulkReactivateSubscriptions(subscriberCodes: string[], charge: boolean = false): Promise<SubscriptionActionResponse> {
    return this.reactivateSubscriptions({
      subscriber_code: subscriberCodes,
      charge
    });
  }
} 