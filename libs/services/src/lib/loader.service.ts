import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LoaderService {
	public displayLoader = false;
    public logoLoader = false;
    public loaderInfo = '';

    public showLoader(info?: string): void{ 
        this.displayLoader = true;
        if(info) this.loaderInfo = info;
    }

    public showLogoLoader(info?: string): void{
        this.logoLoader = true;
        if(info) this.loaderInfo = info;
        this.showLoader();
    }

    public hideLoader(): void{
        this.displayLoader = false;
        this.logoLoader = false;
        this.loaderInfo = '';
    }
}