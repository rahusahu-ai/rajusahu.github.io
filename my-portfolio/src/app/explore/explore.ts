import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class ExploreComponent implements OnInit {
  private router = inject(Router);

  services = [
    {
      id: 1,
      title: 'Full Stack Development',
      subtitle: 'Building Scalable Solutions',
      description: 'I create end-to-end web solutions using modern technologies like Angular, Node.js, and cloud platforms.',
      image: 'assets/dev.jpg',
      icon: 'fa-code',
      bgColor: 'from-indigo-950 to-slate-900',
      features: ['Latest Projects', 'Technical Blog', 'Code Tutorials', 'Open Source'],
      buttonText: 'View Portfolio',
      accentColor: 'sky'
    },
    {
      id: 2,
      title: 'Consulting & Mentorship',
      subtitle: 'Strategic Technology Guidance',
      description: 'Get expert advice on architecture, best practices, and career growth in tech. I help teams and individuals excel.',
      image: 'assets/consulting.jpg',
      icon: 'fa-lightbulb',
      bgColor: 'from-slate-900 to-slate-800',
      features: ['1-on-1 Sessions', 'Code Reviews', 'Career Coaching', 'Architecture Design'],
      buttonText: 'Book a Session',
      accentColor: 'cyan'
    },
    {
      id: 3,
      title: 'Technical Writing',
      subtitle: 'Knowledge Sharing & Documentation',
      description: 'I write in-depth technical articles, tutorials, and documentation to help developers learn and grow.',
      image: 'assets/writing.jpg',
      icon: 'fa-pen-nib',
      bgColor: 'from-red-900 to-rose-950',
      features: ['Technical Blogs', 'Tutorials', 'Documentation', 'Case Studies'],
      buttonText: 'Read Articles',
      accentColor: 'rose'
    }
  ];

  ngOnInit(): void {
    console.log('Explore component loaded');
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  }
}
