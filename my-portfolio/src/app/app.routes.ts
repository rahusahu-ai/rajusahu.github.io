import { Routes } from '@angular/router';
import { ExploreComponent } from './explore/explore';
import { App } from './app';

export const routes: Routes = [
  {
    path: '',
    component: App,
    children: [
      {
        path: 'tradeAnalysis',
        loadComponent: () => import('./kite-trading-module/kite-login/kite-login').then(m => m.KiteLogin)
      },
      {
        path: 'trade',
        loadComponent: () => import('./kite-trading-module/kite-login/kite-login').then(m => m.KiteLogin) 
      },
      {
        path: 'analysis',
        loadComponent: () => import('./kite-trading-module/kite-login/kite-login').then(m => m.KiteLogin)
      },
    ]
  },
  { path: 'explore', component: ExploreComponent },
  { path: '**', redirectTo: 'explore' }
];
