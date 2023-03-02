import { Component, ChangeDetectionStrategy, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SelectComponent } from '../select.component';
import { CssVariableService, IconService, ThemeService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-select-icon',
	templateUrl: './select-icon.component.html',
	styleUrls: ['./select-icon.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> SelectIconComponent),
		multi: true
	}],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectIconComponent extends SelectComponent {
    constructor(
        public icon: IconService,
        public override cssVariable: CssVariableService, 
        public override theme: ThemeService){
        super(cssVariable, theme);

        this.selectProp = 'icon';
        this.displayProp = 'icon';
    }


    ngModelChangeCallback(e: any){
        this.onChange(e);
    }
}