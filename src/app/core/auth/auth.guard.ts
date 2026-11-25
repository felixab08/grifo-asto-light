import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Permite el acceso solo con una sesión de Firebase activa.
 * Espera la primera emisión de `authState` para no redirigir durante una recarga.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.usuario$.pipe(
    take(1),
    map((usuario) => (usuario ? true : router.createUrlTree(['/login']))),
  );
};
