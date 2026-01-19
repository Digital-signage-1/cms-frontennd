# ✅ ApiError Import Issue - FIXED

## Problem
The application was throwing a build error:
```
Attempted import error: 'ApiError' is not exported from '@signage/api-client'
```

This was affecting:
- `/app/(auth)/sign-in/page.tsx`
- `/lib/errors.ts`

## Root Cause
The `ApiError` class was defined in `/packages/api-client/src/client.ts` but was not being exported from the package's main entry point (`/packages/api-client/src/index.ts`).

## Solution

### 1. Updated Package Export
**File**: `/packages/api-client/src/index.ts`

Added `ApiError` to the exports:
```typescript
export { ApiClient, createApiClient, ApiError } from './client'
```

**Before:**
```typescript
export { ApiClient, createApiClient } from './client'
```

**After:**
```typescript
export { ApiClient, createApiClient, ApiError } from './client'
```

### 2. Updated Error Utilities
**File**: `/apps/dashboard/src/lib/errors.ts`

- Now properly imports and re-exports `ApiError` from `@signage/api-client`
- Added helper functions for error handling
- Created `createApiError()` utility for creating ApiError instances

## Files Modified

✅ `/packages/api-client/src/index.ts` - Added ApiError export
✅ `/apps/dashboard/src/lib/errors.ts` - Fixed imports and added utilities

## Error Handling Flow

```
API Request Error
      ↓
ApiClient throws ApiError (from @signage/api-client)
      ↓
Component catches error
      ↓
getErrorMessage(error) - converts to user-friendly message
      ↓
Display to user
```

## Error Code Mapping

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | "Please check your input and try again." |
| 401 | UNAUTHORIZED | "Please sign in to continue." |
| 403 | FORBIDDEN | "You do not have permission to perform this action." |
| 404 | NOT_FOUND | "The requested resource was not found." |
| 409 | CONFLICT | "This resource already exists." |
| 500 | INTERNAL_ERROR | "A server error occurred. Please try again later." |

## Usage Example

```typescript
import { getErrorMessage } from '@/lib/errors'

try {
  await signIn(email, password)
} catch (error) {
  const message = getErrorMessage(error)
  setError(message)
}
```

## Testing

- ✅ Sign-in page compiles without errors
- ✅ ApiError is properly imported
- ✅ Error messages display correctly
- ✅ No linter errors
- ✅ TypeScript types are correct

## Result

The import error is now fixed and the application should build successfully. All error handling is working as expected with proper TypeScript types.
