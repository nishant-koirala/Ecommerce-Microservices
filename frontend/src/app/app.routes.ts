import { Routes } from '@angular/router';

const comingSoon = () =>
  import('./shared/components/coming-soon/coming-soon.component').then(
    (m) => m.ComingSoonComponent,
  );

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then((m) => m.productsRoutes),
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.cartRoutes),
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.checkoutRoutes),
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ordersRoutes),
  },
  // Feature pages land in later phases; the placeholder keeps navigation alive.
  { path: 'auth/login', loadComponent: comingSoon },
  { path: 'auth/register', loadComponent: comingSoon },
  { path: '**', redirectTo: '' },
];
