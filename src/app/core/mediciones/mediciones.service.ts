import { Injector, Service, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { Medicion, NuevaMedicion } from './medicion.model';

const COLECCION = 'mediciones';

@Service()
export class MedicionesService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);
  private readonly coleccion = collection(this.firestore, COLECCION);

  listarRecientes(cantidad = 30): Observable<Medicion[]> {
    const consulta = query(this.coleccion, orderBy('fecha', 'desc'), limit(cantidad));

    return runInInjectionContext(this.injector, () =>
      collectionData(consulta, { idField: 'id' }),
    ) as Observable<Medicion[]>;
  }

  async registrar(medicion: NuevaMedicion): Promise<void> {
    const usuario = this.authService.usuario();

    if (!usuario) {
      throw new Error('Se requiere una sesión activa para registrar medidas.');
    }

    await runInInjectionContext(this.injector, () =>
      addDoc(this.coleccion, {
        ...medicion,
        fecha: serverTimestamp(),
        registradoPor: {
          uid: usuario.uid,
          email: usuario.email,
          nombre: usuario.displayName,
        },
      }),
    );
  }
}
