import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SandboxPageComponent } from './sandbox.page';
import { SandboxPageRoutingModule } from './sandbox-routing.module';
import { SandboxGuardService } from './sandbox-guard.service';

import { PickerComponent, TextBlockModule, UI_BoxComponent, UI_CategoryComponent } from '@fhem-native/components';

import { EditorService, FhemService, SelectComponentService, SettingsService, StorageService, StructureService, UndoRedoService } from '@fhem-native/services';

import {
	SandboxFhemService,
	SandboxEditorService,
	SandboxStorageService,
	SandboxSettingsService,
	SandboxUndoRedoService,
	SandboxStructureService, 
	SandboxSelectComponentService 
} from './services';

@NgModule({
	imports: [
		FormsModule,
		IonicModule,
		CommonModule,
		TranslateModule,
		PickerComponent,
		TextBlockModule,
		SandboxPageRoutingModule,
		
		UI_BoxComponent,
		UI_CategoryComponent
	],
	declarations: [ SandboxPageComponent ],
	providers: [
		{provide: FhemService, useClass: SandboxFhemService},
		{provide: EditorService, useClass: SandboxEditorService},
		{provide: StorageService, useClass: SandboxStorageService},
		{provide: SettingsService, useClass: SandboxSettingsService},
		{provide: UndoRedoService, useClass: SandboxUndoRedoService},
		{provide: StructureService, useClass: SandboxStructureService},
		{provide: SelectComponentService, useClass: SandboxSelectComponentService},
		SandboxGuardService
	]
})
export class SandboxPageModule {}