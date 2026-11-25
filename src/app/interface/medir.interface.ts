import { IResponse } from './response.interface';

export interface IResponseMedidor extends IResponse {
  content: MedidaContent[];
}

export interface MedidaContent {
  idMedicion: number;
  fechaMedicion: Date;
  diesel: number;
  regular: number;
  premiun: number;
}

export interface MedidaRequest {
  idpersona: Idpersona;
  diesel: number;
  regular: number;
  premiun: number;
}

export interface Idpersona {
  idPersona: number;
}
