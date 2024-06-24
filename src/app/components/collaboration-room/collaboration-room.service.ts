import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Room } from "./room.model";
import { environment } from "src/environments/environment";

interface RoomsResponse {
    data: Room[]; // Use a more specific type if possible, e.g., Room[]
}

@Injectable({
    providedIn: 'root'
})
export class CollaborationRoomService {
    private apiUrl: string = environment.apiUrl;

    user: string;
    file: string;

    constructor(private http: HttpClient) { }

    getRunningRooms(fileParam: any): Observable<RoomsResponse> {
        return this.http.get<RoomsResponse>(`${this.apiUrl}/collaboration/get-rooms/${fileParam.id}`);
    }

    saveRunningRoom(roomId: string): Observable<RoomsResponse> {
        return this.http.get<RoomsResponse>(`${this.apiUrl}/collaboration/save-room/${roomId}`);
    }

    updateRunningRoomOnStatus(file: string, status: boolean): Observable<any> { 
        const body = { file, status };
        return this.http.patch<any>(`${this.apiUrl}/update-room`, body);
    }

    updateRunningRoomOnUsers(id: string, users: string[]): Observable<any> {
        const body = { users };
        return this.http.patch<any>(`${this.apiUrl}/update-room/${id}`, body);
    }

    deleteRoom(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/delete-room/${id}`);
    }

    initialize(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/initialize`, null);
    }
}