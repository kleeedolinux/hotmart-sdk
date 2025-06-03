# Hotmart SDK

Unofficial TypeScript/JavaScript SDK for Hotmart API, focused on membership areas, subscriptions, and student management.

> ⚠️ **Note**: This is not the official Hotmart SDK. This is a community-maintained SDK created to provide a better developer experience when working with the Hotmart API.

## Features

- ✅ **Complete TypeScript support** with full type definitions
- ✅ **Automatic OAuth2 authentication** with token refresh
- ✅ **Student management** - check if user is a student or subscriber
- ✅ **Subscription management** - cancel, reactivate, change billing dates
- ✅ **Progress tracking** - get student progress and lesson completion
- ✅ **Easy access verification** - quickly check user access status
- ✅ **Pagination support** for all list endpoints
- ✅ **Error handling** with detailed error messages
- ✅ **Rate limiting** aware
- ✅ **Sandbox support** for testing

## Installation

```bash
npm install hotmart-sdk
```

## Quick Start

```typescript
import HotmartSDK from '@kleeedolinux/hotmart-sdk';

const hotmart = new HotmartSDK({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  isSandbox: true // Set to false for production
});

// Quick access verification
const hasAccess = await hotmart.hasActiveAccess('your-subdomain', 'user@example.com');
console.log('User has access:', hasAccess);

// Check if user is a subscriber
const isSubscriber = await hotmart.isSubscriber('user@example.com');
console.log('User is subscriber:', isSubscriber);

// Get detailed access information
const accessSummary = await hotmart.getAccessSummary('your-subdomain', 'user@example.com');
console.log('Access summary:', accessSummary);
```

## Configuration

### Basic Configuration

```typescript
import HotmartSDK from '@kleeedolinux/hotmart-sdk';

const hotmart = new HotmartSDK({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  isSandbox: false // Use true for sandbox/testing
});
```

### Advanced Configuration

```typescript
const hotmart = new HotmartSDK({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  isSandbox: true,
  baseUrl: 'https://custom.api.url' // Optional custom base URL
});
```

## Authentication

The SDK handles OAuth2 authentication automatically. You just need to provide your client credentials.

### Getting Credentials

1. Access Hotmart platform
2. Go to **Tools > Developer Credentials**
3. Create new credentials
4. Choose **Sandbox** for testing or leave unchecked for production
5. Copy your `client_id` and `client_secret`

## Usage Examples

### Student Management

#### Check if user is an active student

```typescript
const isStudent = await hotmart.isStudent('my-subdomain', 'user@example.com');
console.log('Is student:', isStudent);
```

#### Check if user is a paid student

```typescript
const isPaidStudent = await hotmart.isPaidStudent('my-subdomain', 'user@example.com');
console.log('Is paid student:', isPaidStudent);
```

#### Get student details

```typescript
const student = await hotmart.students.getStudentByEmail('my-subdomain', 'user@example.com');

if (student) {
  console.log('Student name:', student.name);
  console.log('Student status:', student.status);
  console.log('Progress:', student.progress.completed_percentage + '%');
  console.log('Completed lessons:', student.progress.completed);
  console.log('Total lessons:', student.progress.total);
}
```

#### Get student progress

```typescript
const progress = await hotmart.students.getStudentProgress({
  subdomain: 'my-subdomain',
  userId: 'user-id'
});

console.log('Completed lessons:', progress.lessons.filter(l => l.is_completed).length);
console.log('Pending lessons:', progress.lessons.filter(l => !l.is_completed).length);
```

#### Get all active students

```typescript
const activeStudents = await hotmart.students.getAllActiveStudents('my-subdomain');
console.log(`Total active students: ${activeStudents.length}`);
```

### Subscription Management

#### Check if user has active subscription

```typescript
const isSubscriber = await hotmart.isSubscriber('user@example.com');
console.log('Has active subscription:', isSubscriber);
```

#### Get user subscriptions

```typescript
const subscriptions = await hotmart.subscriptions.getSubscriptionsByEmail('user@example.com');

subscriptions.forEach(sub => {
  console.log(`Subscription ${sub.subscriber_code}:`);
  console.log(`  Status: ${sub.status}`);
  console.log(`  Plan: ${sub.plan.name}`);
  console.log(`  Product: ${sub.product.name}`);
  console.log(`  Next charge: ${sub.date_next_charge ? new Date(sub.date_next_charge * 1000) : 'N/A'}`);
});
```

#### Cancel subscription

```typescript
const result = await hotmart.subscriptions.cancelSubscription('ABC123DEF', true); // true = send email
console.log('Cancellation result:', result);
```

#### Reactivate subscription

```typescript
const result = await hotmart.subscriptions.reactivateSubscription('ABC123DEF', false); // false = don't charge immediately
console.log('Reactivation result:', result);
```

#### Change billing day

```typescript
await hotmart.subscriptions.changeBillingDay('ABC123DEF', 15); // Change to day 15
console.log('Billing day changed successfully');
```

#### Get subscription summary

```typescript
const summary = await hotmart.subscriptions.getSubscriptionsSummary({
  productId: 123456,
  maxResults: 100
});

console.log(`Total subscriptions: ${summary.page_info.total_results}`);
```

### Access Verification

#### Quick access check

```typescript
const quickCheck = await hotmart.quickCheck('my-subdomain', 'user@example.com');

console.log('Has access:', quickCheck.hasAccess);
console.log('Access type:', quickCheck.type); // 'student', 'subscriber', 'both', or 'none'
```

#### Detailed access verification

```typescript
const access = await hotmart.verifyAccess('my-subdomain', 'user@example.com');

console.log('Is student:', access.isStudent);
console.log('Is subscriber:', access.isSubscriber);
console.log('Has access:', access.hasAccess);
console.log('Access type:', access.accessType); // 'paid', 'free', 'subscription', or 'none'
```

