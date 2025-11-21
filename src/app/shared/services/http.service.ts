import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})

export class HttpService {

    public API_URL: string = ''; 

    constructor(
        private _http: HttpClient
    ) {
        
     }

    get(
        url: string, params?: any,withCredentials:boolean=false
    ): Observable<any> {
        return this._http.get(this.API_URL + url, { params,withCredentials:withCredentials });
    }

    post(
        url: string, params?: any
    ): Observable<any> {
        return this._http.post(this.API_URL + url, params);
    }

    put(
        url: string, params?: any
    ): Observable<any> {
        return this._http.put(this.API_URL + url, params);
    }

    delete(
        url: string, params?: any
    ): Observable<any> {
        return this._http.delete(this.API_URL + url, params);
    }

    patch(
        url: string, params?: any
    ): Observable<any> {
        return this._http.patch(this.API_URL + url, params);
    }

}