import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable, Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { RXCore } from "src/rxcore";
import { RxCoreService } from "./rxcore.service";
import { FileGaleryService } from "../components/file-galery/file-galery.service";

@Injectable({
  providedIn: "root"
})
export class WebsocketService {
  private webSocket: Socket;
  private roomUpdateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;
  numOpenFiles: number = 0;
  roomsList: any = {};
  userId = localStorage.getItem('userId');


  constructor(
    private fileGaleryService: FileGaleryService,
    private readonly rxCoreService: RxCoreService) { }

  connectSocket() {
    console.log("socket: websocket service initialized");
    this.webSocket = new Socket({
      url: environment.wsApiUrl,
      options: {}
    });
  }

  onEvent(event: string): Observable<any> {
    return new Observable<any>(observer => {
      this.webSocket.on(event, (data: any) => observer.next(data));

      return () => this.webSocket.removeListener(event);
    });
  }

  createRoom(item: any, roomName: string) {
    if (!this.webSocket) return;
    this.userId = localStorage.getItem('userId');
    console.log("Room Name: ", roomName)
    this.webSocket.emit("room:create", {item: item, userId: this.userId, roomName: roomName});

    this.roomUpdateSubscription = this.onEvent("room:update").subscribe(payload => {
      console.log("socket: room:update create", Object.keys(this.roomsList).length, payload.roomId);
      if (payload.roomId) {
        this.fileGaleryService.setRoomId(payload.roomId);
        this.fileGaleryService.setRoomName(payload.roomName);
      }
    });

    this.guiMarkupSubscription = this.onEvent("markup:GuiMarkupChanged").subscribe(payload => {
      console.log("socket: markup:GuiMarkupChanged:createInfo", payload);
      const { roomId, data } = payload;
      const { annotation } = data;
      console.log("socket: markup:GuiMarkupChanged:create", { roomId, data });
      const { operation, Entity } = JSON.parse(annotation);
      if (operation.deleted) { 
        console.log("socket: markup:GuiMarkupChanged:deleted", Entity.UniqueID);
        RXCore.deleteMarkupbyGUID(Entity.UniqueID)
      } else {
        RXCore.setUniqueMarkupfromJSON(annotation, null);
      }
    }); 
  }

  joinRoom(item: any, status) {
    if (!this.webSocket) return;
    this.userId = localStorage.getItem('userId');
    let roomId = this.fileGaleryService.getRoomId();
    this.webSocket.emit("room:join", {roomId: roomId, userId: this.userId, status: status});

    this.roomUpdateSubscription = this.onEvent("room:update").subscribe(payload => {
      console.log("socket: room:update join", Object.keys(this.roomsList).length, payload);
      if (payload.roomName) {
        // this.fileGaleryService.setRoomId(payload.roomId);
        this.fileGaleryService.setRoomName(payload.roomName);
      }
    });

    this.guiMarkupSubscription = this.onEvent("markup:GuiMarkupChanged").subscribe(payload => {
      console.log("socket: markup:GuiMarkupChanged:joinInfo", payload);
      const { roomId, data } = payload;
      const { annotation } = data;
      console.log("socket: markup:GuiMarkupChanged:join", { roomId, data });
      const { operation, Entity } = JSON.parse(annotation); 
      if (operation.deleted) { 
        console.log("socket: markup:GuiMarkupChanged:deleted", Entity.UniqueID);
        RXCore.deleteMarkupbyGUID(Entity.UniqueID)
      } else {
        RXCore.setUniqueMarkupfromJSON(annotation, null);
      }
    }); 
  }

  broadcastGuiMarkup(data) {
    if (!this.webSocket) return;
    this.userId = localStorage.getItem('userId');
    let roomId = this.fileGaleryService.getRoomId();
    const file = RXCore.getOpenFilesList().find(file => file.isActive);
    console.log('file', file)
    console.log('this.roomsList', this.roomsList)

    this.webSocket.emit('markup:GuiMarkup', { roomId, data, userId: this.userId });

    // const room_id = Object.keys(this.roomsList).find(file_id => {
    //   let index = this.roomsList[file_id].findIndex(element => element.users.includes(this.userId))
    //   if (index == -1) {
    //     index = this.roomsList[file_id].findIndex(element => element.creatorId === this.userId)
    //   }
    //   console.log('this.roomsList index', index)
    //   console.log('this.roomsList this.userId', this.userId)

    //   return this.roomsList[file_id][index].file.file === file.name
    // });
    // console.log('room_id', room_id)

    // if (room_id) {
    //   const roomInfo = this.roomsList[room_id];
    //   console.log("socket: markup:GuiMarkup", { roomInfo, data })
    //   this.webSocket.emit('markup:GuiMarkup', { roomId, data, userId: this.userId });
    // } else {
    //   console.error('No room associated with the active file.');
    // }
  }

  pingServer(message: string) {
    if (!this.webSocket) return;
    this.webSocket.emit("ping:server", message);
  }

  disconnectSocket() {
    if (this.roomUpdateSubscription) this.roomUpdateSubscription.unsubscribe();
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
    this.webSocket.disconnect();
  }

  ngOnDestroy() {
  }
}
