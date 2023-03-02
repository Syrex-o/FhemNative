import { Injectable } from '@angular/core';

// Services
import { ElectronService } from './electron.service';
import { SettingsService } from '@FhemNative/services/settings.service';

@Injectable({providedIn: 'root'})
export class SettingsChildService {

	constructor(private settings: SettingsService, private electron: ElectronService){}

	public scaleWindow(): void{
		const ipc = this.electron.ipcRenderer;
		const dim = this.settings.app.customWindowScale.dimensions;
		if(ipc && dim.width > 0 && dim.height > 0){
			// change dimensions
			ipc.send('resize-window', dim);
		}
	}
}