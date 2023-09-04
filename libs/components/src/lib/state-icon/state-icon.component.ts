import { Component, forwardRef, HostBinding, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { map } from 'rxjs';

import { ThemeService } from '@fhem-native/services';

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

	@Input() iconColor: string|undefined;
    @HostBinding('class') get class(){ return [this.icon, ( this.value ? 'active' : 'inactive' ) ]; };

    value = false;
	iconColor$ = this.theme.getThemePipe('--text-a').pipe( map(x=>  this.iconColor || x) );

	constructor(private theme: ThemeService){}

    onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }
    writeValue(value: boolean): void {this.value = value;}
}