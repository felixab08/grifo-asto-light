import { Timestamp } from '@angular/fire/firestore';

export interface RegistradoPor {
  uid: string;
  email: string | null;
  nombre: string | null;
}

export interface Medicion {
  id: string;
  diesel: number;
  regular: number;
  premium: number;
  observacion: string | null;
  fecha: Timestamp | null;
  registradoPor: RegistradoPor;
}

export interface NuevaMedicion {
  diesel: number;
  regular: number;
  premium: number;
  observacion: string | null;
}
