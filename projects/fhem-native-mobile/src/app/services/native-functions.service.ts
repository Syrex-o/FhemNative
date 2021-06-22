import { Injectable } from '@angular/core';

// Plugins
import { Haptics } from '@capacitor/haptics';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

// Services
import { SettingsService } from '@FhemNative/services/settings.service';
import { NativeFunctionsService } from '@FhemNative/services/native-functions.service';

@Injectable({providedIn: 'root'})
export class NativeFunctionsChildService {

	constructor(private settings: SettingsService, private native: NativeFunctionsService, private audio: NativeAudio){
		// initialize native functions
		// preload audio
		this.preloadAudio();
		// assign audio handler
		this.native.audioHandler = this.playAudio;
		// assign vibration handler
		this.native.vibrationHandler = this.vibrate;
	}

	private preloadAudio(): void{
		const sounds: string[] = ['1', '2', '3', '4'];
		sounds.forEach((sound: string)=>{
			sounds.forEach((sound)=>{
				this.audio.preloadSimple(sound, 'assets/sounds/'+sound+'.mp3');
			});
		});
	}

	private playAudio(id: string): void{
		this.audio.play(id);
	}

	private async vibrate(dur: number): Promise<void>{
		await Haptics.vibrate({ duration: dur });
	}
}