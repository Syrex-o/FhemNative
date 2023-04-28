import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { parse } from 'yaml';

import { catchError, map, Observable, of } from 'rxjs';
import { SettingsService } from '@fhem-native/services';

@Injectable()
export class GuideService {
    constructor(private http: HttpClient, private settings: SettingsService){}

    public getGuide(docRef: string): Observable<any>{
        return this.getJSON(`/assets/i18n/${this.settings.app.language}/guides/${docRef}.yaml`);
    }

    private getJSON(path: string): Observable<any>{
		return this.http.get(path, {
            observe: 'body',
            responseType: 'text'
        }).pipe(
            map(x=> parse(x)),
            catchError(()=> of(false))
        )
	}
}