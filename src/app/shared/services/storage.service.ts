import { Injectable } from "@angular/core";
import { IsEmptyObject } from "src/app/core/utilities/common.function";

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    public setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    public getItem(key: string): any {
        const value = JSON.parse(localStorage.getItem(key) || '{}')
        return IsEmptyObject(value) ? null : value;
    }

    public removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    public clearStorage(): void {
        localStorage.clear();
    }
}