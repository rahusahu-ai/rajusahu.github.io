import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-kite-login',
  imports: [FormsModule, JsonPipe],
  templateUrl: './kite-login.html',
  styleUrl: './kite-login.css',
})
export class KiteLogin {
  status = 'Ready to connect to Kite';
  isLoading = false;
  nifty50Data: unknown = null;
  fromDate = this.getDateOffset(-7);
  toDate = this.getDateOffset(0);
  interval = '5minute';
  marketSegment = 'index';
  instrumentType = 'normal';
  exchange = 'NSE';
  symbol = 'NIFTY 50';
  instrumentToken: number | null = 256265;

  readonly intervals = [
    { label: '1 minute', value: 'minute' },
    { label: '3 minutes', value: '3minute' },
    { label: '5 minutes', value: '5minute' },
    { label: '10 minutes', value: '10minute' },
    { label: '15 minutes', value: '15minute' },
    { label: '30 minutes', value: '30minute' },
    { label: '60 minutes', value: '60minute' },
    { label: '1 day', value: 'day' },
  ];

  readonly indices = ['NIFTY 50', 'NIFTY BANK', 'NIFTY FIN SERVICE', 'NIFTY MIDCAP 50'];
  readonly stocks = [
    'ADANIENT', 'ADANIPORTS', 'BHARTIARTL', 'HCLTECH', 'HDFCBANK', 'ICICIBANK',
    'INFY', 'ITC', 'LT', 'MARUTI', 'RELIANCE', 'SBIN', 'TATAMOTORS', 'TCS', 'WIPRO',
  ];

  constructor(private apiService: ApiService) {}

  get symbols(): string[] {
    return this.marketSegment === 'index' ? this.indices : this.stocks;
  }

  onMarketSegmentChange(): void {
    this.symbol = this.symbols[0];
    this.updateInstrumentToken();
  }

  onSymbolChange(): void {
    this.updateInstrumentToken();
  }

  getMarketData(): void {
    if (!this.fromDate || !this.toDate || this.fromDate > this.toDate) {
      this.status = 'Choose a valid date range.';
      return;
    }

    const instrumentToken = Number(this.instrumentToken);
    if (!Number.isSafeInteger(instrumentToken) || instrumentToken <= 0) {
      this.status = 'Enter a valid Kite instrument token for the selected symbol.';
      return;
    }

    this.isLoading = true;
    this.status = `Fetching ${this.symbol} data…`;
    this.nifty50Data = null;
    this.apiService.getNifty50Data({
      fromDate: this.fromDate,
      toDate: this.toDate,
      interval: this.interval,
      instrumentToken,
      symbol: this.symbol,
      exchange: this.exchange,
      marketSegment: this.marketSegment,
      instrumentType: this.instrumentType,
    }).subscribe({
      next: (data) => {
        this.nifty50Data = data;
        this.status = `Market data loaded for ${this.symbol}. The current backend uses its fixed one-hour, one-minute range.`;
        this.isLoading = false;
      },
      error: (error) => {
        this.status = error?.error?.message || 'Unable to load market data';
        this.isLoading = false;
      },
    });
  }

  private updateInstrumentToken(): void {
    this.instrumentToken = this.marketSegment === 'index' && this.symbol === 'NIFTY 50'
      ? 256265
      : null;
  }

  private getDateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
  }

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
