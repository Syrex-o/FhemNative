import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Components
import { IconModule } from '@FhemNative/components/icon/icon.component';
import { RoomColorModule } from '@FhemNative/directives/room-color.directive';
import { EditButtonComponentModule } from '@FhemNative/components/edit-button/edit-button.component';

// Services
import { SettingsService } from '@FhemNative/services/settings.service';
import { StructureService } from '@FhemNative/services/structure.service';

@Component({
	selector: 'room-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class RoomHeaderComponent {
	constructor(public settings: SettingsService, public structure: StructureService){}

	toggleMenu(): void{
		this.settings.menuState = !this.settings.menuState;
	}
}

@NgModule({
	declarations: [ RoomHeaderComponent ],
	imports: [ 
		IonicModule, 
		IconModule, 
		CommonModule, 
		RoomColorModule,
		EditButtonComponentModule
	],
	exports: [ RoomHeaderComponent ]
})
export class RoomHeaderModule { }