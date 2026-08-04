import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div class="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div class="sm:col-span-2 lg:col-span-1">
          <a routerLink="/" class="flex items-center gap-2">
            <span class="flex size-9 items-center justify-center rounded-xl bg-primary-600 font-display text-lg font-bold text-white dark:bg-primary-500">
              A
            </span>
            <span class="font-display text-xl font-semibold text-neutral-900 dark:text-neutral-50">Atelier</span>
          </a>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            A curated selection of modern essentials — thoughtfully designed, honestly made.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Shop</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            <li><a routerLink="/products" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">New arrivals</a></li>
            <li><a routerLink="/products" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Collections</a></li>
            <li><a routerLink="/products" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">All products</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Account</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            <li><a routerLink="/auth/login" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Sign in</a></li>
            <li><a routerLink="/auth/register" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Create account</a></li>
            <li><a routerLink="/cart" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Cart</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">Support</h3>
          <ul class="mt-4 space-y-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            <li><a href="#" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Shipping & returns</a></li>
            <li><a href="#" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">FAQ</a></li>
            <li><a href="#" class="transition-colors hover:text-primary-700 dark:hover:text-primary-300">Contact</a></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-neutral-200 py-6 dark:border-neutral-800">
        <p class="mx-auto max-w-7xl px-4 text-center text-xs text-neutral-400 dark:text-neutral-500 sm:px-6 lg:px-8">
          &copy; {{ year }} Atelier. All rights reserved.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
