import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { OrderConfirmationComponent } from './order-confirmation.component';

export const ordersRoutes: Routes = [
  { path: ':id', component: OrderConfirmationComponent, canActivate: [authGuard] },
];
