import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Room } from "./room.model";
import { CollaborationRoomService } from "./collaboration-room.service";
import { FileGaleryService } from "../file-galery/file-galery.service";
import { WebsocketService } from "src/app/services/websocket.service";

@Component({
    selector: 'app-collaboration-room',
    templateUrl: './collaboration-room.component.html',
    styleUrls: ['./collaboration-room.component.scss']
})
export class CollaborationRoomComponent implements OnInit {
    @Output() onCreateRoom = new EventEmitter<any>();
    @Output() onJoinRoom = new EventEmitter<any>();
    @Output() dataLoaded = new EventEmitter<boolean>();
    
    isLoading: boolean = false;
    showCreateOption: boolean = false;
    showJoinOptions: boolean = false;
    showSavedRooms: boolean = false;
    roomName: string = "";
    runningRooms: Room[] = [];
    savedRooms: Room[] = [];

    constructor(
        private roomService: CollaborationRoomService, 
        private fileGalleryService: FileGaleryService,
    ) { }

    ngOnInit(): void {
        this.fetchRunningRooms();
    }

    private fetchRunningRooms() {
        this.isLoading = true;
        this.roomService.getRunningRooms(this.fileGalleryService.getSelectedFile()).subscribe(
            (rooms) => {
                console.log("Getting Rooms", rooms)
                this.runningRooms = rooms.data.filter(room => room.status === true)
                this.savedRooms = rooms.data.filter(room => room.status === false)
                
                this.isLoading = false;
            },
            (error) => {
                console.error("Error fetching running rooms:", error);
                this.isLoading = false;
            }
        )
    }

    toggleCreateRoom() {
        this.showCreateOption = !this.showCreateOption;
        this.showSavedRooms = false;
        this.showJoinOptions = false;
    }

    toggleJoinOptions() {
        this.showJoinOptions = !this.showJoinOptions;
        this.showSavedRooms = false;
    }

    toggleSavedRooms() {
        this.showSavedRooms = !this.showSavedRooms;
        this.showJoinOptions = false;
    }

    createRoom() {
        console.log('Room name:', this.roomName);
        if (this.roomName == null || this.roomName == "" || this.roomName == undefined) {
            alert("insert room name")
            return;
        }
        this.handleCloseRoomModal();
        this.fileGalleryService.setCreatorFlag(true);
        this.onCreateRoom.emit(this.roomName);
    }

    joinRunningRoom(creatorId) {
        this.handleCloseRoomModal();
        this.onJoinRoom.emit(true);
    }
    joinSavedRoom(room: Room) {
        this.handleCloseRoomModal();
        this.onJoinRoom.emit(false);
    }

    handleCloseRoomModal() {
        this.fileGalleryService.closeRoomModal();
    }
}