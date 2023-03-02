import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ThemeService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-popover',
	templateUrl: './popover.component.html',
	styleUrls: ['./popover.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> PopoverComponent),
		multi: true
	}]
})

export class PopoverComponent implements ControlValueAccessor{
	// allow closing
	@Input() backdropDismiss = true;
    @Input() closeButtonDismiss = true;

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

	onDismiss(): void{
		this.value = false;
		this.updateChanges();
	}
}