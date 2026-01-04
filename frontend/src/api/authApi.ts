import { API_CONFIG, API_ENDPOINTS, HTTP_METHODS } from '../config/apiConfig';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}


export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`;
    const response = await fetch(url, {
      method: HTTP_METHODS.POST,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Invalid username or password');
    }

    if (!data.token) {
      throw new Error('Invalid response from server');
    }

    return {
      token: data.token,
      username: data.username || request.username,
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUsername(): string | null {
    return localStorage.getItem('username');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

