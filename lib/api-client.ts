import { toast } from 'sonner';

// ─── Response Envelope ───
export type ApiResponse<T> =
  | { success: true; data: T; meta?: { page: number; limit: number; total: number } }
  | { success: false; error: { code: string; message: string } };

// ─── Error Class ───
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ─── Error Code → Human Copy ───
import { errorMessages } from './error-messages';

function humanMessage(code: string, fallback: string): string {
  return errorMessages[code] || fallback;
}

// ─── Resolve base URL ───
// In the browser: use relative URLs (empty string) so requests go to the same origin.
// On the server (SSR / RSC): use the app's own URL since the Hono backend is
// mounted in-process via the catch-all route at app/api/v1/[[...route]].
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  // Server-side: point to the Next.js server itself (Hono runs in-process)
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
}

// ─── Client-side Fetch (Browser) ───
export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipRedirect?: boolean }
): Promise<T> {
  const baseUrl = getBaseUrl();
  const { skipRedirect, ...fetchOptions } = options || {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions?.headers,
  };

  // Remove Content-Type for FormData (file uploads)
  if (fetchOptions?.body instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  }

  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // sends the httpOnly JWT cookie
    cache: 'no-store', // Prevent Next.js from caching API requests
  });

  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const seconds = retryAfter ? parseInt(retryAfter, 10) : 30;
    if (typeof window !== 'undefined') {
      toast.error(`Too many requests. Please wait ${seconds} seconds.`, {
        duration: seconds * 1000,
      });
    }
    throw new ApiError('RATE_LIMITED', `Rate limited. Retry after ${seconds}s`, 429);
  }

  // Handle 401 — redirect to login
  if (res.status === 401 && !skipRedirect) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    const msg = humanMessage(json.error.code, json.error.message);
    throw new ApiError(json.error.code, msg, res.status);
  }

  return json.data;
}

// ─── Fetch with metadata (for paginated responses) ───
export async function apiFetchWithMeta<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T; meta?: { page: number; limit: number; total: number } }> {
  const baseUrl = getBaseUrl();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store', // Prevent Next.js from caching API requests
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    const seconds = retryAfter ? parseInt(retryAfter, 10) : 30;
    if (typeof window !== 'undefined') {
      toast.error(`Too many requests. Please wait ${seconds} seconds.`);
    }
    throw new ApiError('RATE_LIMITED', `Rate limited. Retry after ${seconds}s`, 429);
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    const msg = humanMessage(json.error.code, json.error.message);
    throw new ApiError(json.error.code, msg, res.status);
  }

  return { data: json.data, meta: (json as { meta?: { page: number; limit: number; total: number } }).meta };
}

// ─── File upload helper ───
export async function apiUpload<T>(path: string, file: File, fieldName = 'image'): Promise<T> {
  const baseUrl = getBaseUrl();
  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${baseUrl}/api/v1${path}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new ApiError('UNAUTHORIZED', 'Session expired', 401);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, res.status);
  }

  return json.data;
}

// ─── CSV Download helper ───
export function apiDownloadUrl(path: string): string {
  // In unified mode, downloads go through the same origin
  const baseUrl = typeof window !== 'undefined'
    ? ''
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001');
  return `${baseUrl}/api/v1${path}`;
}
