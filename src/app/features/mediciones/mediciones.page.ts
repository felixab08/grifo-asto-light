import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormUtils } from '../../utils/form.util';
import { AlertService, LinkParamService, StoreService } from '../../service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedidaContent } from '../../interface/medir.interface';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { DatePipe, NgClass } from '@angular/common';
import { DieselPipe, PremiumPipe, RegularPipe } from '../../pipes';

interface ModeloMedicion {
  diesel: number | null;
  regular: number | null;
  premium: number | null;
  observacion: string;
}

const MEDIDA_MAXIMA = 230;

@Component({
  selector: 'app-mediciones-page',
  imports: [
    PaginationComponent,
    NgClass,
    DieselPipe,
    RegularPipe,
    PremiumPipe,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './mediciones.page.html',
})
export class MedicionesPage {
  formUtils = FormUtils;
  @ViewChild('modalMedidaRef') modalMedidaRef!: ElementRef;
  modalOpen = signal(false);
  typeDialog = signal<'Crear' | 'Editar'>('Crear');
  storeService = inject(StoreService);
  private _alertService = inject(AlertService);
  _linkService = inject(LinkParamService);

  ngOnInit(): void {}
  private _fb = inject(FormBuilder);
  myForm: FormGroup = this._fb.group({
    idMedicion: [0],
    diesel: ['', [Validators.required, Validators.min(0), Validators.max(230)]],
    regular: ['', [Validators.required, Validators.min(0), Validators.max(230)]],
    premiun: ['', [Validators.required, Validators.min(0), Validators.max(230)]],
    fechaMedicion: [''],
  });

  async onSave() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    let sendMeassure = this.myForm.value;
  }

  listaMeasure = rxResource({
    params: () => ({
      page: this._linkService.currentPage() - 1,
      size: this._linkService.currentSize(),
    }),
    stream: ({ params }) => {
      return [] as any;
    },
  });

  deleteMedida(id: number) {}
  openModal(item: MedidaContent, dialog?: HTMLDialogElement | null): void {
    if (!dialog) return;
    try {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      this.modalOpen.set(true);
      this.typeDialog.set(item ? 'Editar' : 'Crear');
      this.onEdit(item);
    } catch (err) {
      console.error('No se pudo abrir el modal', err);
    }
  }

  closeModal(dialog?: HTMLDialogElement | null): void {
    if (!dialog) return;
    try {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      this.modalOpen.set(false);
    } catch (err) {
      console.error('No se pudo cerrar el modal', err);
    }
  }
  onEdit(item: MedidaContent) {
    this.myForm.patchValue({
      idMedicion: item.idMedicion,
      diesel: item.diesel,
      regular: item.regular,
      premiun: item.premiun,
      fechaMedicion: item.fechaMedicion,
    });
  }
}
