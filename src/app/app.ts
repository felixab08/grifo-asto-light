import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AlertComponent } from './components/alert/alert.component';
import { AlertService } from './service';
import { FrontNavbarComponent } from './components/front-navbar/front-navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertComponent, FrontNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);
  readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly autenticado = this.authService.autenticado;
  readonly nombreUsuario = computed(() => {
    const usuario = this.authService.usuario();
    return usuario?.displayName || usuario?.email || 'Usuario';
  });

  constructor() {
    if (this.authService.errorRedirect() !== null) {
      this.authService.errorRedirect.set(null);
      this.authService.cerrarSesion();
    }
    if (!this.autenticado()) {
      this.router.navigate(['/login']);
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
  }
}
