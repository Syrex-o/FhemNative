import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Ionic
import { IonicModule } from '@ionic/angular';

// Translator
import { TranslateService } from '@ngx-translate/core';

// Services
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { SelectComponentService } from '../../services/select-component.service';

@Component({
	selector: 'edit-btn',
	templateUrl: './edit-button.component.html',
	styleUrls: ['./edit-button.component.scss'],
})
export class EditButtonComponent {
	constructor(
		private toast: ToastService, 
		public settings: SettingsService, 
		private structure: StructureService, 
		private translate: TranslateService,
		private selectComponent: SelectComponentService){
	}

	// edit button
	edit(): void{
		// check if shared config disabled changes
		if('sharedConfig' in this.settings.app && this.settings.app.sharedConfig.enable && this.settings.app.sharedConfig.passive){
			// show toast for blocked changes
			this.toast.showAlert(
				this.translate.instant('GENERAL.SETTINGS.FHEM.SHARED_CONFIG.WARNING.HEADER'),
				this.translate.instant('GENERAL.SETTINGS.FHEM.SHARED_CONFIG.WARNING.INFO'),
				false
			);
		}else{
			// tell the indicator, that editing was triggered from room with ID
			this.settings.modeSub.next({ roomEdit: true, roomEditFrom: this.structure.currentRoom.ID });
			// trigger grouper
			setTimeout(()=>{ this.selectComponent.groupHandler.next(true); });
		}
	}
}

@NgModule({
	declarations: [ EditButtonComponent ],
	imports: [ CommonModule, IonicModule ],
	exports: [ EditButtonComponent ]
})
export class EditButtonComponentModule {}