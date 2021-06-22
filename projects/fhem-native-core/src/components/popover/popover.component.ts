import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, forwardRef, ChangeDetectorRef, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { AnimationEvent } from '@angular/animations';
import { CommonModule } from '@angular/common';

// Ionic
import { IonicModule } from '@ionic/angular';

// Services
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';

// Animation
import { PopupPicker, PopupContent, ShowHide } from '../../animations/animations';

@Component({
	selector: 'popover',
	templateUrl: './popover.component.html',
	styleUrls: ['./popover.component.scss'],
	host: {'[style.zIndex]': 'zIndex'},
	animations: [PopupPicker, PopupContent, ShowHide],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(()=> PopoverComponent), multi: true}]
})

export class PopoverComponent implements OnChanges {
	// params for popup
	@Input() width: string|number = 80;
	@Input() height: string|number = 80;
	@Input() zIndex: number = 101;

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
	toggleAnimation!: string;

	// Events
	@Output() onOpen: EventEmitter<any>  = new EventEmitter();
	@Output() onClose: EventEmitter<any>  = new EventEmitter();
	@Output() onAnimationEnd: EventEmitter<boolean> = new EventEmitter();

	// Value handler
	showPopup: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.showPopup); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	// Back button handle ID
	private handleID: string = this.settings.getUID();

	constructor(
		private cdr: ChangeDetectorRef,
		public settings: SettingsService, 
		private backBtn: BackButtonService){
	}

	writeValue(value: boolean): void {
		const previousState: boolean = this.showPopup;
		this.showPopup = value;
		this.toggleAnimation = this.invertAnimation ? this.animation + '-invert' : this.animation;
		if(value){
			this.onOpen.emit();
			this.updateChanges();
			this.assignBackHandle();
			this.cdr.detectChanges();
		}
		// change in model
		if(previousState && !this.showPopup){
			this.closePopup(this.backdropDismiss || this.closeButtonDismiss);
		}
	}

	ngOnChanges(changes: SimpleChanges): void{
		// check for changes in dismiss properties
		if(this.showPopup && (changes.backdropDismiss || changes.closeButtonDismiss)){
			this.assignBackHandle();
		}
	}

	private assignBackHandle(): void{
		// handle back Button
		this.backBtn.removeHandle(this.handleID);
		// only when backdrop or close is enabled
		if(this.backdropDismiss || this.closeButtonDismiss){
			this.backBtn.handle(this.handleID, ()=>{
				this.closePopup(true);
			});
		}
	}

	closePopup(allowed: boolean): void{
		if(allowed){
			this.showPopup = false;
			this.updateChanges();
			this.onClose.emit();
			this.backBtn.removeHandle(this.handleID);
		}
	}

	// popup animation state
  	animationEnd(event: AnimationEvent): void{
  		this.onAnimationEnd.emit(this.showPopup);
  	}
}
@NgModule({
	declarations: [ PopoverComponent ],
	imports: [ IonicModule, FormsModule, CommonModule ],
	exports: [ PopoverComponent ]
})
export class PopoverComponentModule {}