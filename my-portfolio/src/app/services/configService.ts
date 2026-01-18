
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    // Load environment variables or configuration
    this.config = {
      apiUrl: this.getEnvVariable('VITE_API_URL') || 'http://localhost:3000/api',
      apiTimeout: this.getEnvVariable('VITE_API_TIMEOUT') || 30000,
      enableAnalytics: this.getEnvVariable('ENABLE_ANALYTICS') !== 'false',
      enableDarkMode: this.getEnvVariable('ENABLE_DARK_MODE') !== 'false'
    };
  }

  private getEnvVariable(key: string): string | null {
    // In a real Angular app, you'd get this from your environment file
    return null;
  }

  getConfig(key: string): any {
    return this.config[key];
  }

  getAllConfig(): any {
    return this.config;
  }
}