export type UserView = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  user: UserView;
};

const KEY = "battleship.auth";

export function saveAuth(resp: AuthResponse) {
  localStorage.setItem(KEY, JSON.stringify(resp));
}

export function loadAuth(): AuthResponse | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return loadAuth()?.token ?? null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
