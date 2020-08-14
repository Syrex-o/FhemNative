import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Services
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';

// Animation
import { PopupPicker } from '../../animations/animations';
import { PickerContent } from '../../animations/animations';

@Component({
	selector: 'picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss'],
	animations: [ PopupPicker, PickerContent ],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: PickerComponent, multi: true}]
})

export class PickerComponent {
	// params for picker
	@Input() height: string|number = 50;
	// Input for custom z-index
	@Input() zIndex: number = 101;

	// Picker Config
	// Backdrop
	@Input() backdropDismiss: boolean = true;

	// Conform Button
	@Input() showConfirmBtn: boolean = true;
	@Input() confirmButtonDismiss: boolean = true;
	@Input() confirmBtn: string;

	// Cancel Button
	@Input() showCancelBtn: boolean = true;
	@Input() cancelButtonDismiss: boolean = true;
	@Input() cancelBtn: string;

	// choose animation style of the popup
	// (from-top, from-bottom)
	@Input() animation: string = 'from-bottom';

	// Events
	@Output() onOpen = new EventEmitter();
	@Output() onClose = new EventEmitter();
	@Output() onConfirm = new EventEmitter();
	@Output() onCancel = new EventEmitter();

	// Value handler
	showPicker: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.showPicker); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	// Back button handle ID
	private handleID: string = '_' + Math.random().toString(36).substr(2, 9);

	writeValue(value): void {
		const previousState = this.showPicker;
		this.showPicker = value;
		if (value) {
			this.onOpen.emit();
			this.updateChanges();
			this.assignBackHandle();

		}
		// change in model
		if(previousState && !this.showPicker){
			this.closePicker(this.backdropDismiss || this.cancelButtonDismiss);
		}
	}

	ngOnChanges(changes: SimpleChanges){
		// check for changes in dismiss properties
		if(this.showPicker && (changes.backdropDismiss || changes.cancelButtonDismiss)){
			this.assignBackHandle();
		}
	}

	private assignBackHandle(): void{
		// handle back Button
		this.backBtn.removeHandle(this.handleID);
		// only when backdrop or close is enabled
		if(this.backdropDismiss || this.cancelButtonDismiss){
			this.backBtn.handle(this.handleID, ()=>{
				this.closePicker(true);
			});
		}
	}

	closePicker(allowed: boolean): void{
		if(allowed){
			this.showPicker = false;
			this.updateChanges();
			this.onClose.emit();
			this.backBtn.removeHandle(this.handleID);
		}
	}

	confirm(): void{
		this.onConfirm.emit();
		this.closePicker(this.confirmButtonDismiss);
	}

	cancel(from: string): void{
		if(from === 'backdrop'){
			if(this.backdropDismiss){
				this.onCancel.emit();
			}
			this.closePicker(this.backdropDismiss);
		}else{
			if(this.cancelButtonDismiss){
				this.onCancel.emit();
				this.closePicker(this.cancelButtonDismiss);
			}
		}
	}

	constructor(
		public settings: SettingsService,
		private backBtn: BackButtonService){}
}