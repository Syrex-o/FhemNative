import { Injectable } from '@angular/core';

// Plugins
import { Haptics } from '@capacitor/haptics';
import { NativeAudio } from '@capacitor-community/native-audio';
// import { NativeAudio } from '@ionic-native/native-audio/ngx';

// Services
import { SettingsService } from '@FhemNative/services/settings.service';
import { NativeFunctionsService } from '@FhemNative/services/native-functions.service';

@Injectable({providedIn: 'root'})
export class NativeFunctionsChildService {
	constructor(private settings: SettingsService, private native: NativeFunctionsService){
		// assign audio handler
		this.native.audioHandler = this.playAudio;
		// assign vibration handler
		this.native.vibrationHandler = this.vibrate;
	}

	// preload only if setting is active
	public preloadAudio(): void{
		if(this.settings.app.acusticFeedback.enable){
			const sounds: string[] = ['1', '2', '3', '4'];
			sounds.forEach((sound: string)=>{
				// catch to prevent error message 
				NativeAudio.preload({ assetId: sound, assetPath: sound+'.mp3' }).catch(e=>{})
			});
		}
	}

	private playAudio(id: string): void{
		NativeAudio.play({assetId: id, time: 0.0});
	}

	private async vibrate(dur: number): Promise<void>{
		await Haptics.vibrate({ duration: dur });
	}
}