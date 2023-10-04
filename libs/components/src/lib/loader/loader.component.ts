import { Component, HostBinding, Input, OnInit, inject } from '@angular/core';
import { of } from 'rxjs';

import { getUID } from '@fhem-native/utils';
import { Loader, LoaderService } from '@fhem-native/services';

import { ShowHide } from './animations';

@Component({
	selector: 'fhem-native-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	animations: [ ShowHide ]
})

export class LoaderComponent implements OnInit{
	logoLoaderId = getUID();
	public displayLoader$ = inject(LoaderService).loader$;

	@Input() manualLoader: Loader|undefined;

	@Input() fixed = true;
	@HostBinding('class.fixed') get fState(){ return this.fixed; }

	ngOnInit(): void {
		if(this.manualLoader) this.displayLoader$ = of(this.manualLoader);
	}
}