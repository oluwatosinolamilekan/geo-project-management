# API Consumption Strategy

This project follows a secure API consumption pattern where the Next.js frontend does not directly communicate with the Laravel API from the client's browser. Instead, all API calls are properly proxied or handled through the Next.js server.

## Architecture Overview

### 1. Server Actions (Mutations)
All create, update, and delete operations are handled using Next.js Server Actions:

- **Location**: `src/lib/server-actions.ts`
- **Usage**: Direct server-side calls to Laravel API
- **Security**: API keys and sensitive data stay on the server
- **Operations**: 
  - `createRegion`, `updateRegion`, `deleteRegion`
  - `createProject`, `updateProject`, `deleteProject`
  - `createPin`, `updatePin`, `deletePin`

### 2. API Routes (Data Fetching)
All read operations are handled through Next.js API routes:

- **Location**: `src/app/api/`
- **Usage**: Client-side calls to Next.js API routes that proxy to Laravel
- **Operations**:
  - `GET /api/regions` - Fetch all regions
  - `GET /api/regions/[id]/projects` - Fetch projects by region
  - `GET /api/projects/[id]` - Fetch individual project
  - `GET /api/projects/[id]/pins` - Fetch pins by project
  - `GET /api/pins/[id]` - Fetch individual pin

### 3. Client-Side API (Read Operations Only)
The client-side API module only handles read operations:

- **Location**: `src/lib/api.ts`
- **Usage**: Client-side calls to Next.js API routes
- **Operations**: Only GET requests for data fetching

## Environment Configuration

```env
# Laravel API URL for server-side requests (Server Actions and API Routes)
LARAVEL_API_URL=http://localhost:8000

# Next.js API URL for client-side requests (read operations only)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Benefits

1. **Security**: API keys and sensitive data never exposed to the client
2. **CORS**: No need to configure CORS on Laravel backend
3. **Performance**: Better caching and optimization opportunities
4. **Maintainability**: Centralized API logic in Next.js
5. **Type Safety**: Full TypeScript support for all operations

## Usage Examples

### Server Actions (Mutations)
```typescript
import { createRegion } from '@/lib/server-actions';

// In a form submission
const formData = new FormData();
formData.append('name', 'New Region');
const result = await createRegion(formData);

if (result.success) {
  // Handle success
} else {
  // Handle error
}
```

### API Routes (Data Fetching)
```typescript
import { regionsApi } from '@/lib/api';

// In a component
const regions = await regionsApi.getAll();
```

## Migration Notes

The refactoring involved:

1. **Removing mutation functions** from `src/lib/api.ts`
2. **Creating server actions** for all mutations in `src/lib/server-actions.ts`
3. **Creating API routes** for data fetching in `src/app/api/`
4. **Updating components** to use server actions for mutations
5. **Updating environment configuration** to separate server and client API URLs

## Security Considerations

- All mutation operations are now server-side only
- No direct Laravel API calls from the client browser
- Environment variables are properly separated for server and client usage
- Form data is validated on both client and server sides
