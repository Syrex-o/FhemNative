import { Injectable, Inject } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { DOCUMENT } from "@angular/common";

type Options = {
  	element: any;
  	description: string | undefined;
  	keys: string;
}

@Injectable({
	providedIn: 'root'
})

// USED IN GRID
// To ensure availability of shortcuts only in edit mode
export class ShortcutService {
	hotkeys = new Map();
	defaults: Partial<Options> = {
		element: this.document
	}
	constructor(
		private eventManager: EventManager,
    	@Inject(DOCUMENT) private document: Document) {
	}

    // add a shortcut
	public addShortcut(options: Partial<Options>, keyup: Partial<boolean>){
		const merged = { ...this.defaults, ...options };
    	const downEvent = `keydown.${merged.keys}`;
    	const upEvent = `keyup.${merged.keys}`;

    	merged.description && this.hotkeys.set(merged.keys, merged.description);

    	return new Observable(observer => {
      		const handler = (e) => {
        		e.preventDefault()
        		observer.next(e);
      		};

      		let disposeUp: any;

      		const disposeDown = this.eventManager.addEventListener(merged.element, downEvent, handler);
      		// get keyup Event if needed
      		if(keyup){
      			disposeUp = this.eventManager.addEventListener(merged.element, upEvent, handler);
      		}


      		return () => {
        		disposeDown();
        		
        		if(keyup){
        			disposeUp();
        		}
        		this.hotkeys.delete(merged.keys);
      		};
    	});
	}
}
