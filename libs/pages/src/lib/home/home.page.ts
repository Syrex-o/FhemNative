import { Component, OnDestroy, OnInit } from '@angular/core';

import { SettingsService, StructureService } from '@fhem-native/services';
import { Subscription } from 'rxjs';

import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-home',
	templateUrl: 'home.page.html',
	styleUrls: ['../pages.style.scss', 'home.page.scss'],
    animations: [ ShowHide ]
})
export class HomePageComponent implements OnInit, OnDestroy{
    settingsSub!: Subscription;
    showHelper = false;

    constructor(
        public settings: SettingsService,
        private structure: StructureService){

    }

    ngOnInit(): void{
        this.checkConfig();
    }

    private checkConfig(): void{
        // needed on initial start --> settings are not assigned, when app is first time initialized
        this.settingsSub = this.settings.appDefaultsLoaded.subscribe((loaded: boolean)=>{
            if(loaded){
                if(this.settings.connectionProfiles.length > 0 && this.settings.connectionProfiles[0].IP !== ''){
                    // valid config --> navigate to initial room
                    this.structure.loadRooms(true);
                }else{
                    // no config created --> show message
                    this.showHelper = true;
                }
            }
        });
    }

    openWeb(): void{
        window.open('https://fhemnative.de', "_blank");
    }

    triggerDemoMode(): void{
        console.log('demo mode');
    }

    ngOnDestroy(): void {
        if(this.settingsSub) this.settingsSub.unsubscribe();
    }
}