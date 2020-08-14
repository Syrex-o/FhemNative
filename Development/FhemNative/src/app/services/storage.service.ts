import { Injectable } from '@angular/core';

// Ionic and Electron Storage
import { Storage } from '@ionic/storage';

// Interfaces
interface Setting {
	name: string,
	default?: any,
	change?: any
}

@Injectable({
	providedIn: 'root'
})

export class StorageService {

	constructor(private storage: Storage) {}

	// used to get setting or to define a default setting
	// needs object of {name: '', default: ''}
	public setAndGetSetting(obj: Setting ): Promise<any> {
		return new Promise((resolve) => {
			this.storage.get(obj.name).then((value:any) => {
				if(value === null){
					// setting is not defined jet
					// setting gets defined and default is resolved after saving
					this.storage.set(obj.name, obj.default).then(() => {
						resolve(this.testJSON(obj.default) ? JSON.parse(obj.default) : obj.default);
					});
				}else{
					// setting is present and has a value
					resolve(this.testJSON(value) ? JSON.parse(value) : value);
				}
			});
		});
	}

	// used to update setting
	// needs object of {name: '', change: ''}
	public changeSetting(obj: Setting): Promise<any> {
		return new Promise((resolve) => {
			this.storage.set(obj.name, obj.change).then(() => {
				resolve(this.testJSON(obj.change) ? JSON.parse(obj.change) : obj.change);
			});
		});
	}

	// used to get a desired settings value
	// returnes null if undefined
	// needs name
	public getSetting(name: string): Promise<any> {
		return new Promise((resolve) => {
			this.storage.get(name).then((value) => {
				resolve(this.testJSON(value) ? JSON.parse(value) : value);
			});
		});
	}

	// get all settings
	public getAllSettings(): Promise<any>{
		return new Promise((resolve) => {
			const res = {};
			this.storage.keys().then((keys) => {
				for (let i = 0; i < keys.length; i++) {
					this.getSetting(keys[i]).then((result) => {
						if(keys[i] !== 'undefined'){
							res[keys[i]] = JSON.stringify(result);
						}
						if (i === keys.length - 1) {
							resolve(res);
						}
					});
				}
			});
		});
	}

	// test for json
	private testJSON(str): boolean{
		try { JSON.parse(str); } catch (e) { return false; }
		return true;
	}
}