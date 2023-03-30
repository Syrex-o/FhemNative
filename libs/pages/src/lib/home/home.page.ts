import { Component } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { FhemService, SettingsService, StructureService, ToastService } from '@fhem-native/services';

import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-home',
	templateUrl: 'home.page.html',
	styleUrls: ['../pages.style.scss', 'home.page.scss'],
    animations: [ ShowHide ]
})
export class HomePageComponent{
    renderer$: Observable<{showHelper: boolean, loaded: boolean}> = this.settings.appDefaultsLoaded.pipe(
        switchMap(loaded=>{
            if(!loaded) return of({loaded: false, showHelper: false});
            // check for valid profile
            if(!this.fhem.checkPreConnect()) return of({loaded: true, showHelper: true});
            // valid config --> navigate to initial room
            this.structure.loadRooms(true);
            return of({loaded: true, showHelper: false});
        })
    );

    constructor(
        private fhem: FhemService,
        private toast: ToastService,
        private settings: SettingsService,
        private structure: StructureService){
    }

    openWeb(): void{
        // window.open('https://fhemnative.de', "_blank");
        this.toast.showAlert('Sorry', 'We are working hard on this part.', false);
    }
}