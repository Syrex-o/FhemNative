import { Component, HostBinding, Input, inject } from '@angular/core';

import { getUID } from '@fhem-native/utils';
import { LoaderService } from '@fhem-native/services';

import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	animations: [ ShowHide ]
})

export class LoaderComponent {
	logoLoaderId = getUID();
	public displayLoader$ = inject(LoaderService).loader$;

	@Input() fixed = true;
	@HostBinding('class.fixed') get fState(){ return this.fixed; }
}