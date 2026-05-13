import { toWordPressPath, wordpressConfig, wordpressHeaders } from './wordpress';

export type Release = {
  id: number;
  title: string;
  artist_name: string;
  release_type: string;
  status: string;
  cover_url: string;
  release_date: string;
  genre: string;
  upc: string;
  tracks: number;
  created_at: string;
};

export type AnalyticsRow = {
  id: number;
  release_id: number;
  platform: string;
  country: string;
  streams: number;
  royalties: number;
  period: string;
  listeners: number;
  saves: number;
};

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  status: string;
  transaction_date: string;
  method: string;
  reference: string;
};

export type Pitch = {
  id: number;
  artist_name: string;
  email: string;
  release_title: string;
  genre: string;
  pitch_goal: string;
  story: string;
  links: string;
  status: string;
  created_at: string;
};

export type Profile = {
  id: number;
  artist_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
};

export type PaystackBank = {
  name: string;
  code: string;
  slug?: string;
  country?: string;
  currency?: string;
  type?: string;
};

export type ResolvedAccount = {
  account_number: string;
  account_name: string;
  bank_id?: number;
};

export type RoyaltyPayoutPayload = {
  amount: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  email: string;
  narration?: string;
};

export type RoyaltyPayoutResult = {
  ok: boolean;
  reference: string;
  status: string;
  message: string;
  transaction?: Transaction;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const endpoint = path;
  if (!endpoint) throw new Error('WordPress API base is not configured.');
  const res = await fetch(endpoint, {
    ...options,
    credentials: 'include', // ensure cookies/auth are sent
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

export const api = {
  releases: () => request<Release[]>('/api/releases'),
  createRelease: (payload: Partial<Release>) => request<Release>('/api/releases', { method: 'POST', body: JSON.stringify(payload) }),
  updateRelease: (payload: Partial<Release> & { id: number }) => request<Release>('/api/releases', { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRelease: (id: number) => request<{ ok: true }>('/api/releases', { method: 'DELETE', body: JSON.stringify({ id }) }),
  analytics: () => request<AnalyticsRow[]>('/api/analytics'),
  transactions: () => request<Transaction[]>('/api/transactions'),
  requestPayout: (payload: { amount: number; method: string; note?: string }) => request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  paystackBanks: async () => {
    try {
      const res = await fetch('https://api.paystack.co/bank');
      if (!res.ok) throw new Error('Failed to load banks');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },
  resolvePaystackAccount: (payload: { bank_code: string; account_number: string }) => request<ResolvedAccount>('/api/payments?action=resolve-account', { method: 'POST', body: JSON.stringify(payload) }),
  requestRoyaltyPayout: (payload: RoyaltyPayoutPayload) => request<RoyaltyPayoutResult>('/api/payments?action=payout', { method: 'POST', body: JSON.stringify(payload) }),
  verifyRoyaltyPayout: (reference: string) => request<RoyaltyPayoutResult>('/api/payments?action=verify', { method: 'POST', body: JSON.stringify({ reference }) }),
  pitches: () => request<Pitch[]>('/api/pitches'),
  createPitch: (payload: Omit<Pitch, 'id' | 'status' | 'created_at'>) => request<Pitch>('/api/pitches', { method: 'POST', body: JSON.stringify(payload) }),
  profile: () => request<Profile>('/api/profile'),
  updateProfile: (payload: Partial<Profile>) => request<Profile>('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  changePassword: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<{ ok: true; message: string }>('/api/password', { method: 'POST', body: JSON.stringify(payload) }),
  notifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: number) => request<Notification>('/api/notifications', { method: 'PUT', body: JSON.stringify({ id }) }),
};
