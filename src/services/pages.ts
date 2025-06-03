import { HotmartHttpClient } from '../client/http-client';
import { Page, PageType } from '../types';

export interface GetPagesOptions {
  productId: number;
  moduleId: string;
}

export class PagesService {
  constructor(private httpClient: HotmartHttpClient) {}

  async getPages(options: GetPagesOptions): Promise<Page[]> {
    const params = {
      product_id: options.productId,
    };

    return this.httpClient.get<Page[]>(
      `/club/api/v2/modules/${options.moduleId}/pages`,
      { params }
    );
  }

  async getPageById(productId: number, moduleId: string, pageId: string): Promise<Page | null> {
    const pages = await this.getPages({ productId, moduleId });
    return pages.find(page => page.page_id === pageId) || null;
  }

  isContentPage(page: Page): boolean {
    return page.type === 'CONTENT';
  }

  isAdvertisementPage(page: Page): boolean {
    return page.type === 'ADVERTISEMENT';
  }

  isQuizPage(page: Page): boolean {
    return page.type === 'QUIZ';
  }

  isWebinarPage(page: Page): boolean {
    return page.type === 'WEBINAR';
  }

  isPublished(page: Page): boolean {
    return page.published;
  }

  hasMedia(page: Page): boolean {
    return page.has_media;
  }

  getPagesByType(pages: Page[], type: PageType): Page[] {
    return pages.filter(page => page.type === type);
  }

  getPublishedPages(pages: Page[]): Page[] {
    return pages.filter(page => this.isPublished(page));
  }

  getPagesWithMedia(pages: Page[]): Page[] {
    return pages.filter(page => this.hasMedia(page));
  }

  getPageComments(page: Page): number {
    return page.total_comments;
  }

  getPageRating(page: Page): number {
    return page.rates_average;
  }

  getPageOrder(page: Page): number {
    return page.page_order;
  }

  sortPagesByOrder(pages: Page[]): Page[] {
    return [...pages].sort((a, b) => a.page_order - b.page_order);
  }

  sortPagesByRating(pages: Page[], descending: boolean = true): Page[] {
    return [...pages].sort((a, b) => 
      descending ? b.rates_average - a.rates_average : a.rates_average - b.rates_average
    );
  }

  getPagesDrippingInfo(page: Page) {
    return page.dripping_configs.map(config => ({
      liberationType: config.liberation.type,
      liberationDays: config.liberation.liberation_days,
      liberationDate: config.liberation.liberation_date,
      expirationDays: config.expiration?.duration_days,
      classes: config.classes
    }));
  }

  async getAllContentPages(productId: number, moduleId: string): Promise<Page[]> {
    const pages = await this.getPages({ productId, moduleId });
    return this.getPagesByType(pages, 'CONTENT');
  }

  async getAllQuizzes(productId: number, moduleId: string): Promise<Page[]> {
    const pages = await this.getPages({ productId, moduleId });
    return this.getPagesByType(pages, 'QUIZ');
  }

  async getAllWebinars(productId: number, moduleId: string): Promise<Page[]> {
    const pages = await this.getPages({ productId, moduleId });
    return this.getPagesByType(pages, 'WEBINAR');
  }

  async getTopRatedPages(productId: number, moduleId: string, limit: number = 10): Promise<Page[]> {
    const pages = await this.getPages({ productId, moduleId });
    return this.sortPagesByRating(pages).slice(0, limit);
  }

  async getMostCommentedPages(productId: number, moduleId: string, limit: number = 10): Promise<Page[]> {
    const pages = await this.getPages({ productId, moduleId });
    return [...pages]
      .sort((a, b) => b.total_comments - a.total_comments)
      .slice(0, limit);
  }
} 