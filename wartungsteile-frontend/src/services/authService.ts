// authService.ts - Authentifizierungs-Service
import api from './api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

interface LoginRequest {
  username: string;
  password: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      const { accessToken, refreshToken, user } = response.data;
      
      // Tokens und Benutzerdaten speichern
      this.setTokens(accessToken, refreshToken);
      this.setUser(user);
      
      // API-Header aktualisieren
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return response.data;
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    // Tokens und Benutzerdaten löschen
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // API-Header zurücksetzen
    delete api.defaults.headers.common['Authorization'];
    
    // Optional: Backend-Logout aufrufen
    // await api.post('/auth/logout').catch(() => {});
  }

  // Token-Verwaltung
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Benutzer-Verwaltung
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Authentifizierungsstatus
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Token-Gültigkeit prüfen (optional)
    try {
      const payload = this.parseJwt(token);
      const exp = payload.exp * 1000; // Konvertiere zu Millisekunden
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  // Berechtigungen prüfen
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Administrator');
  }

  isTechnician(): boolean {
    return this.hasRole('Techniker');
  }

  // Token-Refresh
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('Kein Refresh-Token vorhanden');
    
    try {
      const response = await api.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken
      });
      
      const { accessToken } = response.data;
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return accessToken;
    } catch (error) {
      // Bei Fehler ausloggen
      this.logout();
      throw error;
    }
  }

  // Hilfsfunktionen
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Initialisierung beim App-Start
  initialize(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      this.logout();
    }
  }
}

// Singleton-Instanz
export const authService = new AuthService();

// Token-Interceptor für automatisches Refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authService.refreshToken();
        return api(originalRequest);
      } catch {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default authService;