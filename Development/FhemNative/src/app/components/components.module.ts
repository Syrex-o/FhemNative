import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Components
import { RoomComponent } from './room/room.component';
import { SettingsRoomComponent } from './room/room-settings.component';
import { GridComponent } from './grid/grid.component';
import { PickerComponent } from './picker/picker.component';
import { FhemMenuComponent } from './menu/fhem-menu.component';
import { ButtonContainerComponent } from './menu/button-container.component';
import { DraggableMenuComponent } from './menu/draggable-menu.component';
import { CreateComponentComponent } from './create/create-component.component';
import { EditComponentComponent } from './create/edit-component.component';
import { CreateRoomComponent } from './create/create-room.component';
import { FhemContainerComponent } from './fhem-container/fhem-container.component';

// Fhem Components
import { FHEM_COMPONENT_REGISTRY } from './fhem-components-registry';

// Directives
import { DirectivesModule } from '../directives/directives.module';

// Services
import { CreateComponentService } from '../services/create-component.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}
@NgModule({
	imports: [
		RouterModule,
		CommonModule,
		IonicModule,
		FormsModule,
		MatRippleModule,
		DirectivesModule,
		NgSelectModule,
		DragDropModule,
		HttpClientModule,
		FontAwesomeModule,
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
	],
	declarations: [
		RoomComponent,
		SettingsRoomComponent,
		GridComponent,
		CreateComponentComponent,
		EditComponentComponent,
		CreateRoomComponent,
		FhemMenuComponent,
		ButtonContainerComponent,
		DraggableMenuComponent,
		PickerComponent,
		FhemContainerComponent,
		FHEM_COMPONENT_REGISTRY
	],
	providers:[
		CreateComponentService
	],
	exports: [
		RoomComponent,
		PickerComponent,
		SettingsRoomComponent,
		FhemMenuComponent,
		ButtonContainerComponent,
		DraggableMenuComponent,
		TranslateModule,
		NgSelectModule,
		MatRippleModule,
		FontAwesomeModule,
		FHEM_COMPONENT_REGISTRY
	],
	entryComponents: [
		RoomComponent,
		SettingsRoomComponent,
		GridComponent,
		CreateComponentComponent,
		EditComponentComponent,
		FHEM_COMPONENT_REGISTRY
	]
})
export class ComponentsModule {}
