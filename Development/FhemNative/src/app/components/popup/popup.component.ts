import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Services
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';

// Animation
import { PopupPicker } from '../../animations/animations';
import { PopupContent } from '../../animations/animations';

@Component({
	selector: 'popup',
	templateUrl: './popup.component.html',
  	styleUrls: ['./popup.component.scss'],
  	animations: [
  		PopupPicker,
  		PopupContent
  	],
  	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: PopupComponent, multi: true}]
})

export class PopupComponent implements OnChanges {
	// params for popup
	@Input() width: string|number = 80;
	@Input() height: string|number = 80;

	// Popup Config
	// Backdrop
	@Input() backdropDismiss: boolean = true;
	// Close Button
	@Input() closeButtonDismiss: boolean = true;
	@Input() showCloseButton: boolean = true;

	// choose animation style of the popup
	// (scale, from-top, from-bottom, from-left, from-right, jump-in, flip-in-x, flip-in-y, scale-x, scale-y)
	@Input() animation: string = 'scale';
	// invert the out animation
	@Input() invertAnimation: boolean = false;
	// animation for the menu -> used to not modify the input
	toggleAnimation: string;

	// Events
	@Output() onOpen: EventEmitter<any>  = new EventEmitter();
    @Output() onClose: EventEmitter<any>  = new EventEmitter();

	// Value handler
	showPopup: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.showPopup); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	// Back button handle ID
	private handleID: string = '_' + Math.random().toString(36).substr(2, 9);

	writeValue(value) {
		const previousState = this.showPopup;
		this.showPopup = value;
		this.toggleAnimation = this.invertAnimation ? this.animation + '-invert' : this.animation;
		if(value){
			this.onOpen.emit();
			this.updateChanges();
			this.assignBackHandle();
		}
		// change in model
		if(previousState && !this.showPopup){
			this.closePopup(this.backdropDismiss || this.closeButtonDismiss);
		}
	}

	ngOnChanges(changes: SimpleChanges){
		// check for changes in dismiss properties
		if(this.showPopup && (changes.backdropDismiss || changes.closeButtonDismiss)){
			this.assignBackHandle();
		}
	}

	private assignBackHandle(){
		// handle back Button
		this.backBtn.removeHandle(this.handleID);
		// only when backdrop or close is enabled
		if(this.backdropDismiss || this.closeButtonDismiss){
			this.backBtn.handle(this.handleID, ()=>{
				this.closePopup(true);
			});
		}
	}

  	closePopup(allowed){
  		if(allowed){
  			this.showPopup = false;
  			this.updateChanges();
  			this.onClose.emit();
  			this.backBtn.removeHandle(this.handleID);
  		}
  	}

  	constructor(
  		public settings: SettingsService,
  		private backBtn: BackButtonService){}
}