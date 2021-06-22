import { Component, Input, NgModule, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { SelectComponentModule } from '../../../select/select.component';

// Services
import { StorageService } from '../../../../services/storage.service';
import { SettingsService } from '../../../../services/settings.service';

@Component({
	selector: 'sprinkler-colors',
	templateUrl: './sprinkler-colors.component.html',
	styleUrls: ['./sprinkler-colors.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SprinklerColorsComponent{
	// sprinkler names
	@Input() sprinklerNames: string[] = [];
	@Input() sprinklerColors: any;

	// update colors
	updateSprinklerColor(): void{
		this.storage.changeSetting({name: 'sprinklerColors',change: JSON.stringify(this.sprinklerColors)});
	}

	constructor(public settings: SettingsService, private storage: StorageService){}
}
@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		SelectComponentModule
	],
	declarations: [SprinklerColorsComponent],
	exports: [SprinklerColorsComponent]
})
export class SprinklerColorsComponentModule {}