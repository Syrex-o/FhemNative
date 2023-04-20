import { Component, Input } from '@angular/core';
import { KeyValuePipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from '@fhem-native/components';

@Component({
    standalone: true,
	selector: 'fhem-native-docs-comp-inputs',
	templateUrl: './comp-inputs.component.html',
    styleUrls: ['./comp-inputs.component.scss'],
    imports: [ 
        IonicModule,
        TranslateModule,

        IconModule,

        NgIf,
        NgFor,
        NgSwitch,
        NgSwitchCase,
        NgTemplateOutlet,

        KeyValuePipe
    ]
})
export class ComponentInputsComponent{
    @Input() componentName: string|undefined;

    @Input() inputType: string|undefined;
    @Input() inputs: Record<string, any>|undefined;

    trackByFn(index:any){ return index; }
    keepOrder = (a: any, b: any) => {return a;}
}