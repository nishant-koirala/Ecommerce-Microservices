import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'theme';
export type Theme = 'light' | 'dark';

/**
 * Controls class-based dark mode: toggles `.dark` on <html>, persists the
 * choice, and defaults to the OS preference. An inline script in index.html
 * applies the class before first paint to avoid a flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = this.document.defaultView?.localStorage?.getItem(THEME_KEY);
      const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
      this.apply(stored === 'dark' || (!stored && prefersDark));
    }
  }

  toggle(): void {
    this.apply(!this.isDark());
  }

  set(theme: Theme): void {
    this.apply(theme === 'dark');
  }

  private apply(dark: boolean): void {
    this.isDark.set(dark);
    if (isPlatformBrowser(this.platformId)) {
      this.document.documentElement.classList.toggle('dark', dark);
      this.document.defaultView?.localStorage?.setItem(THEME_KEY, dark ? 'dark' : 'light');
    }
  }
}
