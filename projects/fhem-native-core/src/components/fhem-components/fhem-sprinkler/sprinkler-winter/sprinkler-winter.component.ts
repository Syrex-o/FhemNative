import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Components 
import { SwitchComponentModule } from '../../../switch/switch.component';

// Services
import { FhemService } from '../../../../services/fhem.service';
import { ToastService } from '../../../../services/toast.service';
import { SettingsService } from '../../../../services/settings.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-winter',
	templateUrl: './sprinkler-winter.component.html',
	styleUrls: ['./sprinkler-winter.component.scss']
})

export class SprinklerWinterComponent {
	// smart sprinkler device
	@Input() smartSprinkler!: FhemDevice|null;

	changeWinterMode(value: boolean): void{
		if(this.smartSprinkler && this.smartSprinkler.device){
			// check for winter mode
			if(this.smartSprinkler.readings.runInterval && this.smartSprinkler.readings.runInterval.Value){
				const header: string = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.NOT_SET.TITLE');
				const info: string = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.NOT_SET.INFO');
				// show warning
				this.toast.showAlert(header, info, false);
			}else{
				this.fhem.setAttr(this.smartSprinkler.device, 'winterMode', value);
			}
		}
	}

	constructor(
		private fhem: FhemService,
		private toast: ToastService,
		public settings: SettingsService,
		private translate: TranslateService){
	}
}
@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		TranslateModule, 
		SwitchComponentModule
	],
	declarations: [SprinklerWinterComponent],
	exports: [SprinklerWinterComponent]
})
export class SprinklerWinterComponentModule {}