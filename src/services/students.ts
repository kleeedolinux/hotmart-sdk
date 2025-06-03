import { HotmartHttpClient } from '../client/http-client';
import { 
  Student, 
  ApiResponse, 
  StudentLessons, 
  StudentStatus, 
  StudentType, 
  StudentRole, 
  PlusAccess 
} from '../types';

export interface GetStudentsOptions {
  subdomain: string;
  email?: string;
  maxResults?: number;
  pageToken?: string;
}

export interface StudentProgressOptions {
  subdomain: string;
  userId: string;
}

export class StudentsService {
  constructor(private httpClient: HotmartHttpClient) {}

  async getStudents(options: GetStudentsOptions): Promise<ApiResponse<Student>> {
    const params: Record<string, any> = {
      subdomain: options.subdomain,
    };

    if (options.email) {
      params.email = options.email;
    }

    if (options.maxResults) {
      params.max_results = options.maxResults;
    }

    if (options.pageToken) {
      params.page_token = options.pageToken;
    }

    return this.httpClient.get<ApiResponse<Student>>('/club/api/v1/users', { params });
  }

  async getStudentProgress(options: StudentProgressOptions): Promise<StudentLessons> {
    const params = {
      subdomain: options.subdomain,
    };

    return this.httpClient.get<StudentLessons>(
      `/club/api/v1/users/${options.userId}/lessons`,
      { params }
    );
  }

  async getStudentByEmail(subdomain: string, email: string): Promise<Student | null> {
    const response = await this.getStudents({ subdomain, email });
    const student = response.items.find(s => s.email.toLowerCase() === email.toLowerCase());
    return student || null;
  }

  async getStudentById(subdomain: string, userId: string): Promise<Student | null> {
    const response = await this.getStudents({ subdomain });
    const student = response.items.find(s => s.user_id === userId);
    return student || null;
  }

  isActiveStudent(student: Student): boolean {
    return student.status === 'ACTIVE';
  }

  isSubscriber(student: Student): boolean {
    return student.type === 'BUYER' && this.isActiveStudent(student);
  }

  isStudent(student: Student): boolean {
    return student.role === 'STUDENT' || student.role === 'FREE_STUDENT';
  }

  isFreeStudent(student: Student): boolean {
    return student.type === 'FREE' || student.role === 'FREE_STUDENT';
  }

  isPaidStudent(student: Student): boolean {
    return student.type === 'BUYER' && this.isActiveStudent(student);
  }

  isOwner(student: Student): boolean {
    return student.role === 'OWNER';
  }

  isAdmin(student: Student): boolean {
    return student.role === 'ADMIN';
  }

  isModerator(student: Student): boolean {
    return student.role === 'MODERATOR';
  }

  isContentEditor(student: Student): boolean {
    return student.role === 'CONTENT_EDITOR';
  }

  hasPlusAccess(student: Student): boolean {
    return student.plus_access !== 'WITHOUT_PLUS_ACCESS';
  }

  isPlusHolder(student: Student): boolean {
    return student.plus_access === 'HOLDER' || 
           student.plus_access === 'HOLDER_WITH_DEPENDENTS' || 
           student.plus_access === 'HOLDER_WITHOUT_DEPENDENTS';
  }

  isPlusDependent(student: Student): boolean {
    return student.plus_access === 'DEPENDENT';
  }

  isBlocked(student: Student): boolean {
    return student.status === 'BLOCKED' || student.status === 'BLOCKED_BY_OWNER';
  }

  isOverdue(student: Student): boolean {
    return student.status === 'OVERDUE';
  }

  getProgressPercentage(student: Student): number {
    return student.progress.completed_percentage;
  }

  getCompletedLessons(student: Student): number {
    return student.progress.completed;
  }

  getTotalLessons(student: Student): number {
    return student.progress.total;
  }

  async getCompletedLessonsDetails(subdomain: string, userId: string): Promise<number> {
    const progress = await this.getStudentProgress({ subdomain, userId });
    return progress.lessons.filter(lesson => lesson.is_completed).length;
  }

  async getPendingLessonsDetails(subdomain: string, userId: string): Promise<number> {
    const progress = await this.getStudentProgress({ subdomain, userId });
    return progress.lessons.filter(lesson => !lesson.is_completed).length;
  }

  getLastAccessDate(student: Student): Date | null {
    return student.last_access_date ? new Date(student.last_access_date * 1000) : null;
  }

  getFirstAccessDate(student: Student): Date | null {
    return student.first_access_date ? new Date(student.first_access_date * 1000) : null;
  }

  getPurchaseDate(student: Student): Date | null {
    return student.purchase_date ? new Date(student.purchase_date * 1000) : null;
  }

  async verifyStudentAccess(subdomain: string, email: string): Promise<{
    hasAccess: boolean;
    student: Student | null;
    accessType: 'paid' | 'free' | 'none';
    status: StudentStatus | null;
  }> {
    const student = await this.getStudentByEmail(subdomain, email);
    
    if (!student) {
      return {
        hasAccess: false,
        student: null,
        accessType: 'none',
        status: null
      };
    }

    const hasAccess = this.isActiveStudent(student);
    const accessType = this.isPaidStudent(student) ? 'paid' : 
                      this.isFreeStudent(student) ? 'free' : 'none';

    return {
      hasAccess,
      student,
      accessType,
      status: student.status
    };
  }

  async getAllActiveStudents(subdomain: string): Promise<Student[]> {
    let allStudents: Student[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getStudents({ 
        subdomain, 
        maxResults: 100,
        pageToken 
      });
      
      const activeStudents = response.items.filter(student => this.isActiveStudent(student));
      allStudents = allStudents.concat(activeStudents);
      
      pageToken = response.page_info.next_page_token;
    } while (pageToken);

    return allStudents;
  }

  async getAllSubscribers(subdomain: string): Promise<Student[]> {
    const allStudents = await this.getAllActiveStudents(subdomain);
    return allStudents.filter(student => this.isSubscriber(student));
  }

  async getAllFreeStudents(subdomain: string): Promise<Student[]> {
    const allStudents = await this.getAllActiveStudents(subdomain);
    return allStudents.filter(student => this.isFreeStudent(student));
  }
} 