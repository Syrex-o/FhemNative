import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

import { Vibration } from '@ionic-native/vibration/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

import { SettingsService } from './settings.service';

@Injectable({
	providedIn: 'root'
})

export class NativeFunctionsService {
	constructor(
		private platform: Platform,
		private settings: SettingsService,
		private vibration: Vibration,
		private audio: NativeAudio) {

		// load sounds
		this.platform.ready().then(()=>{
			if(this.platform.is('android') || this.platform.is('ios')){
				const sounds: Array<string> = ['1', '2', '3', '4'];
				sounds.forEach((sound)=>{
					this.audio.preloadSimple(sound, 'assets/sounds/'+sound+'.mp3');
				});
			}
		});
	}

	// native event trigger
	public nativeClickTrigger(): void{
		if(this.platform.is('android') || this.platform.is('ios')){
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
		this.vibration.vibrate(dur);
	}

	// play sound
	public playAudio(id: string): void{
		this.audio.play(id);
	}
}
