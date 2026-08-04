import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

/**
 * SSR-safe wrapper around localStorage. All reads/writes no-op on the server
 * so prerendering never touches the browser Storage API.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  private get store(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  get(key: string): string | null {
    return this.store?.getItem(key) ?? null;
  }

  set(key: string, value: string): void {
    this.store?.setItem(key, value);
  }

  remove(key: string): void {
    this.store?.removeItem(key);
  }

  getObject<T>(key: string): T | null {
    const raw = this.get(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setObject<T>(key: string, value: T): void {
    this.set(key, JSON.stringify(value));
  }
}
