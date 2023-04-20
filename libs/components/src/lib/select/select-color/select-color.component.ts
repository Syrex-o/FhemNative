import { Component, ChangeDetectionStrategy, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { SelectComponent } from '../select.component';
import { isValidHex } from '@fhem-native/utils';
import { ColorService, ToastService } from '@fhem-native/services';

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

    constructor(private toast: ToastService, private color: ColorService){
        super();
    }

    ngModelChangeCallback(e: any){
        this.onChange(e);
    }

    onNewItemSelected(colorVal: string): void{
        if(colorVal.substring(0,1) !== '#'){
            this.toast.showTranslatedAlert('DICT.COLORS.ERRORS.MISSING_#.name', 'DICT.COLORS.ERRORS.MISSING_#.info', false);
            return;
        }
        if(colorVal.length === 4 || colorVal.length === 7){
            if(!isValidHex(colorVal)){
                this.toast.showTranslatedAlert('DICT.COLORS.ERRORS.INVALID_HEX.name', 'DICT.COLORS.ERRORS.INVALID_HEX.info', false);
                return;
            }

            this.color.addColor(colorVal);
            this.value = colorVal;
            return;
        }
        // no valid length
        this.toast.showTranslatedAlert('DICT.COLORS.ERRORS.HEX_LENGTH.name', 'DICT.COLORS.ERRORS.HEX_LENGTH.info', false);
    }
}