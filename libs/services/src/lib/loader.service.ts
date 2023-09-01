import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, share } from 'rxjs';

interface Loader {
    show: boolean,
    logoLoader: boolean,
    loaderInfo: string
}

@Injectable({providedIn: 'root'})
export class LoaderService {
    private loader = new BehaviorSubject<Loader>({show: false, logoLoader: false, loaderInfo: ''});
    
    public loader$ = this.loader.pipe( distinctUntilChanged() );
    public loaderState = this.loader$.pipe( map(x=> x.show), share() );

    public showLoader(logoLoader?: boolean, info?: string): void{
        this.loader.next({
            show: true,
            logoLoader: logoLoader || false,
            loaderInfo: info || ''
        });
    }

    public showLogoLoader(info?: string): void{
        this.showLoader(true, info);
    }

    public hideLoader(): void{
        this.loader.next({
            show: false,
            logoLoader: false,
            loaderInfo: ''
        });
    }
}