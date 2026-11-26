import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent {
  // temas (persistencia localStorage)
  public themes: string[] = ['retro', 'winter', 'valentine', 'aqua', 'forest'];
  public selectedTheme: string = 'retro';

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

  applyTheme(theme: string) {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.selectedTheme = theme;
    } catch (e) {
      // ignore if not available
    }
  }

  onThemeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.applyTheme(value);
  }
}
