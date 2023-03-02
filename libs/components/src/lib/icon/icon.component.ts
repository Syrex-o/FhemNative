import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { IconService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-icon',
	templateUrl: './icon.component.html',
	styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnChanges{
    // get the icon input
	@Input() icon!: string;
	@Input() ionFallback = false;
	// determine if icon should have ripple effect
	@Input() ripple = false;

    // actual icon to display
	public _icon: {icon: any, type: string} = {icon: 'home', type: 'ion'};

    constructor(public iconService: IconService){}

    ngOnChanges(changes: SimpleChanges){
		if(changes['icon']){
			const current: string = changes['icon'].currentValue;
			const foundIcon = this.iconService.findIcon(current);
			
			this._icon = foundIcon ? foundIcon : (this.ionFallback ? {icon: current, type: 'ion'} : {icon: 'home', type: 'ion'})
		}
	}
}