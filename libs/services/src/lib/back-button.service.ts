import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Injectable({providedIn: 'root'})
export class BackButtonService {
	private subs: Array<{ priority: number, handleID: string, callback: any, sub?: Subscription }> = [];

	constructor(private platform: Platform){}

	public handle(handleID: string, callback: any): void{
		// determine priority
		const priority = this.subs.length > 0 ? this.subs.length + 1 : 1;
		// Add to stack
		this.subs.push({priority: priority, handleID: handleID, callback: callback});
		// Assing Native Back button event
		this.subs[this.subs.length - 1]['sub'] = this.platform.backButton.subscribeWithPriority(priority, () => {
			this.subs[this.subs.length - 1].callback();
		});
	}

	// remove a handle
	public removeHandle(handleID: string): void{
		const index: number = this.subs.findIndex(x => x.handleID === handleID);
		if(index > -1){
			const sub: Subscription|undefined = this.subs[index].sub;
			if(sub){
				// remove listener
				sub.unsubscribe();
			}
			// remove sub from stack
			this.subs.splice(index, 1);
		}
	}
}