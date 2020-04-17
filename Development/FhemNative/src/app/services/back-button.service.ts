import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

// Hotkeys
import { HotKeyService } from './hotkey.service';

@Injectable({
	providedIn: 'root'
})

export class BackButtonService {
	private subs: Array<{ priority: number, handleID: string, callback: any, sub?: Subscription }> = [];

	constructor(
		private hotkey: HotKeyService,
		private platform: Platform){}

	public handle(handleID: string, callback: any){
		// determine priority
		const priority = this.subs.length > 0 ? this.subs.length + 1 : 1;
		// Add to stack
		this.subs.push({priority: priority, handleID: handleID, callback: callback});
		// assign back button ESC event
		this.hotkey.add(handleID, 'esc', (ID: string)=>{
			if(this.subs[this.subs.length - 1].handleID === ID){
				this.subs[this.subs.length - 1].callback();
			}
		});
		// Assing Native Back button event
		this.subs[this.subs.length - 1]['sub'] = this.platform.backButton.subscribeWithPriority(priority, () => {
			this.subs[this.subs.length - 1].callback();
		});
	}

	// remove a handle
	public removeHandle(handleID: string){
		const index = this.subs.findIndex(x => x.handleID === handleID);
		if(index > -1){
			// remove listener
			this.subs[index].sub.unsubscribe();
			// remove sub from stack
			this.subs.splice(index, 1);
			// remove esc handle
			this.hotkey.remove(handleID);
		}
	}
}