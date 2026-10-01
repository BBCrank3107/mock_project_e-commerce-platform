export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone?: string;
}
