import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { CheckoutComponent } from './checkout.component';

export const checkoutRoutes: Routes = [
  { path: '', component: CheckoutComponent, canActivate: [authGuard] },
];
