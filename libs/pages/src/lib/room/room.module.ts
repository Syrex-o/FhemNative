import { NgModule } from '@angular/core';
import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { RoomGuardService } from './room-guard.service';
import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPageComponent } from './room.page';
import { RoomHeaderComponent } from './room-components/room-header/room-header.component';
import { RoomSidebarComponent } from './room-components/room-sidebar/room-sidebar.component';
import { RoomContentPageComponent } from './room-content/room-content.page';
import { RoomHeaderEditorComponent } from './room-components/room-header/editor/editor.component';
import { RoomComponentCreatorComponent } from './room-components/component-creator/component-creator.component';

import { CloseBtnModule, ComponentLoaderModule, IconModule, InputModule, SelectModule, SwitchModule, TextBlockModule, TextLineModule, SelectIconModule, SelectColorModule, EditButtonComponent, UI_CategoryComponent, SelectGradientModule } from '@fhem-native/components';
import { RoomHeaderUndoRedoComponent } from './room-components/room-header/editor/undo-redo/undo-redo.component';

@NgModule({
	imports: [
		ComponentLoaderModule,
		RoomPageRoutingModule,
		CoreExtendedAndTranslateModule,
		DragDropModule,
		// Modules
		IconModule,
		InputModule,
		SwitchModule,
		CloseBtnModule,
		TextLineModule,
		TextBlockModule,
		EditButtonComponent,

		SelectModule,
		SelectIconModule,
		SelectColorModule,
		SelectGradientModule,
		
		UI_CategoryComponent
	],
	declarations: [ 
		RoomPageComponent, 
		// Parts
		RoomHeaderComponent,
		RoomSidebarComponent,
		RoomContentPageComponent,
		RoomHeaderEditorComponent,
		RoomHeaderUndoRedoComponent,
		RoomComponentCreatorComponent
	],
	exports: [
		RoomPageComponent,
		// Parts
		RoomHeaderComponent,
		RoomSidebarComponent,
		RoomContentPageComponent,
		RoomHeaderEditorComponent,
		RoomComponentCreatorComponent
	],
	providers: [RoomGuardService]
})
export class RoomPageModule {}