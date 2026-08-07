import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PlatformService } from '../../../core/services/platform.service';
import { ThemeService } from '../../../core/services/theme.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-40 border-b border-neutral-200/70 bg-neutral-50/85 backdrop-blur-md transition-shadow duration-200 dark:border-neutral-800/70 dark:bg-neutral-950/85"
      [class.shadow-sm]="scrolled()"
    >
      <nav
        class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-200 sm:px-6 lg:px-8"
        [class.h-14]="scrolled()"
        aria-label="Main navigation"
      >
        <a routerLink="/" class="flex shrink-0 items-center gap-2" aria-label="Atelier home">
          <span
            class="flex size-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white dark:bg-primary-500"
          >
            A
          </span>
          <span class="font-display text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Atelier
          </span>
        </a>

        <!-- Desktop search -->
        <form
          class="hidden flex-1 justify-center px-6 lg:flex"
          role="search"
          (submit)="onSearchSubmit(searchBox.value, $event)"
        >
          <div class="relative w-full max-w-md">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            >
              <path stroke-linecap="round" d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
            </svg>
            <input
              #searchBox
              type="search"
              placeholder="Search products…"
              class="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
        </form>

        <!-- Desktop links -->
        <div class="hidden items-center gap-8 text-sm font-medium md:flex">
          <a
            routerLink="/"
            class="text-neutral-600 transition-colors hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-300"
          >
            Home
          </a>
          <a
            routerLink="/products"
            class="text-neutral-600 transition-colors hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-300"
          >
            Shop All
          </a>
          <a
            routerLink="/products"
            class="text-neutral-600 transition-colors hover:text-primary-700 dark:text-neutral-300 dark:hover:text-primary-300"
          >
            Collections
          </a>
        </div>

        <div class="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            (click)="theme.toggle()"
            class="flex size-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (theme.isDark()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path stroke-linecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            }
          </button>

          <a
            routerLink="/cart"
            class="relative flex size-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            aria-label="Shopping cart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.4l2.2 13.2a1.5 1.5 0 0 0 1.5 1.3h9.2a1.5 1.5 0 0 0 1.5-1.2l1.2-7.3H5.1" />
              <circle cx="9" cy="20.5" r="1" />
              <circle cx="17" cy="20.5" r="1" />
            </svg>
            @if (cart.count() > 0) {
              <span
                class="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-neutral-950"
              >
                {{ cart.count() }}
              </span>
            }
          </a>

          @if (auth.isAuthenticated()) {
            <div class="relative hidden sm:block">
              @if (menuOpen()) {
                <button
                  type="button"
                  (click)="menuOpen.set(false)"
                  class="fixed inset-0 z-40 cursor-default"
                  aria-label="Close user menu"
                ></button>
              }
              <button
                type="button"
                (click)="menuOpen.set(!menuOpen())"
                class="relative z-50 flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                [attr.aria-expanded]="menuOpen()"
              >
                <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white dark:bg-primary-500">
                  {{ initials() }}
                </span>
                <span class="hidden max-w-28 truncate text-sm font-medium text-neutral-700 dark:text-neutral-200 lg:inline">
                  {{ auth.displayName() }}
                </span>
                <svg viewBox="0 0 20 20" fill="currentColor" class="hidden size-3.5 text-neutral-400 lg:block" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd"/>
                </svg>
              </button>
              @if (menuOpen()) {
                <div class="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-soft dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-card-dark">
                  <div class="border-b border-neutral-200 px-3 pb-3 pt-2 dark:border-neutral-800">
                    <p class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-50">{{ auth.displayName() }}</p>
                    <p class="truncate text-xs text-neutral-500 dark:text-neutral-400">{{ auth.currentUser()?.email }}</p>
                  </div>
                  <a
                    routerLink="/account"
                    (click)="menuOpen.set(false)"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                      <circle cx="10" cy="7.5" r="3" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
                    </svg>
                    Account
                  </a>
                  <a
                    routerLink="/account/orders"
                    (click)="menuOpen.set(false)"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m5 7 5-3 5 3-5 3-5-3zm0 0v6l5 3 5-3V7" />
                    </svg>
                    My orders
                  </a>
                  <a
                    routerLink="/account/notifications"
                    (click)="menuOpen.set(false)"
                    class="relative mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 8.5A4.857 4.857 0 0 0 10 3.643 4.857 4.857 0 0 0 5.143 8.5v2.143c0 .858-.286 1.687-.813 2.357h11.34a4.2 4.2 0 0 1-.813-2.357V8.5zM8.5 16.5a1.5 1.5 0 0 0 3 0" />
                    </svg>
                    Notifications
                    @if (notificationService.unreadCount() > 0) {
                      <span class="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-neutral-950">
                        {{ notificationService.unreadCount() }}
                      </span>
                    }
                  </a>
                  <a
                    routerLink="/account/wishlist"
                    (click)="menuOpen.set(false)"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                    </svg>
                    Wishlist
                    @if (wishlist.count() > 0) {
                      <span class="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-neutral-950">
                        {{ wishlist.count() }}
                      </span>
                    }
                  </a>
                  @if (auth.isAdmin()) {
                    <a
                      routerLink="/admin/orders"
                      (click)="menuOpen.set(false)"
                      class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
                      </svg>
                      Admin
                    </a>
                  }
                  <button
                    type="button"
                    (click)="signOut()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-red-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="size-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-7.5A2.25 2.25 0 0 0 3.75 5.25v9.5A2.25 2.25 0 0 0 6 17h7.5a2.25 2.25 0 0 0 2.25-2.25V11m3 0-3-3m0 0-3 3m3-3V17" />
                    </svg>
                    Sign out
                  </button>
                </div>
              }
            </div>
          } @else {
            <a
              routerLink="/auth/login"
              class="hidden rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 sm:block"
            >
              Sign in
            </a>
          }

          <!-- Mobile menu toggle -->
          <button
            type="button"
            (click)="mobileOpen.set(!mobileOpen())"
            class="flex size-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
            aria-expanded="false"
            [attr.aria-label]="mobileOpen() ? 'Close menu' : 'Open menu'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5" aria-hidden="true">
              @if (mobileOpen()) {
                <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
              } @else {
                <path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              }
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile menu panel -->
      @if (mobileOpen()) {
        <div class="border-t border-neutral-200/70 bg-neutral-50 dark:border-neutral-800/70 dark:bg-neutral-950 md:hidden">
          <div class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            <form role="search" (submit)="onSearchSubmit(mobileSearchBox.value, $event)">
              <input
                #mobileSearchBox
                type="search"
                placeholder="Search products…"
                class="w-full rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </form>
            <a routerLink="/" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">
              Home
            </a>
            <a routerLink="/products" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">
              Shop All
            </a>
            <a routerLink="/products" (click)="mobileOpen.set(false)" class="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">
              Collections
            </a>
            <a
              routerLink="/cart"
              (click)="mobileOpen.set(false)"
              class="mt-1 flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-950"
            >
              Cart @if (cart.count() > 0) { ({{ cart.count() }}) }
            </a>
            @if (auth.isAuthenticated()) {
              <a
                routerLink="/account"
                (click)="mobileOpen.set(false)"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Account
              </a>
              <a
                routerLink="/account/orders"
                (click)="mobileOpen.set(false)"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                My orders
              </a>
              <a
                routerLink="/account/notifications"
                (click)="mobileOpen.set(false)"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Notifications @if (notificationService.unreadCount() > 0) { ({{ notificationService.unreadCount() }}) }
              </a>
              <a
                routerLink="/account/wishlist"
                (click)="mobileOpen.set(false)"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Wishlist @if (wishlist.count() > 0) { ({{ wishlist.count() }}) }
              </a>
              @if (auth.isAdmin()) {
                <a
                  routerLink="/admin/orders"
                  (click)="mobileOpen.set(false)"
                  class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                >
                  Admin
                </a>
              }
              <button
                type="button"
                (click)="signOut()"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Sign out
              </button>
            } @else {
              <a
                routerLink="/auth/login"
                (click)="mobileOpen.set(false)"
                class="mt-1 flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
              >
                Sign in
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  protected readonly notificationService = inject(NotificationService);
  protected readonly theme = inject(ThemeService);
  protected readonly wishlist = inject(WishlistService);
  private readonly platform = inject(PlatformService);
  private readonly router = inject(Router);

  protected readonly mobileOpen = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (this.platform.isBrowser) {
      const onScroll = () => this.scrolled.set(window.scrollY > 48);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    }
  }

  private readonly unreadEffect = effect(() => {
    const user = this.auth.currentUser();
    if (user && this.platform.isBrowser) {
      this.notificationService.loadUnreadCount(user.id);
    } else {
      this.notificationService.unreadCount.set(0);
    }
  });

  readonly initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user) {
      return '';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  signOut(): void {
    this.menuOpen.set(false);
    this.mobileOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/']);
  }

  onSearchSubmit(query: string, event: Event): void {
    event.preventDefault();
    const term = query.trim();
    this.router.navigate(['/products'], { queryParams: term ? { search: term } : {} });
    this.mobileOpen.set(false);
  }
}
