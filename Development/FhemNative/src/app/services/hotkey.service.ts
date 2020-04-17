import { Injectable } from '@angular/core';

// Angular 2 hotkey service
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

@Injectable({
	providedIn: 'root'
})

export class HotKeyService {
	// list of hotkey combinations and unique handles
	private hotkeys: Array<{handleID: string, combination: string, callback: any, action: any}> = [];
	// list of unique hotkey handles
	private handles: Array<{combination: string, handle: any}> = [];

	constructor(private hotkeysService: HotkeysService){}

	// add a hotkey (Exp. 'meta+shift+g')
	// action as keyup/keydown
	public add(handleID:string, combination:string, callback:any, action?: string){
		// detect if combination already exists + ID 
		if(!this.hotkeys.find(x => x.combination === combination && x.handleID === handleID)){
			// register a new hotkey
			this.handles.push({
				combination: combination,
				handle: this.hotkeysService.add(new Hotkey(combination, (event: KeyboardEvent): boolean =>{
					this.makeCallback(combination, event);
					return false;
				}), action)
			});
		}
		this.hotkeys.push({handleID: handleID, combination: combination, callback: callback, action: action});
	}

	private makeCallback(combination: string, e?: KeyboardEvent){
		const callbackItems = this.hotkeys.filter(x => x.combination === combination && x.callback);

		callbackItems.forEach((item)=>{
			if(item.action){
				if(e.type === item.action){
					item.callback(item.handleID, e);
				}
			}else{
				item.callback(item.handleID, e);
			}
		});
	}

	// remove hotkey 
	public remove(handleID: string){
		const index = this.hotkeys.findIndex(x=> x.handleID === handleID);
		if(index > -1){
			this.hotkeys.splice(index, 1);
		}
		// check if handle is needed anymore
		this.handles.forEach((handle)=>{
			if(!this.hotkeys.find(x => x.combination === handle.combination)){
				this.hotkeysService.remove(handle.handle);
			}
		});
	}
}