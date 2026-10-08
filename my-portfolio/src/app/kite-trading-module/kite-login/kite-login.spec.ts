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

  it('renders the Kite login and Nifty 50 actions', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('Login to Kite');
    expect(buttons[1].textContent.trim()).toBe('Get Nifty 50 Data');
  });

  it('requests Nifty 50 data from the local server endpoint', () => {
    component.getNifty50Data();

    const request = httpTestingController.expectOne('/api/kite/nifty50');
    expect(request.request.method).toBe('GET');
    request.flush({ data: [{ symbol: 'NIFTY 50' }] });

    expect(component.nifty50Data).toEqual({ data: [{ symbol: 'NIFTY 50' }] });
    expect(component.status).toBe('Nifty 50 data loaded');
  });
});
