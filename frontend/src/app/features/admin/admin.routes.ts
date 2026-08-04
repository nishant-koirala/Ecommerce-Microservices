import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { OrdersAdminComponent } from './orders-admin.component';
import { ProductsAdminComponent } from './products-admin.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  { path: 'orders', component: OrdersAdminComponent, canActivate: [adminGuard] },
  { path: 'products', component: ProductsAdminComponent, canActivate: [adminGuard] },
];
