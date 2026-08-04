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
  // Feature pages land in later phases; the placeholder keeps navigation alive.
  { path: 'auth/login', loadComponent: comingSoon },
  { path: 'auth/register', loadComponent: comingSoon },
  { path: '**', redirectTo: '' },
];
