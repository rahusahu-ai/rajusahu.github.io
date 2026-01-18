import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ==================== Authentication APIs ====================

  // Login API
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData);
  }

  // Signup API
  signup(signupData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/auth/signup`, signupData);
  }

  // Logout API
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }

  // Refresh Token API
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  // Forgot Password API
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  // Reset Password API
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  // ==================== Contact Form & Portfolio APIs ====================

  // Contact Form Submission
  submitContactForm(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, formData);
  }

  // Get Portfolio Data
  getPortfolioData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/portfolio`);
  }

  // Get Skills
  getSkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/skills`);
  }

  // Get Projects
  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  // Get Experience
  getExperience(): Observable<any> {
    return this.http.get(`${this.apiUrl}/experience`);
  }

  // Get Education
  getEducation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/education`);
  }

  // Download Resume
  downloadResume(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/resume`, { responseType: 'blob' });
  }

  // Get all testimonials
  getTestimonials(): Observable<any> {
    return this.http.get(`${this.apiUrl}/testimonials`);
  }

  // Subscribe to newsletter
  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subscribe`, { email });
  }
}