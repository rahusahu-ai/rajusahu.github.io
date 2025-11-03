import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Import your standalone components (without 'Component' in the name)
import { Header } from './header/header';
import { ContactCard } from './contact-card/contact-card';
import { Skills } from './skills/skills';
import { Projects } from './projects/projects';
import { ContactForm } from './contact-form/contact-form';
import { Footer } from './footer/footer';

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
    ContactForm,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('my-portfolio');
  name = 'Raju Kumar Sahu';
  role = 'Full Stack Developer (.NET + Angular)';
  email = 'rajuatuoh@gmail.com';
  phone = '+91-9542911419';
  github = 'https://github.com/rahusahu-ai';
  location = 'Hyderabad, India';
  year = new Date().getFullYear();
  isDark = true;
  toggleTheme() { this.isDark = !this.isDark; document.documentElement.classList.toggle('dark'); }
}
