import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileGaleryService {
  constructor() { }

  private roomId: string;
  private roomName: string;

  private roomNameFlag: BehaviorSubject<string> = new BehaviorSubject<string>("");
  roomNameFlag$: Observable<string> = this.roomNameFlag.asObservable();

  private creatorFlag: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  creatorFlag$: Observable<boolean> = this.creatorFlag.asObservable();

  private selectedFile: any;

  private _modalOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public modalOpened$: Observable<boolean> = this._modalOpened.asObservable();

  private _modalRoomOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public modalRoomOpened$: Observable<boolean> = this._modalRoomOpened.asObservable();

  private _eventUploadFile = new Subject<boolean>();
  private _statusActiveDocument = new BehaviorSubject<string>('');

  public getRoomId() {
    return this.roomId;
  }

  public setRoomId(roomId: string) {
    this.roomId = roomId;
  }

  public getRoomName() {
    return this.roomName;
  }

  public setRoomName(roomName: string) {
    this.roomNameFlag.next(roomName);
  }

  public setCreatorFlag(value: boolean) {
    this.creatorFlag.next(value)
  }

  public getSelectedFile() {
    return this.selectedFile;
  }

  public setSelectedFile(item) {
    this.selectedFile = item;
  }

  public openModal(): void {
    this._modalOpened.next(true);
  }

  public closeModal(): void {
    this._modalOpened.next(false);
  }

  public openRoomModal(): void {
    this._modalRoomOpened.next(true);
  }

  public closeRoomModal(): void {
    this._modalRoomOpened.next(false);
  }

  public sendEventUploadFile(): void {
    this._eventUploadFile.next(true);
  }

  public getEventUploadFile(): Observable<boolean> {
    return this._eventUploadFile.asObservable();
  }

  public sendStatusActiveDocument(status: string): void {
    this._statusActiveDocument.next(status);
  }

  public getStatusActiveDocument(): Observable<string> {
    return this._statusActiveDocument.asObservable();
  }

}
