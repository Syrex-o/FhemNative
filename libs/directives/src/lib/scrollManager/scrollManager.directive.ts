import { Directive, Input, Inject, AfterViewInit } from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';

import { Clipboard } from '@angular/cdk/clipboard';

import { ScrollSectionDirective } from './scrollSection.directive';

import { ToastService } from '@fhem-native/services';

@Directive({ selector: '[fhemNativeScrollManager]' })
export class ScrollManagerDirective implements AfterViewInit{
	@Input() createAnchorUrl = false;
	@Input() scrollDelta = '0px';

	private sections = new Map<string | number, ScrollSectionDirective>();

	constructor(
		@Inject(DOCUMENT) private document: Document,
		private clipboard: Clipboard,
		private toast: ToastService,
		private location: Location, 
		private router: Router){
	}

	// check initial route for scroll
	ngAfterViewInit(): void {
		// get fragment
		const fragment = this.router.url.match(/(?<=#).*$/);
		if(fragment) this.scroll(fragment[0], false, true);
	}

	scroll(id: string | number, createAnchorUrl?: boolean, blockClipboard?: boolean) {
		// first copy --> copying is blocking scroll
		if((!blockClipboard && (this.createAnchorUrl || createAnchorUrl)) && this.sections.get(id)) this.copyToClipboard(id);
		this.sections.get(id)?.scroll();
	}
	
	register(section: ScrollSectionDirective) {
		this.sections.set(section.id, section);
		// scroll delta
		if(this.scrollDelta || section.scrollDelta) section.host.nativeElement.style.scrollMarginTop = section.scrollDelta || this.scrollDelta;
	}
	
	remove(section: ScrollSectionDirective) {
		this.sections.delete(section.id);
	}

	private copyToClipboard(anchorID: string | number): void{
		const relevantUrl = this.router.url.match(/[^#]*/);
		if(relevantUrl){
			const urlReference = relevantUrl + '#' + anchorID;
			const anchorReference = this.document.location.origin + urlReference;
			// change url
			this.location.replaceState(urlReference);
			// copy to clipboard
			this.clipboard.copy(anchorReference);
			// toast message
			this.toast.addToast('Copied', 'Copied link to clipboard!', 'info', 2000);
		}
	}
}