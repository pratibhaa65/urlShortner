const BASE_URL = "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include", // send httpOnly auth cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Some endpoints may return no body
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || "Something went wrong");
  }

  return data as T;
}

export interface User {
  id: number;
  email: string;
}

export interface ShortLink {
  id: number;
  url: string;
  shortCode: string;
  userId: number;
  createdAt: string;
}

export interface LinksResponse {
  links: ShortLink[];
  currentPage: number;
  totalPages: number;
}

// Auth API

export const authApi = {
  register: (email: string, password: string) =>
    request<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () => request<User>("/api/auth/me"),
};

// Links API

export const linksApi = {
  list: (page: number = 1) => request<LinksResponse>(`/api/links?page=${page}`),

  create: (url: string, shortCode?: string) =>
    request<{ shortCode: string }>("/api/links", {
      method: "POST",
      body: JSON.stringify({ url, shortCode }),
    }),

  update: (id: number, url: string, shortCode: string) =>
    request<{ success: boolean }>(`/api/links/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ url, shortCode }),
    }),

  delete: (id: number) => request<{ success: boolean }>(`/api/links/${id}`, { method: "DELETE" }),
};