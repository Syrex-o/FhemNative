import { Component, Input, OnChanges, SimpleChanges, NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { LoaderModule } from '../loader/loader.component';

// Services
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'icon',
	templateUrl: './icon.component.html',
	styleUrls: ['./icon.component.scss'],
})
export class IconComponent implements OnChanges{
	// get the icon input
	@Input() icon!: string;
	// determine if icon should have ripple effect
	@Input() ripple: boolean = false;

	// actual icon to display
	public _icon: {icon: any, type: string} = {icon: 'home', type: 'ion'};

	constructor(public settings: SettingsService){}

	ngOnChanges(changes: SimpleChanges){
		if(changes.icon){
			const current: string = changes.icon.currentValue;
			this.iconFinder(current);
		}
	}

	private iconFinder(name: string): void{
		this._icon = this.settings.icons.find(((x: {icon: string, type: string})=> x.icon === name)) || {icon: 'home', type: 'ion'};
	}

}

@NgModule({
	declarations: [ IconComponent ],
	imports: [ FontAwesomeModule, IonicModule, CommonModule, LoaderModule ],
	exports: [ IconComponent ]
})
export class IconModule {}