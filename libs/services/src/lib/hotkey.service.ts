import { Inject, Injectable } from "@angular/core";

import { HotkeysService, Hotkey, ExtendedKeyboardEvent } from 'angular2-hotkeys';
import { APP_CONFIG } from '@fhem-native/app-config';

@Injectable({providedIn: "root"})
export class HotKeyService {
	// list of hotkey combinations and unique handles
	private hotkeys: Array<{handleID: string, combination: string, callback: any, action: any}> = [];
	// list of unique hotkey handles
	private handles: Array<{combination: string, handle: any}> = [];

	constructor(private hotkeysService: HotkeysService, @Inject(APP_CONFIG) private appConfig: any){}

	/**
	 * Subscribe 
	 * @param handleId UID for handling
	 * @param combination key combination
	 * @param callback callback function
	 * @param info information about hotkeys
	 * @param onAction keyup/keydown if needed
	 */
	public add(handleId: string, combination: string, callback: ()=> void, info?: string, onAction?: string): void{
		if(this.appConfig.platform !== 'desktop') return;

		// detect if combination already exists + ID 
		if(!this.hotkeys.find(x => x.combination === combination && x.handleID === handleId)){
			// register a new hotkey
			this.handles.push({
				combination: combination,
				handle: this.hotkeysService.add(new Hotkey(combination, (event: ExtendedKeyboardEvent): ExtendedKeyboardEvent => {
					this.makeCallback(combination, event);

					event.returnValue = false;
					return event;
				}, undefined, info), onAction)
			});
		}
		this.hotkeys.push({handleID: handleId, combination: combination, callback: callback, action: onAction});
	}

	private makeCallback(combination: string, e?: ExtendedKeyboardEvent): void{
		const callbackItems = this.hotkeys.filter(x => x.combination === combination && x.callback);

		callbackItems.forEach((item)=>{
			if(item.action){
				if(e && e.type === item.action) item.callback(item.handleID, e);
			}else{
				item.callback(item.handleID, e);
			}
		});
	}

	public remove(handleID: string): void{
		const index = this.hotkeys.findIndex(x=> x.handleID === handleID);
		if(index > -1) this.hotkeys.splice(index, 1);
		// check if handle is needed anymore
		this.handles.forEach((handle)=>{
			if(!this.hotkeys.find(x => x.combination === handle.combination)){
				this.hotkeysService.remove(handle.handle);
			}
		});
	}
}