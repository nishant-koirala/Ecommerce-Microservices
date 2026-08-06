import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { CategoriesAdminComponent } from './categories-admin.component';
import { OrdersAdminComponent } from './orders-admin.component';
import { ProductsAdminComponent } from './products-admin.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  { path: 'orders', component: OrdersAdminComponent, canActivate: [adminGuard] },
  { path: 'products', component: ProductsAdminComponent, canActivate: [adminGuard] },
  { path: 'categories', component: CategoriesAdminComponent, canActivate: [adminGuard] },
];
