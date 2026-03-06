export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
