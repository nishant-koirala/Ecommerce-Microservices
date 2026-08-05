import { Routes } from '@angular/router';

import { authGuard } from '../../core/guards/auth.guard';
import { AccountComponent } from './account.component';
import { NotificationsComponent } from './notifications.component';
import { OrdersComponent } from './orders.component';
import { WishlistComponent } from './wishlist.component';

export const accountRoutes: Routes = [
  { path: '', component: AccountComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
];
