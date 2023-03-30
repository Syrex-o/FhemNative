import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ScrollHeaderModule } from '@fhem-native/directives';
import { CloseBtnContainerModule } from '../close-btn-container/close-btn-container.module';

import { BackButtonService } from '@fhem-native/services';

import { getUID } from '@fhem-native/utils';
import { PopupContent, PopupOpacity } from './animations';

@Component({
    standalone: true,
	selector: 'fhem-native-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> PopupComponent),
		multi: true
	}],
    imports: [
        IonicModule,
        CommonModule,
        ScrollHeaderModule,
        CloseBtnContainerModule
    ],
	animations: [PopupOpacity, PopupContent]
})

export class PopupComponent implements ControlValueAccessor, OnInit, OnDestroy{
	private readonly handleID = getUID();

    // popup dimensions in percentage
    @Input() width = 80;
    @Input() height = 80;
	@Input() showBackdrop = true;
	@Input() addPaddingToContent = true;

    @Input() popupHeader = '';
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