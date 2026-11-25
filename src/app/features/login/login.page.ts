import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly authService = inject(AuthService);

  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly faltaConfigurar = environment.firebase.apiKey.startsWith('REEMPLAZA');

  readonly mensajeError = computed(() => {
    const redirectError = this.authService.errorRedirect();

    return this.error() ?? (redirectError ? this.traducirError(redirectError) : null);
  });

  constructor() {
    effect(() => {
      const redirectError = this.authService.errorRedirect();

      if (redirectError) {
        console.error('Error al procesar el inicio de sesión con Google', redirectError);
      }
    });
  }

  async ingresarConGoogle(): Promise<void> {
    this.error.set(null);
    this.cargando.set(true);
    try {
      await this.authService.iniciarSesionConGoogle();
    } catch (error) {
      console.error('Error al iniciar sesión con Google', error);
      this.error.set(this.traducirError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  private traducirError(error: unknown): string {
    const codigo = (error as { code?: string } | null)?.code ?? '';
    console.log(codigo);

    switch (codigo) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Se canceló el inicio de sesión. Inténtalo de nuevo.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana de inicio de sesión. Habilita las ventanas emergentes e inténtalo de nuevo.';
      case 'auth/network-request-failed':
        return 'No hay conexión. Revisa tu internet e inténtalo de nuevo.';
      case 'auth/unauthorized-domain':
      case 'auth/operation-not-allowed':
      case 'auth/configuration-not-found':
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
        return 'El inicio de sesión no está disponible en este momento. Contacta al administrador.';
      default:
        return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    }
  }
}
