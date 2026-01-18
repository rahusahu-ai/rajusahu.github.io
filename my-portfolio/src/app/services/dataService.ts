import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private skillsSubject = new BehaviorSubject<any[]>([]);
  private projectsSubject = new BehaviorSubject<any[]>([]);
  private experienceSubject = new BehaviorSubject<any[]>([]);
  private educationSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  skills$ = this.skillsSubject.asObservable();
  projects$ = this.projectsSubject.asObservable();
  experience$ = this.experienceSubject.asObservable();
  education$ = this.educationSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) { }

  loadSkills(): Observable<any> {
    this.loadingSubject.next(true);
    return this.apiService.getSkills().pipe(
      tap(data => {
        this.skillsSubject.next(data);
        this.loadingSubject.next(false);
      })
    );
  }

  loadProjects(): Observable<any> {
    this.loadingSubject.next(true);
    return this.apiService.getProjects().pipe(
      tap(data => {
        this.projectsSubject.next(data);
        this.loadingSubject.next(false);
      })
    );
  }

  loadExperience(): Observable<any> {
    this.loadingSubject.next(true);
    return this.apiService.getExperience().pipe(
      tap(data => {
        this.experienceSubject.next(data);
        this.loadingSubject.next(false);
      })
    );
  }

  loadEducation(): Observable<any> {
    this.loadingSubject.next(true);
    return this.apiService.getEducation().pipe(
      tap(data => {
        this.educationSubject.next(data);
        this.loadingSubject.next(false);
      })
    );
  }

  // Get current values without making API call
  getSkillsValue(): any[] {
    return this.skillsSubject.value;
  }

  getProjectsValue(): any[] {
    return this.projectsSubject.value;
  }

  getExperienceValue(): any[] {
    return this.experienceSubject.value;
  }

  getEducationValue(): any[] {
    return this.educationSubject.value;
  }
}