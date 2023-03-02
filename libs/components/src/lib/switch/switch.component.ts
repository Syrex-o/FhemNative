import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { tap } from 'rxjs';

import { ThemeService } from '@fhem-native/services';

import { Theme } from '@fhem-native/types/common';

@Component({
	selector: 'fhem-native-switch',
	templateUrl: './switch.component.html',
	styleUrls: ['./switch.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> SwitchComponent),
		multi: true
	}]
})

export class SwitchComponent implements ControlValueAccessor{

	// type of switch
	@Input() switchType: 'toggle'|'toggle-outline' = 'toggle-outline';

	// display text
	@Input() label = 'Text';

	// When filled, info bubble is created for additional information
	@Input() info = '';
	
	// display info as second line instead of info bubble
	@Input() showInfoBubble = true;

	// determine if toggle should only switch state, when actual value changes
	@Input() actOnCallback = false;

	// on background
	@Input() boxed = false;

	// Styling Inputs
	@Input() labelColor: string|undefined;
	@Input() infoColor: string|undefined;
	@Input() backgroundColorOn: string|undefined;
	@Input() backgroundColorOff: string|undefined;
	@Input() knobColorOn: string|undefined;
	@Input() knobColorOff: string|undefined;

	theme$ = this.theme.getTheme().pipe( tap(x=> this.colorMapper(x)) );
	_labelColor: string|undefined;
	_infoColor: string|undefined;
	_backgroundColorOn: string|undefined;
	_backgroundColorOff: string|undefined;
	_knobColorOn: string|undefined;
	_knobColorOff: string|undefined;

	@Output() clicked: EventEmitter<boolean> = new EventEmitter<boolean>();

	// Current Value
	value = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: boolean): void {
		this.value = value;
		this.updateChanges();
	}

	constructor(private theme: ThemeService){}

	private colorMapper(theme: Theme): void{
		this._labelColor = this.labelColor || theme.properties['--text-a'];
		this._infoColor = this.infoColor || theme.properties['--text-b'];
		this._backgroundColorOn = this.backgroundColorOn || theme.properties['--btn-bg-a'];
		this._backgroundColorOff = this.backgroundColorOff || theme.properties['--tertiary'];
		this._knobColorOn = this.knobColorOn || theme.properties['--btn-text-a'];
		this._knobColorOff = this.knobColorOff || theme.properties['--btn-text-a'];
	}

	toggle(): void{
		if(!this.actOnCallback) this.value = !this.value;
		// clicked emits the state, that should be the result, based on callback
		// state should switch to false and actonCallback --> false is emitted
		this.clicked.emit(this.value);
		this.updateChanges();
	}
}