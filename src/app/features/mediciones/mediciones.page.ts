import { formatDate } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormField, form, max, min, required, submit } from '@angular/forms/signals';
import type { FieldState } from '@angular/forms/signals';
import { Medicion } from '@core/mediciones/medicion.model';
import { MedicionesService } from '@core/mediciones/mediciones.service';
import { DieselPipe, PremiumPipe, RegularPipe } from '../../pipes';
import { AlertService } from '../../service';

const MAX_MEASURE_CM = 230;

interface TankMeasurement {
  diesel: number;
  regular: number;
  premium: number;
}

const emptyMeasurement = (): TankMeasurement => ({ diesel: 0, regular: 0, premium: 0 });

@Component({
  selector: 'app-mediciones-page',
  imports: [FormField, DieselPipe, RegularPipe, PremiumPipe],
  templateUrl: './mediciones.page.html',
})
export class MedicionesPage {
  private readonly medicionesService = inject(MedicionesService);
  private readonly alertService = inject(AlertService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialogoMedida');

  readonly maxMeasure = MAX_MEASURE_CM;
  readonly saving = signal(false);

  readonly measurementModel = signal<TankMeasurement>(emptyMeasurement());

  readonly measurementForm = form(this.measurementModel, (path) => {
    required(path.diesel, { message: 'Ingresa la medida del diésel.' });
    min(path.diesel, 0, { message: 'La medida no puede ser negativa.' });
    max(path.diesel, MAX_MEASURE_CM, {
      message: `La medida no puede superar ${MAX_MEASURE_CM} cm.`,
    });

    required(path.regular, { message: 'Ingresa la medida del regular.' });
    min(path.regular, 0, { message: 'La medida no puede ser negativa.' });
    max(path.regular, MAX_MEASURE_CM, {
      message: `La medida no puede superar ${MAX_MEASURE_CM} cm.`,
    });

    required(path.premium, { message: 'Ingresa la medida del premium.' });
    min(path.premium, 0, { message: 'La medida no puede ser negativa.' });
    max(path.premium, MAX_MEASURE_CM, {
      message: `La medida no puede superar ${MAX_MEASURE_CM} cm.`,
    });
  });

  readonly medicionesResource = rxResource({
    stream: () => this.medicionesService.listarRecientes(),
  });

  readonly mediciones = computed(() => this.medicionesResource.value() ?? []);

  abrirModal(): void {
    this.reiniciarFormulario();
    this.dialog().nativeElement.showModal();
  }

  cerrarModal(): void {
    this.dialog().nativeElement.close();
  }

  mostrarError(state: FieldState<number>): boolean {
    return state.touched() && state.invalid();
  }

  mensajeError(state: FieldState<number>): string {
    return state.errors()[0]?.message ?? 'Revisa este valor.';
  }

  fecha(medicion: Medicion): string {
    if (!medicion.fecha) {
      return 'Sincronizando…';
    }

    return formatDate(medicion.fecha.toDate(), 'dd/MM/yyyy HH:mm', 'es-PE');
  }

  async guardar(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    await submit(this.measurementForm, async () => {
      this.saving.set(true);

      try {
        await this.medicionesService.registrar({
          ...this.measurementModel(),
          observacion: null,
        });

        this.cerrarModal();
        this.reiniciarFormulario();
        this.alertService.getAlert(
          'Medida guardada',
          'La lectura se registró correctamente.',
          'success',
        );
      } catch {
        this.alertService.getAlert(
          'No se pudo guardar',
          'Revisa tu conexión e inténtalo de nuevo.',
          'error',
        );
      } finally {
        this.saving.set(false);
      }
    });
  }

  private reiniciarFormulario(): void {
    this.measurementModel.set(emptyMeasurement());
    this.measurementForm().reset();
  }
}
