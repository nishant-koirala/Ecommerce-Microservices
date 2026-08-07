import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client
  },
  {
    path: 'orders/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/register',
    renderMode: RenderMode.Client
  },
  {
    path: 'account',
    renderMode: RenderMode.Client
  },
  {
    path: 'account/orders',
    renderMode: RenderMode.Client
  },
  {
    path: 'account/notifications',
    renderMode: RenderMode.Client
  },
  {
    path: 'account/wishlist',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/orders',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/products',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/categories',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/users',
    renderMode: RenderMode.Client
  },
  {
    path: 'account/reviews',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
