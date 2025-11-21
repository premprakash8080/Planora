import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'planora-theme';
  private readonly renderer: Renderer2;
  private readonly themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.applyTheme(this.themeSubject.value);
  }

  /**
   * Get current theme as Observable
   */
  get theme$(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  /**
   * Get current theme synchronously
   */
  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Check if current theme is dark
   */
  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set theme explicitly
   */
  setTheme(theme: Theme): void {
    if (theme !== this.currentTheme) {
      this.applyTheme(theme);
      this.themeSubject.next(theme);
      this.saveTheme(theme);
    }
  }

  /**
   * Get initial theme from storage or system preference
   */
  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Fallback to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    // Default to light
    return 'light';
  }

  /**
   * Apply theme to document with smooth transition
   */
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    const body = document.body;

    // Add transition class for smooth animation
    this.renderer.addClass(html, 'theme-transitioning');
    this.renderer.addClass(body, 'theme-transitioning');

    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      if (theme === 'dark') {
        this.renderer.addClass(html, 'dark-theme');
        this.renderer.setAttribute(html, 'data-theme', 'dark');
        this.renderer.addClass(body, 'dark-theme');
      } else {
        this.renderer.removeClass(html, 'dark-theme');
        this.renderer.setAttribute(html, 'data-theme', 'light');
        this.renderer.removeClass(body, 'dark-theme');
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        this.renderer.removeClass(html, 'theme-transitioning');
        this.renderer.removeClass(body, 'theme-transitioning');
      }, 300);
    });
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }
}

