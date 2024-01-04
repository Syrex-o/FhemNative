import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { Route, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";

import { ScrollHeaderModule } from "@fhem-native/directives";
import { CloseBtnContainerModule, TextBlockModule, UI_BoxComponent, UI_CategoryComponent } from "@fhem-native/components";

import { CssVariableService, NoteItemType, ReleaseInformerService, StructureService } from "@fhem-native/services";
import { APP_CONFIG } from "@fhem-native/app-config";
import { getRawVersionCode } from "@fhem-native/utils";

@Component({
    standalone: true,
    imports: [
        FormsModule,
		IonicModule,
		CommonModule,
        RouterModule,
		TranslateModule,
		// Directives
		ScrollHeaderModule,
		// Components
		CloseBtnContainerModule,
		// UI components
		TextBlockModule,
		UI_BoxComponent,
		UI_CategoryComponent
    ],
    providers: [ReleaseInformerService],
	selector: 'fhem-native-release-notes',
	templateUrl: 'release-notes.page.html',
	styleUrls: ['../pages.style.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReeaseNotesPageComponent{
    appConfig = inject(APP_CONFIG);
    versionString = getRawVersionCode(this.appConfig.versionCode);
    releaseNotes = inject(ReleaseInformerService).getReleaseNotes();

    private cssVar = inject(CssVariableService);
    private structure = inject(StructureService);

    getColorVal(releaseNoteType: NoteItemType){
        if(releaseNoteType === 'New') return this.cssVar.getVariableValue('--success');
        if(releaseNoteType === 'Fix') return this.cssVar.getVariableValue('--error');
        return this.cssVar.getVariableValue('--info');
    }

    async back(){
		if(!this.structure.currentRoom) await this.structure.loadRooms();
		this.structure.changeRoom( this.structure.currentRoom || this.structure.rooms[0], true );
	}
}

export const RELEASE_NOTES_ROUTES: Route[] = [
    {
        path: '',
        component: ReeaseNotesPageComponent
    }
];