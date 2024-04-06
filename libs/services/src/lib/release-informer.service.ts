import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from './storage.service';

import { APP_CONFIG, ReleaseNotes } from '@fhem-native/app-config';
import { getRawVersionCode, getTranslatedVersionCode, versionCodeToVersion } from '@fhem-native/utils';
import { FhemService } from './fhem.service';

export type NoteItemType = 'New'|'Fix'|'Note';

export interface ReleaseNoteItem {
	type: NoteItemType,
	text: string
}

@Injectable({providedIn: 'root'})
export class ReleaseInformerService {
	private router = inject(Router);
	private fhem = inject(FhemService);
	private storage = inject(StorageService);
	private appSettings = inject(APP_CONFIG);

	public getReleaseNotes(){ return ReleaseNotes; }

	public async checkInformer(){
		// prevent release note navigation, when no profile is present
		if(!this.fhem.checkPreConnect()) return false;

		const lastInformedAt: string|null = await this.storage.getSetting('informedVersion');
		if(!lastInformedAt){
			// set initial version inform trigger
			this.storage.changeSetting({name: 'informedVersion', change: getRawVersionCode(this.appSettings.versionCode)});
			await this.router.navigate(['/', 'release-notes']);
			return true;
		}

		const informedAtVersion = getTranslatedVersionCode(versionCodeToVersion(lastInformedAt || '0.0.0'));
		const compareWithVersion = getTranslatedVersionCode(this.appSettings.versionCode);
		if(compareWithVersion > informedAtVersion){
			// update version inform trigger
			this.storage.changeSetting({name: 'informedVersion', change: getRawVersionCode(this.appSettings.versionCode)});
			await this.router.navigate(['/', 'release-notes']);
			return true;

		}
		return false;
	}
}