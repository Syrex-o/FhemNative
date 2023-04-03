import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { ComponentLoaderService, SettingsService, StructureService } from '@fhem-native/services';

import { RoomParams } from '@fhem-native/types/room';
import { SandboxStorageService } from './sandbox-storage.service';

@Injectable({providedIn: 'root'})
export class SandboxStructureService extends StructureService {

    constructor(
        override route: ActivatedRoute,
		override storage: SandboxStorageService, 
		override settings: SettingsService,
		override navCtrl: NavController,
		override compLoader: ComponentLoaderService){
        super(route, storage, settings, navCtrl, compLoader);
    }

    override navigateToRoom(roomUID: string, params?: RoomParams, backwards?: boolean) {
		if(!this.currentRoom || this.currentRoom.UID !== roomUID || !this.route.snapshot.queryParams['UID']){
            const navigateTo = ['sandbox', 'room', roomUID];
            const navigateptions = { relativeTo: this.route, replaceUrl: true, queryParams: params };

			return backwards ? 
				this.navCtrl.navigateBack(navigateTo, navigateptions) : 
				this.navCtrl.navigateForward(navigateTo, navigateptions);
		}
		return null;
    }
}