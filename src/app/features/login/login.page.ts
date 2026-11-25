import { Component, inject, signal } from '@angular/core';
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

  async ingresarConGoogle(): Promise<void> {
    this.error.set(null);
    this.cargando.set(true);

    try {
      await this.authService.iniciarSesionConGoogle();
    } catch (error) {
      this.error.set(this.traducirError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  private traducirError(error: unknown): string {
    const codigo = (error as { code?: string } | null)?.code ?? '';

    switch (codigo) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return 'Se canceló el inicio de sesión. Inténtalo de nuevo.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana de Google. Habilita las ventanas emergentes para este sitio.';
      case 'auth/unauthorized-domain':
        return 'Este dominio no está autorizado en Firebase Authentication. Agrégalo en Authentication → Settings → Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'El proveedor de Google no está habilitado en Firebase Authentication.';
      case 'auth/network-request-failed':
        return 'No hay conexión con Firebase. Revisa tu internet e inténtalo de nuevo.';
      case 'auth/configuration-not-found':
        return 'Falta configurar Firebase Authentication. Revisa el proyecto en la consola de Firebase.';
      case 'auth/invalid-api-key':
      case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
        return 'La configuración de Firebase no es válida. Revisa src/environments/environment.ts.';
      default:
        return 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
    }
  }
}
