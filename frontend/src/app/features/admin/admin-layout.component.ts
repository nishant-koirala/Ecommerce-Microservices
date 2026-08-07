import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
  { path: '/admin/orders', label: 'Orders', icon: 'package' },
  { path: '/admin/products', label: 'Products', icon: 'cube' },
  { path: '/admin/categories', label: 'Categories', icon: 'folder' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
] as const;

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex min-h-dvh bg-neutral-950 text-neutral-100">
      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-400">
        <div class="flex h-14 items-center gap-2 px-5">
          <span class="flex size-7 items-center justify-center rounded-md bg-white text-xs font-bold text-neutral-950">A</span>
          <span class="text-sm font-semibold tracking-wide text-white">Atelier Admin</span>
        </div>
        <nav class="mt-2 flex-1 space-y-1 px-3" aria-label="Admin sections">
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path"
              routerLinkActive="bg-neutral-800 text-white shadow-[inset_3px_0_0_0_#7c9cc9]"
              [routerLinkActiveOptions]="{ exact: item.path.endsWith('/dashboard') }"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4.5 shrink-0" aria-hidden="true">
                @switch (item.icon) {
                  @case ('grid') {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                  }
                  @case ('package') {
                    <path stroke-linecap="round" stroke-linejoin="round" d="m7.5 3.5-5 3v7l5 3 5-3v-7l-5-3Zm0 0V10m6.5-3L10 10m-6.5 0L10 10" />
                  }
                  @case ('cube') {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 2.5 1.5 7.5v5l8.5 5 8.5-5v-5L10 2.5Zm0 0v7.5m6.5-4.5-6.5 4.5m-6.5-4.5 6.5 4.5" />
                  }
                  @case ('folder') {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 5.5h4.4l1.6 1.5h9v8h-15V5.5Z" />
                  }
                  @case ('users') {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-5 6.5c0-2.4 2.1-4 5-4s5 1.6 5 4" />
                  }
                }
              </svg>
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="border-t border-neutral-800 p-4">
          <p class="text-sm font-medium text-white truncate">{{ auth.displayName() }}</p>
          <p class="text-xs text-neutral-500 truncate">{{ auth.currentUser()?.email }}</p>
        </div>
      </aside>

      <!-- Main column -->
      <div class="ml-60 flex min-h-dvh flex-1 flex-col">
        <header class="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6">
          <h1 class="text-sm font-semibold text-neutral-100">{{ title() }}</h1>
          <a routerLink="/" class="flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-100">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-3.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12.5 15 8 10.5 12.5 6" />
            </svg>
            Back to store
          </a>
        </header>
        <main class="flex-1 px-6 py-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly nav = NAV;
  readonly title = signal('Dashboard');

  constructor() {
    this.title.set(this.titleFor(this.router.url));
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.title.set(this.titleFor(e.urlAfterRedirects)));
  }

  private titleFor(url: string): string {
    if (url.includes('/orders')) return 'Orders';
    if (url.includes('/products')) return 'Products';
    if (url.includes('/categories')) return 'Categories';
    if (url.includes('/users')) return 'Users';
    return 'Dashboard';
  }
}
