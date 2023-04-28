import { NgModule } from '@angular/core';

// Core FhemNative Services
import {
	ColorService,
	FhemService,
	IconService,
	ThemeService,
	HotKeyService,
	EditorService,
	LoaderService,
	LoggerService,
	StorageService,
	UndoRedoService,
	SettingsService,
	StructureService,
	BackButtonService,
	CssVariableService,
	SelectComponentService
} from '@fhem-native/services';

@NgModule({
	providers: [
        { provide: Window, useValue: window },
		ColorService,
		FhemService,
		IconService,
		ThemeService,
		HotKeyService,
		EditorService,
		LoaderService,
		LoggerService,
		StorageService,
		UndoRedoService,
		SettingsService,
		StructureService,
		BackButtonService,
		CssVariableService,
		SelectComponentService
    ]
})
export class CoreServicesModule {}
