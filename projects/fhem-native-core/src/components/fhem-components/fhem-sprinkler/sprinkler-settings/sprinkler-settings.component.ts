import { Component, Input, NgModule, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Translator
import { TranslateModule } from '@ngx-translate/core';
// Components
import { IonicModule } from '@ionic/angular';

// Services
import { FhemService } from '../../../../services/fhem.service';
import { SettingsService } from '../../../../services/settings.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-settings',
	templateUrl: './sprinkler-settings.component.html',
	styleUrls: ['./sprinkler-settings.component.scss']
})

export class SprinklerSettingsComponent{
	// Sprinklers input
	@Input() smartSprinkler!: FhemDevice|null;
	@Input() sprinklerColors: any;
	@Input() sprinklers: any;

	// change single sprinkler settings
	@Output() onSprinklerEdit: EventEmitter<{interval: number, index: number}>  = new EventEmitter();

	// enable/disable interval 2
	triggerInterval2(): void{
		if(this.smartSprinkler){
			const currentValue: boolean = this.smartSprinkler.readings.enableInterval2.Value;
			this.fhem.setAttr(this.smartSprinkler.device, 'enableInterval2', !currentValue);
		}
	}

	constructor(private fhem: FhemService, public settings: SettingsService){}
}
@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		TranslateModule
	],
	declarations: [SprinklerSettingsComponent],
	exports: [SprinklerSettingsComponent]
})
export class SprinklerSettingsComponentModule {}