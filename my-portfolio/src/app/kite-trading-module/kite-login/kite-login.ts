import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-kite-login',
  imports: [JsonPipe],
  templateUrl: './kite-login.html',
  styleUrl: './kite-login.css',
})
export class KiteLogin {
  status = 'Ready to connect to Kite';
  isLoading = false;
  nifty50Data: unknown = null;

  constructor(private apiService: ApiService) {}

  loginToKite(): void {
    this.isLoading = true;
    this.status = 'Opening Kite login…';
    this.apiService.loginToKite();

    this.apiService.loginToKite().subscribe({
    next: response => {
      window.location.assign(response.loginUrl);
    },
    error: error => {
      console.error('Unable to initiate Kite login', error);
    }
  });
  }

  getNifty50Data(): void {
    this.isLoading = true;
    this.status = 'Fetching Nifty 50 data…';
    this.nifty50Data = null;

    this.apiService.getNifty50Data().subscribe({
      next: (data) => {
        this.nifty50Data = data;
        this.status = 'Nifty 50 data loaded';
        this.isLoading = false;
      },
      error: (error) => {
        this.status = error?.error?.message || 'Unable to load Nifty 50 data';
        this.isLoading = false;
      }
    });
  }

  getprofile(): void {
    this.isLoading = true;
    this.status = 'Fetching profile data…';
    this.nifty50Data = null;  
    this.apiService.getprofile().subscribe({
      next: (data) => {
        this.nifty50Data = data;    
    this.status = 'Profile data loaded';
        this.isLoading = false;
      },
      error: (error) => {
        this.status = error?.error?.message || 'Unable to load profile data';     
    this.isLoading = false; 
      }
    });
  }
}
