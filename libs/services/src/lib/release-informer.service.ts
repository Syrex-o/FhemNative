import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from './storage.service';

import { APP_CONFIG } from '@fhem-native/app-config';
import { getRawVersionCode, getTranslatedVersionCode, versionCodeToVersion } from '@fhem-native/utils';

export type NoteItemType = 'New'|'Fix'|'Note';

export interface ReleaseNoteItem {
	type: NoteItemType,
	text: string
}

@Injectable({providedIn: 'root'})
export class ReleaseInformerService {
	private router = inject(Router);
	private storage = inject(StorageService);
	private appSettings = inject(APP_CONFIG);

	/**
	 * List of Release notes for current release
	*/
	private releaseNotes: ReleaseNoteItem[] = [
		{type: 'New', text: 'Release Notes page'},
		{type: 'New', text: 'Label component vertical position option in settings'},
		{type: 'Fix', text: 'Label component vertical position'},
		{type: 'Fix', text: 'Scrolling when components are moved outside of view, while editing'},
		{type: 'Fix', text: 'Component creation blocked during editing'},
	];

	public getReleaseNotes(){ return this.releaseNotes; }

	public async checkInformer(){
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