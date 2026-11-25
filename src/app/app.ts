import { Component, computed, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AlertService, StoreService } from './service';
import { IConfirmDelete } from './interface/confirDelete.interface';
import { AlertComponent } from './components/alert/alert.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, AlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);

  readonly autenticado = this.authService.autenticado;
  readonly nombreUsuario = computed(() => {
    const usuario = this.authService.usuario();
    return usuario?.displayName || usuario?.email || 'Usuario';
  });

  async cerrarSesion(): Promise<void> {
    await this.authService.cerrarSesion();
  }
  public _storeService = inject(StoreService);
  public _alertService = inject(AlertService);
  isModalConfirm: boolean = true;

  @ViewChild('modalRef') modalRef!: ElementRef;

  constructor() {
    // Listen modal open/close and act accordingly
    this._storeService.isModalConfirm$.subscribe((isModalConfirm) => {
      this.isModalConfirm = isModalConfirm;
      const dialog = this.modalRef?.nativeElement ?? null;
      if (isModalConfirm) {
        this.openModal(dialog);
      } else {
        this.closeModal(dialog);
      }
    });
  }

  onDialogClick(event: Event) {
    const dialogEl = this.modalRef?.nativeElement as HTMLDialogElement | undefined;
    if (!dialogEl) return;
    if (event.target === dialogEl) {
      this.closeDialog();
    }
  }

  openModal(dialog: HTMLDialogElement | null): void {
    if (!dialog) return;
    try {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    } catch (err) {
      console.error('No se pudo abrir el modal', err);
    }
  }

  closeModal(dialog: HTMLDialogElement | null): void {
    if (!dialog) return;
    try {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    } catch (err) {
      console.error('No se pudo cerrar el modal', err);
    }
  }

  confirm() {
    let answerConfirm: IConfirmDelete = {
      answered: true,
      response: true,
    };
    this._storeService.responseModalConfirmSubject.next(answerConfirm);
    this.closeModal(this.modalRef?.nativeElement);
  }

  closeDialog() {
    let answerConfirm: IConfirmDelete = {
      answered: true,
      response: false,
    };
    this._storeService.responseModalConfirmSubject.next(answerConfirm);
    this.closeModal(this.modalRef?.nativeElement);
  }
}
