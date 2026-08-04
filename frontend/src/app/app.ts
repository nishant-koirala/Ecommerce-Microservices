import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastHostComponent } from './shared/components/toast/toast-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastHostComponent],
  template: `
    <div class="flex min-h-dvh flex-col">
      <app-navbar />
      <div class="flex-1">
        <router-outlet />
      </div>
      <app-footer />
    </div>
    <app-toast-host />
  `,
})
export class App {}
