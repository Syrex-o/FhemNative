import { Component, NgModule, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Components
import { IconModule } from '@FhemNative/components/icon/icon.component';
import { RoomColorModule } from '@FhemNative/directives/room-color.directive';

// Services
import { SettingsService } from '@FhemNative/services/settings.service';
import { StructureService } from '@FhemNative/services/structure.service';

@Component({
	selector: 'room-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss']
})
export class RoomHeaderComponent {
	@Output() onEditClick: EventEmitter<boolean> = new EventEmitter();

	constructor(public settings: SettingsService, public structure: StructureService){}
}

@NgModule({
	declarations: [ RoomHeaderComponent ],
	imports: [ IonicModule, IconModule, CommonModule, RoomColorModule ],
	exports: [ RoomHeaderComponent ]
})
export class RoomHeaderModule { }