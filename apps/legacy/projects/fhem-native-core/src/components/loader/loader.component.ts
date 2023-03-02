import { Component, NgModule } from '@angular/core';
// Services
import { SettingsService } from '../../services/settings.service';
// Animations
import { PopupPicker } from '../../animations/animations';

@Component({
	selector: 'loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	animations: [ PopupPicker ]
})
export class LoaderComponent {
	constructor(public settings: SettingsService){}
}

@NgModule({
	declarations: [ LoaderComponent ],
	exports: [ LoaderComponent ]
})
export class LoaderModule {}