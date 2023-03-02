import { Component, HostBinding, Input } from '@angular/core';

import { getUID } from '@fhem-native/utils';
import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	animations: [ ShowHide ]
})

export class LoaderComponent {
	@Input() logoLoader = false;
	@Input() loaderInfo!: string;

	@Input() fixed = true;
	@HostBinding('class.fixed') get fState(){ return this.fixed; }

	logoLoaderId = getUID();
}