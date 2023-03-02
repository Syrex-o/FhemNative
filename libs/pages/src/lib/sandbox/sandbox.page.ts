import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SettingsService, StorageService, StructureService } from '@fhem-native/services';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
	selector: 'fhem-native-sandbox',
	templateUrl: 'sandbox.page.html',
	styleUrls: ['../pages.style.scss', 'sandbox.page.scss']
})
export class SandboxPageComponent {
    constructor(
        private storage: StorageService,
        private settings: SettingsService,

        private router: Router,
        private route: ActivatedRoute,
        private structure: StructureService){
        route.queryParams.pipe(untilDestroyed(this)).subscribe(() => this.handleSandboxRoutes() );
    }

    private handleSandboxRoutes(): void{
        this.router.navigate( ['room', this.structure.rooms[0].UID], { 
            relativeTo: this.route, replaceUrl: true, queryParams: 
                { name: this.structure.rooms[0].name, UID: this.structure.rooms[0].UID } 
            }
        );
    }
}