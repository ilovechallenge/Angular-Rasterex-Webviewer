import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, throwError } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    private apiUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getData(subURL: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${subURL}`)
            .pipe(
                catchError(error => {
                    console.error("An error occurred on getting data: ", error);
                    return throwError(() => error);
                })
            )
    }

    postData(subURL: string, body: any): Observable<any> {
        console.log("Post Action Body: ", body);
        return this.http.post<any>(`${this.apiUrl}/${subURL}`, body)
            .pipe(
                catchError(error => {
                    console.error('An error occurred on posting data: ', error);
                    return throwError(() => error);
                })
            )
    }
}