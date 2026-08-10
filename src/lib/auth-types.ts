export type User = {
  id: string;
  aud?: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

export type Session = { user: User; access_token: string };
