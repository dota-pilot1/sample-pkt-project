export type AuthUser = {
  id: number;
  email: string;
  username: string;
  role?: { code: string; name: string };
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSec: number;
  user: AuthUser;
};

export type SignupRequest = { email: string; password: string; username: string };

export type SignupResponse = {
  id: number;
  email: string;
  username: string;
  role?: { code: string; name: string };
  createdAt: string;
};
