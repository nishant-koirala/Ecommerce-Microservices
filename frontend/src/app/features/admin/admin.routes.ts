import { Routes } from '@angular/router';

import { adminGuard } from '../../core/guards/admin.guard';
import { AdminLayoutComponent } from './admin-layout.component';
import { CategoriesAdminComponent } from './categories-admin.component';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { OrdersAdminComponent } from './orders-admin.component';
import { ProductsAdminComponent } from './products-admin.component';
import { UsersAdminComponent } from './users-admin.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'orders', component: OrdersAdminComponent },
      { path: 'products', component: ProductsAdminComponent },
      { path: 'categories', component: CategoriesAdminComponent },
      { path: 'users', component: UsersAdminComponent },
    ],
  },
];
