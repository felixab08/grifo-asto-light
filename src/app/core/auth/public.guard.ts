import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Evita que un usuario autenticado vuelva a la pantalla de login.
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.usuario$.pipe(
    take(1),
    map((usuario) => (usuario ? router.createUrlTree(['/mediciones']) : true)),
  );
};
