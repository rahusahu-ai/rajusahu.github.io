import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ApiService,
  KiteBackfillResult,
  KiteInstrument,
} from '../../services/api.service';

@Component({
  selector: 'app-kite-login',
  imports: [FormsModule, JsonPipe],
  templateUrl: './kite-login.html',
  styleUrl: './kite-login.css',
})
export class KiteLogin implements OnInit {
  status = 'Ready to connect to Kite';
  isLoading = false;
  nifty50Data: unknown = null;
  entities: KiteInstrument[] = [];
  exchangeList: string[] = [];
  segmentList: string[] = [];
  fromDate = this.getDateOffset(-7);
  toDate = this.getDateOffset(0);
  interval = '5minute';
  years = 1;
  saveToDb = false;
  instrumentType = 'normal';
  exchange = '';
  segment = '';
  symbol = '';
  instrumentToken: number | null = null;

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
  readonly backfillYears = Array.from({ length: 15 }, (_, index) => index + 1);

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('kiteLogin') === 'success') {
      this.getAllExchangeList();
    } else {
      this.status = 'Log in to Kite to load exchanges.';
    }
  }

  get filteredEntities(): KiteInstrument[] {
    return this.entities.filter((instrument) => this.matchesInstrumentType(instrument));
  }

  onExchangeChange(): void {
    this.segment = '';
    this.segmentList = [];
    this.entities = [];
    this.instrumentToken = null;
    this.symbol = '';
    if (this.exchange) {
      this.getSegmentList();
    }
  }

  onSegmentChange(): void {
    this.entities = [];
    this.instrumentToken = null;
    this.symbol = '';
    if (this.exchange && this.segment) {
      this.getAllEntityList();
    }
  }

  onInstrumentFiltersChange(): void {
    this.getAllExchangeList();
    this.selectFirstEntity();
  }

  onInstrumentChange(instrumentToken: string | number | null): void {
    const token = Number(instrumentToken);
    this.instrumentToken = Number.isSafeInteger(token) && token > 0 ? token : null;
    const instrument = this.entities.find((item) => Number(item.instrument_token) === token);
    this.symbol = instrument?.trading_symbol ?? '';
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
      marketSegment: this.segment,
      instrumentType: this.instrumentType,
      saveToDb: this.saveToDb,
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

  backfillHistoricalData(): void {
    const instrumentToken = Number(this.instrumentToken);
    if (!Number.isSafeInteger(instrumentToken) || instrumentToken <= 0 || !this.symbol) {
      this.status = 'Select a valid entity before starting the backfill.';
      return;
    }

    this.isLoading = true;
    this.status = `Backfilling ${this.symbol} data for ${this.years} year${this.years === 1 ? '' : 's'}…`;
    this.apiService.backfillHistoricalData({
      instrument_token: instrumentToken,
      symbol: this.symbol,
      years: this.years,
      interval: this.interval,
    }).subscribe({
      next: (result) => {
        const counts = this.getBackfillCounts(result);
        const details = this.getBackfillDetails(result);
        this.status = `Backfill finished for ${this.symbol}: ${counts}.${details}`;
        this.isLoading = false;
      },
      error: (error) => {
        const errorBody: unknown = error?.error;
        const message = this.getBackfillMessage(errorBody) || error?.message || 'Backfill request failed.';
        const counts = this.getBackfillCounts(errorBody);
        const details = this.getBackfillDetails(errorBody);
        this.status = `Backfill failed for ${this.symbol}: ${counts}. ${message}${details}`;
        this.isLoading = false;
      },
    });
  }

  getAllExchangeList(): void {
    this.status = 'Loading exchanges…';
    console.info('[Kite] Requesting exchange list.');
    this.apiService.getAllExchangeList().subscribe({
      next: (exchanges) => {
        console.info('[Kite] Exchange list response received:', exchanges);
        this.exchangeList = exchanges;
        this.exchange = exchanges.includes('NSE') ? 'NSE' : exchanges[0] ?? '';
        console.info('[Kite] Selected exchange:', this.exchange || '(none)');
        this.status = `Loaded ${exchanges.length} exchanges.`;
        if (this.exchange) {
          this.getSegmentList();
        }
      },
      error: (error) => {
        console.error('[Kite] Failed to load exchange list:', error);
        this.status = error?.error?.message || 'Unable to load exchanges.';
      },
    });
  }

  getSegmentList(): void {
    this.status = `Loading segments for ${this.exchange}…`;
    this.apiService.getSegmentList(this.exchange).subscribe({
      next: (segments) => {
        this.segmentList = segments;
        this.segment = segments[0] ?? '';
        this.status = `Loaded ${segments.length} segments for ${this.exchange}.`;
        if (this.segment) {
          this.getAllEntityList();
        }
      },
      error: (error) => {
        this.status = error?.error?.message || `Unable to load segments for ${this.exchange}.`;
      },
    });
  }

  getAllEntityList(): void {
    this.status = `Loading entities for ${this.exchange} / ${this.segment}…`;
    this.apiService.getAllEntityList(this.exchange, this.segment).subscribe({
      next: (entities) => {
        this.entities = entities;
        this.selectFirstEntity();
        this.status = `Loaded ${entities.length} entities for ${this.exchange} / ${this.segment}.`;
      },
      error: (error) => {
        this.status = error?.error?.message || `Unable to load entities for ${this.exchange} / ${this.segment}.`;
      },
    });
  }

  private selectFirstEntity(): void {
    const instrument = this.filteredEntities[0];
    this.instrumentToken = instrument ? Number(instrument.instrument_token) : null;
    this.symbol = instrument?.trading_symbol ?? '';
  }

  private getBackfillCounts(result: unknown): string {
    if (!result || typeof result !== 'object') {
      return 'inserted count unavailable, failed count unavailable';
    }

    const response = result as KiteBackfillResult;
    const inserted = response.inserted ?? response.inserted_count ?? response.insertedCount;
    const failed = response.failed ?? response.failed_count ?? response.failedCount;
    return `inserted ${this.formatCount(inserted)}, failed ${this.formatCount(failed)}`;
  }

  private getBackfillMessage(result: unknown): string {
    if (!result || typeof result !== 'object') {
      return '';
    }
    const message = (result as KiteBackfillResult).message;
    return typeof message === 'string' ? message : '';
  }

  private getBackfillDetails(result: unknown): string {
    if (!result || typeof result !== 'object') {
      return '';
    }
    const errors = (result as KiteBackfillResult).errors;
    return Array.isArray(errors) && errors.length ? ` Details: ${errors.join('; ')}` : '';
  }

  private formatCount(count: number | undefined): string {
    return typeof count === 'number' && Number.isFinite(count) ? String(count) : 'unavailable';
  }

  private matchesInstrumentType(instrument: KiteInstrument): boolean {
    const type = instrument.instrument_type.toUpperCase();
    if (this.instrumentType === 'option') {
      return type === 'CE' || type === 'PE';
    }
    if (this.instrumentType === 'future') {
      return type === 'FUT';
    }
    return type === 'EQ';
  }

  private getDateOffset(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-');
  }

  loginToKite(): void {
    this.isLoading = true;
    this.status = 'Opening Kite login…';
    this.apiService.loginToKite().subscribe({
      next: (response) => {
        window.location.assign(response.loginUrl);
      },
      error: (error) => {
        this.status = error?.error?.message || 'Unable to initiate Kite login.';
        this.isLoading = false;
      },
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
