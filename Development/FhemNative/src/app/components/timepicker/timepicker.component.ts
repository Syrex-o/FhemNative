import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';

// Services
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';

@Component({
	selector: 'timepicker',
	templateUrl: './timepicker.component.html',
  	styleUrls: ['./timepicker.component.scss'],
  	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: TimepickerComponent, multi: true}]
})

export class TimepickerComponent implements OnInit{
	// slides container
	@ViewChild( IonDatetime, { static: true } ) timePicker: IonDatetime;

	// Events
	@Output() onTimeChange: EventEmitter<any> = new EventEmitter();
	@Output() onOpen: EventEmitter<any>  = new EventEmitter();
    @Output() onClose: EventEmitter<any>  = new EventEmitter();

	// config
	@Input() label: string;
	@Input() maxHours: string = '24';
    @Input() maxMinutes: string = '60';

    @Input() confirmBtn: string = 'Bestätigen';
    @Input() cancelBtn: string = 'Abbrechen';

    @Input() timeFormat: string = 'HH:mm';

    @Input() fullHeight: boolean = false;
    @Input() staticHeight: number = 0;
    @Input() showBorder: boolean = false;

    // time values
    timeVals: any = {hours: [], mins: []};

	// Value handler
	value: string;
	// Value to act on Callback
    private currentValue: string;
	@Input() actOnCallback: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	// Back button handle ID
	private handleID: string = '_' + Math.random().toString(36).substr(2, 9);

	writeValue(value) {
		if (value !== null) {
  			this.value = value;
  			if (this.actOnCallback) {this.currentValue = this.value; }
  			this.updateChanges();
  		}
	}

	ngOnInit(){
		// init timepicker values
		this.currentValue = this.value;
		// Max Times
		const arr1 = [];
		const arr2 = [];

		for (let i = 0; i < Math.max(parseInt(this.maxHours), parseInt(this.maxMinutes)); i++) {
			if (i < parseInt(this.maxHours)) {
				arr1.push(this.numFormatter(i));
			}
			if (i < parseInt(this.maxMinutes)) {
				arr2.push(this.numFormatter(i));
			}
		}
		this.timeVals.hours = arr1;
		this.timeVals.mins = arr2;
	}

	private assignBackHandle(){
		// handle back Button
		this.backBtn.removeHandle(this.handleID);
		// only when backdrop or close is enabled
		this.backBtn.handle(this.handleID, ()=>{
			this.closePicker();
		});
	}

	updateTime(val){
		let time: any = val.detail.value;
		if(time.substr(2,1) !== ':'){
			time = new Date(val.detail.value);
			time = this.numFormatter(time.getHours()) + ':' + this.numFormatter(time.getMinutes());
		}

		let emitter = (t: string)=>{
			if(time.substr(2,1) === ':'){
				this.onTimeChange.emit(time);
			}
		}

		if (!this.actOnCallback) {
			this.currentValue = time;
			emitter(time);
		}else{
			setTimeout(() => {
				if (this.currentValue) {
					this.value = this.currentValue;
				}
			});
			// Detect change
			if (this.currentValue !== val.detail.value) {
				emitter(time);
			}
		}
		this.closePicker();
	}

	openPicker(){
		this.timePicker.open();
		this.onOpen.emit();
		// handle back Button
		this.assignBackHandle();
	}

	closePicker(){
		this.onClose.emit();
  		this.backBtn.removeHandle(this.handleID);
	}

	// format digits
	private numFormatter(num) {
		return (num < 10) ? '0' + num.toString() : num.toString();
	}

	constructor(
  		public settings: SettingsService,
  		private backBtn: BackButtonService){
	}
}