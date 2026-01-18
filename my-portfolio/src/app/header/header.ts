import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
   imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() name!: string;
  @Input() role!: string;
  @Input() github!: string;
  @Input() isDark!: boolean;
  @Input() toggleTheme!: () => void;
  // Mobile menu state
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
