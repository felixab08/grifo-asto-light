import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';

import { AuthService } from '@core/auth/auth.service';
import { AlertService } from '../../service';

@Component({
  selector: 'front-navbar',
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent {
  // temas (persistencia localStorage)
  readonly themes: readonly string[] = ['retro', 'winter', 'valentine', 'dark', 'forest'];
  selectedTheme = 'retro';

  constructor() {
    // inicializar tema desde localStorage (si existe)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.applyTheme(savedTheme);
    } else {
      // asegurar tema por defecto
      this.applyTheme(this.selectedTheme);
    }
  }

  private readonly authService = inject(AuthService);
  readonly alertService = inject(AlertService);

  readonly autenticado = this.authService.autenticado;
  readonly nombreUsuario = computed(() => {
    const usuario = this.authService.usuario();
    return usuario?.displayName || usuario?.email || 'Usuario';
  });

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
  }

  applyTheme(theme: string): void {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.selectedTheme = theme;
    } catch {
      // ignore if storage is not available
    }
  }

  onThemeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.applyTheme(input.value);
      // Quita el foco para que el dropdown de daisyUI se cierre.
      input.blur();
    }
  }
}
