import { Injector, Service, computed, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, authState, signInWithPopup, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Service()
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  readonly usuario$ = authState(this.auth);
  readonly usuario = toSignal(this.usuario$, { initialValue: null });
  readonly autenticado = computed(() => this.usuario() !== null);

  async iniciarSesionConGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    await runInInjectionContext(this.injector, () => signInWithPopup(this.auth, provider));
    await this.router.navigateByUrl('/mediciones');
  }

  async cerrarSesion(): Promise<void> {
    await runInInjectionContext(this.injector, () => signOut(this.auth));
    await this.router.navigateByUrl('/login');
  }
}
