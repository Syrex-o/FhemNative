import { Directive, ElementRef, HostListener, Output, EventEmitter, NgZone, OnInit, OnDestroy } from '@angular/core';


@Directive({ selector: '[outside-click]' })
export class OutsideClickDirective implements OnInit, OnDestroy {
	@Output() onOutsideClick = new EventEmitter();

	constructor(private ref: ElementRef, private zone: NgZone){}

 	ngOnInit(){
 		this.zone.runOutsideAngular(()=>{
 			document.addEventListener('mousedown', this.listener);
 			document.addEventListener('touchstart', this.listener);
 		});
 	}

 	private listener = (e)=>{
 		if(!this.ref.nativeElement.contains(e.target)){
	 		this.onOutsideClick.emit(e.target);
	 	}
 	}

 	ngOnDestroy(){
 		this.zone.runOutsideAngular(()=>{
 			document.removeEventListener('mousedown', this.listener);
 			document.removeEventListener('touchstart', this.listener);
 		});
 	}
}