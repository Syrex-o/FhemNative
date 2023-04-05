import { Component, ChangeDetectionStrategy, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SelectComponent } from '../select.component';
import { CssVariableService, ThemeService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-select-color',
	templateUrl: './select-color.component.html',
	styleUrls: ['./select-color.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> SelectColorComponent),
		multi: true
	}],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectColorComponent extends SelectComponent {
    constructor(public override cssVariable: CssVariableService, public override theme: ThemeService){
        super(cssVariable, theme);
    }

    ngModelChangeCallback(e: any){
        this.onChange(e);
    }
}