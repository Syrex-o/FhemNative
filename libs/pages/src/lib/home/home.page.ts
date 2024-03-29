import { Component } from '@angular/core';
import { Observable, merge, of, switchMap } from 'rxjs';

import { FhemService, ReleaseInformerService, SettingsService, StructureService } from '@fhem-native/services';

import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-home',
	templateUrl: 'home.page.html',
	styleUrls: ['../pages.style.scss', 'home.page.scss'],
    animations: [ ShowHide ],
    providers: [ ReleaseInformerService ]
})
export class HomePageComponent{
    renderer$: Observable<{showHelper: boolean, loaded: boolean}> = merge(
        of({loaded: false, showHelper: false}),
        this.settings.appDefaultsLoaded.pipe(
            switchMap(loaded=>{
                if(!loaded) return of({loaded: false, showHelper: false});
                // check for valid profile
                if(!this.fhem.checkPreConnect()) return of({loaded: true, showHelper: true});
                // valid config --> navigate to initial room
                this.structure.loadRooms(true).then(()=> this.release.checkInformer() );
                return of({loaded: true, showHelper: false});
            })
        )
    );

    constructor(
        private fhem: FhemService,
        private settings: SettingsService, 
        private structure: StructureService,
        private release: ReleaseInformerService){
    }

    openWeb(): void{
        window.open('https://fhemnative.de', "_blank");
    }
}