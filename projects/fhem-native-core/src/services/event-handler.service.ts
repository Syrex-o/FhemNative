import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class EventHandlerService {
	private subs: Array<{handleID: string, elem: HTMLElement, ev: (e: MouseEvent|TouchEvent)=> void}> = [];

	public handle(handleID: string, elem: HTMLElement, onStart: (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) => void, allowSvg?: boolean): void{
		// prevent bubbling
		let bubbleTime: number = 0;
		// start handle
		const startMove = (e: any): void =>{
			const target: any = e.target;
			if(target && target.className && (allowSvg || Object.prototype.toString.call(target.className) !== '[object SVGAnimatedString]') ){
				const startTime: number = new Date().getTime();
				if(Math.abs(startTime - bubbleTime) > 100){
					// get starting mouse pos
					const startMouse: {x: number, y: number} = {
						x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
						y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
					};
					// callback
					onStart(startTime, startMouse, e, target);
				}
				bubbleTime = startTime;
			}
		}
		// start listeners
		elem.addEventListener('touchstart', startMove, {passive: true});
		elem.addEventListener('mousedown', startMove, {passive: true});

		// add to stack
		this.subs.push({handleID: handleID, elem: elem, ev: startMove});
	}

	// remove a handle
	public removeHandle(handleID: string): void{
		const index: number = this.subs.findIndex(x => x.handleID === handleID);
		if(index > -1){
			// remove listener
			this.subs[index].elem.removeEventListener('touchstart', this.subs[index].ev);
			this.subs[index].elem.removeEventListener('mousedown', this.subs[index].ev);
			// remove sub from stack
			this.subs.splice(index, 1);
		}
	}
}