import { Component } from '@angular/core';

// services
import { SettingsService } from '../../services/settings.service';

// Components
import { ComponentsModule } from '../components.module';
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