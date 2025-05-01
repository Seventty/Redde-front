// app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';
import { canActivateGuard } from '@/shared/core/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [canActivateGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('@/pages/dashboard/homeDashboard').then((m) => m.HomeDashboard)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('@/pages/auth/login').then((m) => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('@/pages/auth/register').then((m) => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('@/pages/auth/forgotpassword').then((m) => m.ForgotPassword)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
