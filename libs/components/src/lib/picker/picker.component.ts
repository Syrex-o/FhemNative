import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ScrollHeaderModule } from '@fhem-native/directives';
import { CloseBtnContainerModule } from '../close-btn-container/close-btn-container.module';

import { PickerContent, PickerOpacity } from './animations';
import { BackButtonService } from '@fhem-native/services';
import { getUID } from '@fhem-native/utils';

@Component({
    standalone: true,
	selector: 'fhem-native-picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> PickerComponent),
		multi: true
	}],
    imports: [
        IonicModule,
        CommonModule,
        ScrollHeaderModule,
        CloseBtnContainerModule
    ],
	animations: [ PickerOpacity, PickerContent ]
})

export class PickerComponent implements ControlValueAccessor, OnInit, OnDestroy{
	private readonly handleID = getUID();

    // popup dimensions in percentage
    @Input() height = 80;
	@Input() showBackdrop = true;
	@Input() addPaddingToContent = true;

    @Input() pickerHeader = '';
    @Input() headerAnimation = true;

	// Current open/close state
	value = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	constructor(private backBtn: BackButtonService){}

	writeValue(value: boolean): void {
		this.value = value;
		this.updateChanges();
	}

	ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.onDismiss() );
	}

	onDismiss(): void{
		this.value = false;
		this.updateChanges();
	}

	ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}