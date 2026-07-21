/** Client-side fetch wrapper with a typed error carrying field-level messages. */

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  code?: string;
  retryAfter?: number;

  constructor(
    message: string,
    status: number,
    extra?: { fields?: Record<string, string>; code?: string; retryAfter?: number },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = extra?.fields;
    this.code = extra?.code;
    this.retryAfter = extra?.retryAfter;
  }
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...init?.headers,
    },
    ...init,
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new ApiError((data.error as string) || "Something went wrong.", res.status, {
      fields: data.fields as Record<string, string> | undefined,
      code: data.code as string | undefined,
      retryAfter: data.retryAfter as number | undefined,
    });
  }
  return data as T;
}

export const apiGet = <T>(url: string) => apiFetch<T>(url);

export const apiPost = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export const apiPatch = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "PATCH", body: body === undefined ? undefined : JSON.stringify(body) });

export const apiDelete = <T>(url: string, body?: unknown) =>
  apiFetch<T>(url, { method: "DELETE", body: body === undefined ? undefined : JSON.stringify(body) });
