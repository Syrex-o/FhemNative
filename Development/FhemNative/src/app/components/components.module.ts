import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Http Requests
import { HttpClientModule, HttpClient } from '@angular/common/http';

// Angular Material
import { MatRippleModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Ionic
import { IonicModule } from '@ionic/angular';
// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Directives
import { DirectivesModule } from '../directives/directives.module';

// Components
import { MenuButtonContainerComponent } from './menu-button-container/menu-button-container.component';
import { FhemComponentContainerComponent } from './fhem-components/fhem-component-container/fhem-component-container.component';
import { RoomComponent } from './room/room.component';
import { PopupComponent } from './popup/popup.component';
import { PickerComponent } from './picker/picker.component';
import { SwitchComponent } from './switch/switch.component';
import { SelectComponent } from './select/select.component';
import { FhemMenuComponent } from './fhem-menu/fhem-menu.component';
import { TimepickerComponent } from './timepicker/timepicker.component';
import { IconComponent } from './icon/icon.component';
import { LoaderComponent } from './loader/loader.component';

// Services
import { ComponentLoaderService } from '../services/component-loader.service';
import { SelectComponentService } from '../services/select-component.service';

// Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, '../../assets/i18n/', '.json');
}

@NgModule({
	imports: [
		IonicModule,
		RouterModule,
		DirectivesModule,
		HttpClientModule,
		FontAwesomeModule,
		TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        FormsModule,
        DragDropModule,
        MatRippleModule
	],
	declarations: [
		MenuButtonContainerComponent,
		FhemComponentContainerComponent,
		RoomComponent,
		PopupComponent,
		FhemMenuComponent,
		PickerComponent,
		SwitchComponent,
		SelectComponent,
		TimepickerComponent,
		IconComponent,
		LoaderComponent
	],
	providers:[
		ComponentLoaderService,
		SelectComponentService
	],
	exports: [
		MenuButtonContainerComponent,
		FhemComponentContainerComponent,
		SwitchComponent,
		SelectComponent,
		PopupComponent,
		FhemMenuComponent,
		TimepickerComponent,
		IconComponent,
		LoaderComponent,
		DirectivesModule,
		DragDropModule,
		MatRippleModule,
		FontAwesomeModule,
		FormsModule,
		PickerComponent
	]
})
export class ComponentsModule {}