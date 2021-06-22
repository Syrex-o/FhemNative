import { Component, Input, NgModule, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Translator
import { TranslateModule } from '@ngx-translate/core';

// Components
import { IonicModule } from '@ionic/angular';

// Services
import { SettingsService } from '../../../../services/settings.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-weather',
	templateUrl: './sprinkler-weather.component.html',
	styleUrls: ['./sprinkler-weather.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SprinklerWeatherComponent {
	// relevant sprinkler devices
	@Input() weather!: FhemDevice|null;
	@Input() smartSprinkler!: FhemDevice|null;

	constructor(public settings: SettingsService){}
}
@NgModule({
	imports: [ 
		IonicModule, 
		CommonModule,
		TranslateModule
	],
	declarations: [SprinklerWeatherComponent],
	exports: [SprinklerWeatherComponent]
})
export class SprinklerWeatherComponentModule {}