import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const canActivateGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const isExpired = Date.now() >= decodedToken.exp * 1000;

    if (isExpired) {
      localStorage.removeItem('access_token');
      router.navigate(['/login']);
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem('access_token');
    router.navigate(['/login']);
    return false;
  }
};
