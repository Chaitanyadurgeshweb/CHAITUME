// In-memory store — data resets on cold start / redeploy.
// For persistent storage, replace with a database (e.g. Vercel Postgres, Supabase, PlanetScale).

export interface ManagedUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface LoginRecord {
  id: string;
  username: string;
  timestamp: string;
}

interface Store {
  users: ManagedUser[];
  loginHistory: LoginRecord[];
}

const store: Store = { users: [], loginHistory: [] };

export function getUsers(): ManagedUser[] {
  return store.users;
}

export function getUserById(id: string): ManagedUser | undefined {
  return store.users.find((u) => u.id === id);
}

export function getUserByUsername(username: string): ManagedUser | undefined {
  return store.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

export function createUser(user: ManagedUser): void {
  store.users.push(user);
}

export function updateUser(id: string, updates: Partial<ManagedUser>): boolean {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.users[idx] = { ...store.users[idx], ...updates };
  return true;
}

export function deleteUser(id: string): boolean {
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  return true;
}

export function recordLogin(username: string): void {
  store.loginHistory.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    username,
    timestamp: new Date().toISOString(),
  });
  if (store.loginHistory.length > 500) {
    store.loginHistory = store.loginHistory.slice(-500);
  }
}

export function getLoginHistory(username: string): LoginRecord[] {
  return store.loginHistory
    .filter((r) => r.username === username)
    .slice()
    .reverse();
}
