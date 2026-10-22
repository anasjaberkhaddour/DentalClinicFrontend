export interface LoginRequest {
    userName: string;
    password: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
    fullName: string;
    userName: string;
    roles: string[];
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }