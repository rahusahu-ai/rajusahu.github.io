import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { KiteLogin } from './kite-login';

describe('KiteLogin', () => {
  let component: KiteLogin;
  let fixture: ComponentFixture<KiteLogin>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KiteLogin, HttpClientTestingModule],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KiteLogin);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Kite login and profile actions', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('Login to Kite');
    expect(buttons[1].textContent.trim()).toBe('Get Profile Data');
  });

  it('requests historical data using the selected instrument token', () => {
    component.fromDate = '2026-10-01';
    component.toDate = '2026-10-11';
    component.interval = '5minute';
    component.instrumentToken = 256265;
    component.getMarketData();

    const request = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getNiftyIndexPerMinute') && req.method === 'POST'
    );
    expect(request.request.body).toEqual({
      from_date: '2026-10-01',
      to_date: '2026-10-11',
      interval: '5minute',
      instrument_token: 256265,
      symbol: 'NIFTY 50',
      exchange: 'NSE',
      segment: 'index',
      instrument_type: 'normal',
    });
    request.flush({ candles: [[1, 2, 3]] });

    expect(component.nifty50Data).toEqual({ candles: [[1, 2, 3]] });
    expect(component.status).toContain('Market data loaded for NIFTY 50');
  });
});
