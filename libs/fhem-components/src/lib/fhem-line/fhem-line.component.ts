import { Component, Input } from '@angular/core';

import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
    imports: [ FhemComponentModule ],
	selector: 'fhem-native-line',
	templateUrl: './fhem-line.component.html',
	styleUrls: ['./fhem-line.component.scss']
})
export class FhemBoxComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() height!: number;
	@Input() rotation!: number;
    @Input() curvePercentage!: number;

	// Selections
	@Input() orientation!: string;

	// Styling
	@Input() color!: string;
}