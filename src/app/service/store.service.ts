import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IConfirmDelete } from '../interface/confirDelete.interface';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  public isSessionActive$ = new EventEmitter<boolean>();
  public isModalConfirm$ = new EventEmitter<boolean>();

  // SHARED, REACTIVE and STORED DATA
  // We need share, react and store at each data change,
  // If we need update yours states, we need make a new request
  // to the service and all subscribers will react at this change.

  isLoginSubject = new BehaviorSubject<boolean>(false);
  isAlertSubject = new BehaviorSubject<boolean>(false);

  responseModalConfirmSubject = new BehaviorSubject<IConfirmDelete>({
    answered: false,
    response: false,
  });
  responseModalConfirm$ = this.responseModalConfirmSubject.asObservable();
}