#### Complete access summary

```typescript
const summary = await hotmart.getAccessSummary('my-subdomain', 'user@example.com');

console.log('Access Summary:');
console.log('  Has Access:', summary.hasAccess);
console.log('  Access Type:', summary.accessType);

if (summary.details.studentInfo) {
  console.log('  Student Info:');
  console.log('    Name:', summary.details.studentInfo.name);
  console.log('    Role:', summary.details.studentInfo.role);
  console.log('    Progress:', summary.details.studentInfo.progress.completed_percentage + '%');
}

if (summary.details.subscriptionInfo) {
  console.log('  Subscription Info:');
  console.log('    Active Subscriptions:', summary.details.subscriptionInfo.activeSubscriptions);
  console.log('    Total Subscriptions:', summary.details.subscriptionInfo.totalSubscriptions);
}
```

### Pages and Content

#### Get pages from a module

```typescript
const pages = await hotmart.pages.getPages({
  productId: 123456,
  moduleId: 'module-id'
});

console.log(`Total pages: ${pages.length}`);
```

#### Get content pages only

```typescript
const contentPages = await hotmart.pages.getAllContentPages(123456, 'module-id');
console.log(`Content pages: ${contentPages.length}`);
```

#### Get top-rated pages

```typescript
const topPages = await hotmart.pages.getTopRatedPages(123456, 'module-id', 5);
console.log('Top 5 rated pages:', topPages.map(p => ({ name: p.name, rating: p.rates_average })));
```

### Advanced Usage

#### Working with pagination

```typescript
let pageToken: string | undefined;
let allStudents: Student[] = [];

do {
  const response = await hotmart.students.getStudents({
    subdomain: 'my-subdomain',
    maxResults: 100,
    pageToken
  });
  
  allStudents = allStudents.concat(response.items);
  pageToken = response.page_info.next_page_token;
} while (pageToken);

console.log(`Total students processed: ${allStudents.length}`);
```

#### Bulk operations

```typescript
// Cancel multiple subscriptions
const result = await hotmart.subscriptions.bulkCancelSubscriptions([
  'ABC123',
  'DEF456',
  'GHI789'
], true); // Send cancellation emails

console.log('Successful cancellations:', result.success_subscriptions.length);
console.log('Failed cancellations:', result.fail_subscriptions.length);

// Reactivate multiple subscriptions
const reactivateResult = await hotmart.subscriptions.bulkReactivateSubscriptions([
  'ABC123',
  'DEF456'
], false); // Don't charge immediately

console.log('Successful reactivations:', reactivateResult.success_subscriptions.length);
```

#### Error handling

```typescript
try {
  const student = await hotmart.students.getStudentByEmail('my-subdomain', 'user@example.com');
  console.log('Student found:', student);
} catch (error) {
  console.error('Error getting student:', error.message);
}
```

## API Reference

### Main SDK Class

#### `HotmartSDK`

- `verifyAccess(subdomain, email)` - Complete access verification
- `isSubscriber(email)` - Check if user has active subscription
- `isStudent(subdomain, email)` - Check if user is an active student
- `isPaidStudent(subdomain, email)` - Check if user is a paid student
- `isFreeStudent(subdomain, email)` - Check if user is a free student
- `hasActiveAccess(subdomain, email)` - Check if user has any active access
- `getAccessSummary(subdomain, email)` - Get detailed access information
- `quickCheck(subdomain, email)` - Quick access verification

### Services

#### `StudentsService`

- `getStudents(options)` - Get students list
- `getStudentProgress(options)` - Get student progress
- `getStudentByEmail(subdomain, email)` - Find student by email
- `getStudentById(subdomain, userId)` - Find student by ID
- Helper methods: `isActiveStudent()`, `isSubscriber()`, `isPaidStudent()`, etc.

#### `SubscriptionsService`

- `getSubscriptions(options)` - Get subscriptions list
- `getSubscriptionsSummary(options)` - Get subscriptions summary
- `cancelSubscription(subscriberCode, sendMail)` - Cancel single subscription
- `cancelSubscriptions(request)` - Cancel multiple subscriptions
- `reactivateSubscription(subscriberCode, charge)` - Reactivate single subscription
- `reactivateSubscriptions(request)` - Reactivate multiple subscriptions
- `changeBillingDay(subscriberCode, dueDay)` - Change billing day

#### `PagesService`

- `getPages(options)` - Get pages from module
- `getPageById(productId, moduleId, pageId)` - Get specific page
- Helper methods: `isContentPage()`, `isPublished()`, `hasMedia()`, etc.

## Types

The SDK includes comprehensive TypeScript types for all API responses:

- `Student` - Student information
- `Subscription` - Subscription details
- `Page` - Page/content information
- `StudentProgress` - Progress tracking
- `ApiResponse<T>` - Paginated API responses
- And many more...

## Error Handling

The SDK provides detailed error messages for common issues:

```typescript
try {
  await hotmart.subscriptions.changeBillingDay('INVALID_CODE', 45); // Invalid day
} catch (error) {
  console.error(error.message); // "Due day must be between 1 and 31"
}
```

## Rate Limiting

The SDK respects Hotmart's rate limits (500 requests per minute). The HTTP client automatically handles rate limiting and provides appropriate error messages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request to [https://github.com/kleeedolinux/hotmart-sdk](https://github.com/kleeedolinux/hotmart-sdk).

## License

MIT License

## Support

For issues and questions:
- Check the [Hotmart Developer Documentation](https://developers.hotmart.com)
- Open an issue on [GitHub](https://github.com/kleeedolinux/hotmart-sdk/issues)
- Contact Hotmart support

---

Made with ❤️ by the community for the Hotmart developer community 