import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { SettingsService } from '@fhem-native/services';
import { LangOptions } from '@fhem-native/app-config';

@Injectable({providedIn: 'root'})
export class WebsettingsService {
    // language load indication
	private languageLoader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
		private http: HttpClient,
        private settings: SettingsService,
		private translate: TranslateService){
    }

    public getLanguageLoader(): Observable<boolean> {
        return this.languageLoader;
    }

    public initializeWebApp(){
        // load web translation files
		this.loadTranslations();
    }

    private loadTranslations(): void{
        this.translate.setDefaultLang(this.settings.app.language);

        let langLoad: Subscription = new Subscription();

        langLoad = this.translate.use(this.settings.app.language).subscribe(()=>{
            LangOptions.forEach((lang: string, i: number)=>{
                let langGet: Subscription = new Subscription();

                langGet = this.http.get('./assets/i18n/web/'+ lang +'.json').subscribe({
                    next: (data)=>{
                        langGet.unsubscribe();
                        // merge translations
                        this.translate.setTranslation(lang, data, true);
                        // call once at end
                        if(i === LangOptions.length -1){
                            this.languageLoader.next(true);
                            langLoad.unsubscribe();
                        }
                    },
                    error(err) {
                        console.log(err);
                    },
                });
            })
        });
    }
}