import { Injector, Service, computed, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  GoogleAuthProvider,
  authState,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from '@angular/fire/auth';
import { browserLocalPersistence } from 'firebase/auth';
import { Router } from '@angular/router';

@Service()
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  readonly usuario$ = authState(this.auth);
  readonly usuario = toSignal(this.usuario$, { initialValue: null });
  readonly autenticado = computed(() => this.usuario() !== null);
  readonly errorRedirect = signal<unknown>(null);

  constructor() {
    void this.resolveRedirectResult();
  }

  async iniciarSesionConGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    this.errorRedirect.set(null);
    await this.ensureLocalPersistence();

    try {
      await runInInjectionContext(this.injector, () => signInWithPopup(this.auth, provider));
    } catch (error) {
      if (!this.shouldFallbackToRedirect(error)) {
        throw error;
      }

      await runInInjectionContext(this.injector, () => signInWithRedirect(this.auth, provider));
      return;
    }

    await this.router.navigateByUrl('/mediciones');
  }

  async cerrarSesion(): Promise<void> {
    await runInInjectionContext(this.injector, () => signOut(this.auth));
    await this.router.navigateByUrl('/login');
  }

  private async ensureLocalPersistence(): Promise<void> {
    await runInInjectionContext(this.injector, () =>
      setPersistence(this.auth, browserLocalPersistence),
    );
  }

  private async resolveRedirectResult(): Promise<void> {
    try {
      const credential = await runInInjectionContext(this.injector, () =>
        getRedirectResult(this.auth),
      );

      if (credential?.user) {
        await this.router.navigateByUrl('/mediciones');
      }
    } catch (error) {
      this.errorRedirect.set(error);
    }
  }

  private shouldFallbackToRedirect(error: unknown): boolean {
    const code = (error as { code?: string } | null)?.code;

    return (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    );
  }
}
