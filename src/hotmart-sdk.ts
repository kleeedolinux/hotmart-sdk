import { HotmartConfig } from './types';
import { HotmartHttpClient } from './client/http-client';
import { StudentsService } from './services/students';
import { SubscriptionsService } from './services/subscriptions';
import { PagesService } from './services/pages';

export class HotmartSDK {
  private httpClient: HotmartHttpClient;
  
  public readonly students: StudentsService;
  public readonly subscriptions: SubscriptionsService;
  public readonly pages: PagesService;

  constructor(config: HotmartConfig) {
    this.httpClient = new HotmartHttpClient(config);
    
    this.students = new StudentsService(this.httpClient);
    this.subscriptions = new SubscriptionsService(this.httpClient);
    this.pages = new PagesService(this.httpClient);
  }

  async verifyAccess(subdomain: string, email: string): Promise<{
    isStudent: boolean;
    isSubscriber: boolean;
    hasAccess: boolean;
    accessType: 'paid' | 'free' | 'subscription' | 'none';
    student: any;
    subscriptions: any[];
  }> {
    const [studentAccess, subscriptionAccess] = await Promise.all([
      this.students.verifyStudentAccess(subdomain, email),
      this.subscriptions.verifySubscriptionAccess(email)
    ]);

    const isStudent = studentAccess.student !== null;
    const isSubscriber = subscriptionAccess.hasActiveSubscription;
    const hasAccess = studentAccess.hasAccess || isSubscriber;

    let accessType: 'paid' | 'free' | 'subscription' | 'none' = 'none';
    
    if (isSubscriber) {
      accessType = 'subscription';
    } else if (studentAccess.accessType === 'paid') {
      accessType = 'paid';
    } else if (studentAccess.accessType === 'free') {
      accessType = 'free';
    }

    return {
      isStudent,
      isSubscriber,
      hasAccess,
      accessType,
      student: studentAccess.student,
      subscriptions: subscriptionAccess.subscriptions
    };
  }

  async isSubscriber(email: string): Promise<boolean> {
    const access = await this.subscriptions.verifySubscriptionAccess(email);
    return access.hasActiveSubscription;
  }

  async isStudent(subdomain: string, email: string): Promise<boolean> {
    const student = await this.students.getStudentByEmail(subdomain, email);
    return student !== null && this.students.isActiveStudent(student);
  }

  async isPaidStudent(subdomain: string, email: string): Promise<boolean> {
    const student = await this.students.getStudentByEmail(subdomain, email);
    return student !== null && this.students.isPaidStudent(student);
  }

  async isFreeStudent(subdomain: string, email: string): Promise<boolean> {
    const student = await this.students.getStudentByEmail(subdomain, email);
    return student !== null && this.students.isFreeStudent(student);
  }

  async hasActiveAccess(subdomain: string, email: string): Promise<boolean> {
    const access = await this.verifyAccess(subdomain, email);
    return access.hasAccess;
  }

  async getAccessSummary(subdomain: string, email: string) {
    const access = await this.verifyAccess(subdomain, email);
    
    const summary = {
      email,
      hasAccess: access.hasAccess,
      accessType: access.accessType,
      isActive: access.hasAccess,
      details: {
        isStudent: access.isStudent,
        isSubscriber: access.isSubscriber,
        studentInfo: access.student ? {
          name: access.student.name,
          role: access.student.role,
          status: access.student.status,
          type: access.student.type,
          progress: access.student.progress,
          lastAccess: access.student.last_access_date ? new Date(access.student.last_access_date * 1000) : null,
          firstAccess: access.student.first_access_date ? new Date(access.student.first_access_date * 1000) : null,
        } : null,
        subscriptionInfo: access.subscriptions.length > 0 ? {
          totalSubscriptions: access.subscriptions.length,
          activeSubscriptions: access.subscriptions.filter(sub => this.subscriptions.isActiveSubscription(sub)).length,
          subscriptions: access.subscriptions.map(sub => ({
            subscriberCode: sub.subscriber_code,
            status: sub.status,
            planName: sub.plan.name,
            productName: sub.product.name,
            accessionDate: new Date(sub.accession_date * 1000),
            nextChargeDate: sub.date_next_charge ? new Date(sub.date_next_charge * 1000) : null,
            trial: sub.trial
          }))
        } : null
      }
    };

    return summary;
  }

  async quickCheck(subdomain: string, email: string): Promise<{
    hasAccess: boolean;
    type: 'student' | 'subscriber' | 'both' | 'none';
  }> {
    const access = await this.verifyAccess(subdomain, email);
    
    let type: 'student' | 'subscriber' | 'both' | 'none' = 'none';
    
    if (access.isStudent && access.isSubscriber) {
      type = 'both';
    } else if (access.isStudent) {
      type = 'student';
    } else if (access.isSubscriber) {
      type = 'subscriber';
    }

    return {
      hasAccess: access.hasAccess,
      type
    };
  }
}

export default HotmartSDK; 