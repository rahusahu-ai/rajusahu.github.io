export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    name: string;
  };
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string;
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}
