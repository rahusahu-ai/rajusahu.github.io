import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { KiteLogin } from './kite-login';

describe('KiteLogin', () => {
  let component: KiteLogin;
  let fixture: ComponentFixture<KiteLogin>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KiteLogin, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => 'success' } } },
        },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KiteLogin);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges(false);

    const exchangesRequest = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getAllExchangeList') && req.method === 'GET'
    );
    exchangesRequest.flush(['BFO', 'BSE', 'CDS', 'GLOBAL', 'MCX', 'NCO', 'NFO', 'NSE', 'NSEIX']);

    const segmentsRequest = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getSegmentList') &&
      req.method === 'GET' &&
      req.params.get('exchange') === 'NSE'
    );
    segmentsRequest.flush(['INDICES', 'NSE']);

    const entitiesRequest = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getAllEntityList') &&
      req.method === 'GET' &&
      req.params.get('exchange') === 'NSE' &&
      req.params.get('segment') === 'INDICES'
    );
    entitiesRequest.flush([
      {
        instrument_token: '403465',
        exchange_token: '14900',
        tradingsymbol: 'SAHYADRI',
        name: 'SAHYADRI INDUSTRIES',
        last_price: 0,
        expiry: '',
        strike: 0,
        tick_size: 0.05,
        lot_size: 1,
        segment: 'INDICES',
        instrument_type: 'EQ',
        exchange: 'NSE',
      },
    ]);
    await fixture.whenStable();
    fixture.detectChanges(false);
  });

  afterEach(() => httpTestingController.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Kite login and profile actions', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.actions button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('Login to Kite');
    expect(buttons[1].textContent.trim()).toBe('Get Profile Data');
  });

  it('loads exchange, segment, and entity data into their dropdowns', () => {
    const instrumentSelect: HTMLSelectElement =
      fixture.nativeElement.querySelector('select[name="entity"]');

    expect(component.exchangeList).toContain('NSE');
    expect(fixture.nativeElement.querySelector('select[name="exchange"]').options.length).toBe(9);
    expect(component.segmentList).toEqual(['INDICES', 'NSE']);
    expect(component.segment).toBe('INDICES');
    expect(component.entities.length).toBe(1);
    expect(component.filteredEntities.length).toBe(1);
    expect(component.instrumentToken).toBe(403465);
    expect(instrumentSelect.selectedOptions[0].value).toBe('403465');
    expect(instrumentSelect.selectedOptions[0].textContent).toContain('SAHYADRI');
  });

  it('requests historical data using the selected instrument token', () => {
    component.fromDate = '2026-10-01';
    component.toDate = '2026-10-11';
    component.interval = '5minute';
    component.instrumentToken = 403465;
    component.getMarketData();

    const request = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getNiftyIndexPerMinute') && req.method === 'POST'
    );
    expect(request.request.body).toEqual({
      from_date: '2026-10-01',
      to_date: '2026-10-11',
      interval: '5minute',
      instrument_token: 403465,
      symbol: 'SAHYADRI',
      exchange: 'NSE',
      segment: 'INDICES',
      instrument_type: 'normal',
      save_to_db: false,
    });
    request.flush({ candles: [[1, 2, 3]] });

    expect(component.nifty50Data).toEqual({ candles: [[1, 2, 3]] });
    expect(component.status).toContain('Market data loaded for SAHYADRI');
  });

  it('passes the save-to-database choice with the historical data request', () => {
    component.saveToDb = true;
    component.getMarketData();

    const request = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/getNiftyIndexPerMinute') && req.method === 'POST'
    );
    expect(request.request.body.save_to_db).toBeTrue();
    request.flush({ candles: [] });
  });

  it('backfills the selected entity for the chosen number of years and reports counts', () => {
    component.years = 3;
    component.backfillHistoricalData();

    const request = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/backfillHistoricalData') && req.method === 'POST'
    );
    expect(request.request.body).toEqual({
      instrument_token: 403465,
      symbol: 'SAHYADRI',
      years: 3,
      interval: '5minute',
    });
    request.flush({ inserted: 120, failed: 2 });

    expect(component.status).toContain('inserted 120, failed 2');
  });

  it('shows server error text and partial backfill counts on failure', () => {
    component.backfillHistoricalData();

    const request = httpTestingController.expectOne((req) =>
      req.url.endsWith('/kite/backfillHistoricalData') && req.method === 'POST'
    );
    request.flush(
      { message: 'Kite rate limit reached', inserted_count: 45, failed_count: 3 },
      { status: 429, statusText: 'Too Many Requests' }
    );

    expect(component.status).toContain('inserted 45, failed 3');
    expect(component.status).toContain('Kite rate limit reached');
    expect(component.isLoading).toBeFalse();
  });
});
