import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastHostComponent } from './shared/components/toast/toast-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastHostComponent],
  template: `
    <div class="flex min-h-dvh flex-col">
      @if (!isAdminRoute()) {
        <app-navbar />
      }
      <div class="flex-1">
        <router-outlet />
      </div>
      @if (!isAdminRoute()) {
        <app-footer />
      }
    </div>
    <app-toast-host />
  `,
})
export class App {
  readonly isAdminRoute = signal(false);
  private readonly router = inject(Router);

  constructor() {
    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin')));
  }
}
