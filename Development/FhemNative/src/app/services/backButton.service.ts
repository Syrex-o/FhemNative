import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})

export class BackButtonService {
	private subs: Array<any> = [];
	constructor(private platform: Platform) {}

	public handle(prio) {
		return new Promise((resolve) => {
			// set prio higher in stack if needed
			const priority = ( this.subs[this.subs.length - 1] ?
				( this.subs[this.subs.length - 1].prio.orginal === prio ? prio + 1 : prio )
			: prio );
			const sub = this.platform.backButton.subscribeWithPriority(priority, () => {
				resolve();
			});
			this.subs.push({
				ID: this.subs.length,
				prio: {
					orginal: prio,
					modified: priority
				},
				sub
			});
		});
	}

	public removeHandle(prio) {
		if (this.subs[this.subs.length - 1] && this.subs[this.subs.length - 1].prio.orginal === prio) {
			this.subs[this.subs.length - 1].sub.unsubscribe();
			this.subs.pop();
		}
	}
}
