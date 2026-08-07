import { Routes } from '@angular/router';

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
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.routes').then((m) => m.accountRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'about',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.aboutRoutes),
  },
  {
    path: 'contact',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.contactRoutes),
  },
  {
    path: 'faq',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.faqRoutes),
  },
  {
    path: 'shipping-returns',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.shippingReturnsRoutes),
  },
  {
    path: 'terms',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.termsRoutes),
  },
  {
    path: 'privacy',
    loadChildren: () => import('./features/pages/pages.routes').then((m) => m.privacyRoutes),
  },
  {
    path: '**',
    loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.notFoundRoutes),
  },
];
