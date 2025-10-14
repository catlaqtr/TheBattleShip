import { loadAuth, getToken } from './auth';

const BASE_URL = '/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  opts?: { public?: boolean }
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (!opts?.public) {
    const auth = loadAuth();
    const token = auth?.token ?? getToken();
    const tokenType = auth?.tokenType || 'Bearer';
    const devUser = (import.meta as unknown as { env: { VITE_DEV_USER_ID?: string } }).env
      .VITE_DEV_USER_ID;
    if (token) headers['Authorization'] = `${tokenType} ${token}`;
    else if (devUser) headers['X-User-Id'] = devUser;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const parsed: unknown = isJson
    ? await res.json().catch(() => undefined)
    : await res.text().catch(() => undefined);

  if (!res.ok) {
    let msg = res.statusText || 'Request failed';
    if (typeof parsed === 'object' && parsed !== null) {
      const maybeMessage = (parsed as { message?: unknown }).message;
      const maybeError = (parsed as { error?: unknown }).error;
      if (typeof maybeMessage === 'string') msg = maybeMessage;
      else if (typeof maybeError === 'string') msg = maybeError;
    } else if (typeof parsed === 'string' && parsed.trim()) {
      msg = parsed;
    }
    if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
      // Log full payload in dev to help debugging
      console.error('[API]', res.status, parsed ?? msg);
    }
    const error = new Error(msg) as Error & { status?: number; data?: unknown };
    error.status = res.status;
    error.data = parsed;
    throw error;
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, opts?: { public?: boolean }) => request<T>(path, 'GET', undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: { public?: boolean }) =>
    request<T>(path, 'POST', body, opts),
  put: <T>(path: string, body?: unknown, opts?: { public?: boolean }) =>
    request<T>(path, 'PUT', body, opts),
  patch: <T>(path: string, body?: unknown, opts?: { public?: boolean }) =>
    request<T>(path, 'PATCH', body, opts),
  delete: <T>(path: string, opts?: { public?: boolean }) =>
    request<T>(path, 'DELETE', undefined, opts),
};
