import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { publicGuard } from '@core/auth/public.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Ingresar | Grifo Asto',
    loadComponent: () => import('@features/login/login.page').then((m) => m.LoginPage),
    canActivate: [publicGuard],
  },
  {
    path: 'mediciones',
    title: 'Medidas de tanques | Grifo Asto',
    loadComponent: () =>
      import('@features/mediciones/mediciones.page').then((m) => m.MedicionesPage),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'mediciones',
  },
  {
    path: '**',
    redirectTo: 'mediciones',
  },
];
