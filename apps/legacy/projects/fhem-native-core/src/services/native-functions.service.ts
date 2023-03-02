import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { SettingsService } from './settings.service';

@Injectable({providedIn: 'root'})
export class NativeFunctionsService {
	// use functions from different location --> App defines functions
	public vibrationHandler: any;
	public audioHandler: any;

	constructor(private settings: SettingsService){}

	// native event trigger
	public nativeClickTrigger(): void{
		if(this.settings.operatingPlatform === 'mobile'){
			if(this.settings.app.hapticFeedback.enable){
				this.vibrate(this.settings.app.hapticFeedback.duration * 1000);
			}
			if(this.settings.app.acusticFeedback.enable){
				this.playAudio(this.settings.app.acusticFeedback.audio);
			}
		}
	}

	// vibration
	public vibrate(dur: number): void{
		if(this.vibrationHandler){
			this.vibrationHandler(dur);
		}
	}

	// play sound
	public playAudio(id: string): void{
		if(this.audioHandler){
			this.audioHandler(id);
		}
	}
}
