/**
 * API Client
 * Base HTTP client for API requests
 * Uses cookie-based authentication (credentials: 'include')
 * NEVER uses Authorization headers or tokens
 */

import { checkApiAvailability } from './routes';

checkApiAvailability();

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      },
    }));

    throw new ApiError(
      response.status,
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || 'An unknown error occurred',
      error.error?.details
    );
  }

  return response.json();
}

export async function apiGet<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
    ...options,
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(
  url: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
    ...options,
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
    credentials: 'include',
    ...options,
  });

  return handleResponse<T>(response);
}
