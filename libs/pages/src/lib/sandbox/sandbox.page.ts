import { Component, OnDestroy, OnInit } from '@angular/core';

import { UntilDestroy } from '@ngneat/until-destroy';

import { FhemService, SettingsService, StructureService } from '@fhem-native/services';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
	selector: 'fhem-native-sandbox',
	templateUrl: 'sandbox.page.html',
	styleUrls: ['../pages.style.scss', 'sandbox.page.scss']
})
export class SandboxPageComponent implements OnInit, OnDestroy{
    demoDeviceState = false;

    constructor(
        private router: Router, 
        public fhem: FhemService, 
        private structure: StructureService,
        private settings: SettingsService){
    }

    ngOnInit(): void {
        this.settings.demoMode.next(true);
    }

    leaveSandbox(): void{
        this.structure.rooms = [];
        this.router.navigate([''], {replaceUrl: true});
        this.settings.demoMode.next(false);
    }

    ngOnDestroy(): void {
        this.structure.rooms = [];
    }
}