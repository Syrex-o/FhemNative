import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// Services
import { SettingsService } from '../../services/settings.service';

@Component({
  	selector: 'icon',
  	templateUrl: './icon.component.html',
  	styleUrls: ['./icon.component.scss'],
})

export class IconComponent implements OnChanges{
	// get the icon input
	@Input() icon: string;
	// determine if icon should have ripple effect
	@Input() ripple: boolean = false;

	public _icon: {icon: string, type: string};

	constructor(
		public settings: SettingsService){

	}

	ngOnChanges(changes: SimpleChanges){
		if(changes.icon){
			const current = changes.icon.currentValue;
			this.iconFinder(current);
		}
	}

	private iconFinder(name: string){
		this._icon = this.settings.icons.find((x=> x.icon === name)) || {icon: 'home', type: 'ion'};
	}
}