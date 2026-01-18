import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import your standalone components (without 'Component' in the name)
import { Header } from './header/header';
import { ContactCard } from './contact-card/contact-card';
import { Skills } from './skills/skills';
import { Projects } from './projects/projects';
import { ContactForm } from './contact-form/contact-form';
import { Footer } from './footer/footer';
import { Experience } from './experience/experience';
import { Education } from './education/education';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    Header,
    ContactCard,
    Skills,
    Projects,
    Experience,
    Education,
    ContactForm,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  // Services
  private authService = inject(AuthService);
  private router = inject(Router);

  // Properties
  protected readonly title = signal('my-portfolio');
  name = 'Raju Kumar Sahu';
  role = 'Full Stack Developer';
  email = 'rajuatuoh@gmail.com';
  phone = '+91-9542911419';
  github = 'https://github.com/rahusahu-ai';
  location = 'Hyderabad, India';
  year = new Date().getFullYear();
  isDark = false;

  // Lifecycle management
  private destroy$ = new Subject<void>();

  /**
   * Angular Lifecycle Hook: ngOnInit
   * Called after the component is initialized and all input properties are set
   * This is the best place to fetch data and initialize the component
   */
  ngOnInit(): void {
    console.log('App component initialized');
    this.initializeTheme();
  //  this.loadUserData();
    this.loginCheck();
  }

  /**
   * Angular Lifecycle Hook: ngOnDestroy
   * Called when the component is about to be destroyed
   * Best place to cleanup subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    console.log('App component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize theme from localStorage
   */
  private initializeTheme(): void {
   // const savedTheme = localStorage.getItem('theme');
    if (this.isDark === true) {
      document.documentElement.classList.add('dark');
    }
  }


  private loginCheck(): void {
    console.log('Performing login check');
      this.authService.login('raju', 'Admin@123').subscribe({
      next: (response) => {
       // this.isLoading = false;
       // this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          console.log('Redirecting to dashboard');
          console.log(response);
          //this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
      //  this.isLoading = false;
      //  this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
      }
    });
  }

  /**
   * Load user data if authenticated
   */
  private loadUserData(): void {
    console.log('Loading user data');
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          console.log('Current user:', user);
          // Update component data if needed
        }
      });
  }

  /**
   * Toggle theme and save preference
   */
  toggleTheme(): void {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }
}


