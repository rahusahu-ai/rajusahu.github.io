import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, SignupRequest, AuthUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'currentUser';

  private platformId = inject(PLATFORM_ID);
  private apiService = inject(ApiService);

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkTokenExpiry();
  }

  /**
   * Check if code is running in browser environment
   */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Login method
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { username, password };

    console.log('Login data:', loginData); // Debugging line

    return this.apiService.login(loginData).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          this.setCurrentUser(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Signup method
   */
  signup(signupData: SignupRequest): Observable<any> {
    return this.apiService.signup(signupData).pipe(
      tap(response => {
        if (response.success) {
          // Auto login after signup (optional)
          // You can remove this if you want user to verify email first
        }
      })
    );
  }

  /**
   * Logout method
   */
  logout(): Observable<any> {
    return this.apiService.logout().pipe(
      tap(() => {
        this.clearAuth();
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  /**
   * Manual logout without API call
   */
  logoutLocal(): void {
    this.clearAuth();
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Refresh token
   */
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logoutLocal();
      throw new Error('No refresh token available');
    }

    return this.apiService.refreshToken(refreshToken).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      }),
      catchError(error => {
        this.logoutLocal();
        throw error;
      })
    );
  }

  /**
   * Private helper methods
   */

  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setRefreshToken(refreshToken: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private setCurrentUser(user: AuthUser): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): AuthUser | null {
    if (!this.isBrowser()) return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private hasToken(): boolean {
    if (!this.isBrowser()) return false;
    return !!(localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY));
  }

  private clearAuth(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    this.currentUserSubject.next(null);
  }

  private checkTokenExpiry(): void {
    // You can implement token expiry check here
    // For example, decode JWT token and check expiration
  }
}
