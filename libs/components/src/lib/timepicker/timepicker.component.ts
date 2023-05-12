import { Component, Input, Output, EventEmitter, OnInit, forwardRef, ViewChild, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IonModal } from '@ionic/angular';
import { tap } from 'rxjs';

import { CoreExtendedModule } from '@fhem-native/modules';
import { InfoBtnModule } from '../info-btn/info-btn.module';
import { TextBlockModule } from '../text/block/block.module';
import { ConfirmCancelButtonsComponent } from '../confirm-cancel/confirm-cancel.component';

import { ThemeService } from '@fhem-native/services';

import { Theme } from '@fhem-native/types/common';

@Component({
    standalone: true,
	selector: 'fhem-native-timepicker',
	templateUrl: './timepicker.component.html',
	styleUrls: ['./timepicker.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> TimepickerComponent),
		multi: true
	}],
    imports: [
        CoreExtendedModule,
		InfoBtnModule,
		TextBlockModule,
		ConfirmCancelButtonsComponent
    ]
})

export class TimepickerComponent implements OnInit, OnDestroy, ControlValueAccessor{
    @ViewChild('Modal', {read: IonModal}) ionModal: IonModal|undefined;

	// Events
	@Output() timeChanged: EventEmitter<string> = new EventEmitter<string>();
	@Output() opened: EventEmitter<void> = new EventEmitter<void>();
	@Output() closed: EventEmitter<void> = new EventEmitter<void>();

	// display text
	@Input() label = 'Text';

	// When filled, info bubble is created for additional information
	@Input() info = '';

	@Input() maxHours = 24;
	@Input() maxMinutes = 60;

	@Input() confirmBtn = 'Bestätigen';
	@Input() cancelBtn = 'Abbrechen';

	// display info as second line instead of info bubble
	@Input() showInfoBubble = true;

	// determine if timpicker should only switch value, when actual value changes
    @Input() actOnCallback = false;

	// Styling Inputs
	@Input() labelColor: string|undefined;
	@Input() infoColor: string|undefined;
	@Input() timeColor: string|undefined;

	theme$ = this.theme.getTheme().pipe( tap(x=> this.colorMapper(x)) );
	_labelColor: string|undefined;
	_infoColor: string|undefined;
	_timeColor: string|undefined;
    
	// time values
	timeVals: {hours: string[], mins: string[]} = {hours: [], mins: []};

	modalState = false;
	// Value handler
	value = '10:00';
	selectValue = '10:00';

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: any) {
        if(value === null) return;
		this.value = value;
		this.selectValue = value;
		this.updateChanges();
	}

	constructor(private theme: ThemeService){}

	private colorMapper(theme: Theme): void{
		this._labelColor = this.labelColor || theme.properties['--text-a'];
		this._timeColor = this.timeColor || theme.properties['--text-a'];
		this._infoColor = this.infoColor || theme.properties['--text-b'];
	}

	ngOnInit(){
		// init timepicker values
		this.selectValue = this.value;
		// Max Times
		const arr1 = [];
		const arr2 = [];

		for (let i = 0; i < Math.max(this.maxHours, this.maxMinutes); i++) {
			if (i < this.maxHours) arr1.push(this.numFormatter(i));
			if (i < this.maxMinutes) arr2.push(this.numFormatter(i));
		}
		this.timeVals.hours = arr1;
		this.timeVals.mins = arr2;
	}

	changeValue(): void{
		if(!this.actOnCallback){
			this.value = this.selectValue;
			this.timeChanged.emit(this.value);
		}else{
			setTimeout(()=> this.selectValue = this.value );
			// prevent double calls from ionic on actOnCallback
			if(this.value !== this.selectValue) this.timeChanged.emit(this.selectValue);
		}
		this.updateChanges();
	}

    toggleTimepickerModal(): void{
        this.modalState = !this.modalState;
        if(this.modalState) return this.opened.emit();
        this.closed.emit();
    }

    closeTimepickerModal(): void{
        this.modalState = false;
        this.closed.emit();
    }
    
    // change value back to original on cancel
	revertValue(): void{
		this.selectValue = this.value;
	}

	// format digits
	private numFormatter(num: number) {
		return (num < 10) ? '0' + num.toString() : num.toString();
	}

    ngOnDestroy(): void {
        if(this.ionModal) this.ionModal.dismiss();
    }
}