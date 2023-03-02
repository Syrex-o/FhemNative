import { Component, forwardRef, HostBinding, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'fhem-native-state-icon',
	templateUrl: './state-icon.component.html',
	styleUrls: ['./state-icon.component.scss'],
    providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> StateIconComponent),
		multi: true
	}]
})

export class StateIconComponent {
    // state icon type 
    @Input() icon = 'plus';
    @HostBinding('class') get class(){ return [
        this.icon,
        ( this.value ? 'active' : 'inactive' )
    ]; };

    value = false;

    onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }
    writeValue(value: boolean): void {this.value = value;}
}