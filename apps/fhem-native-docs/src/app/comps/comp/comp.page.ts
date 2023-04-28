import { CommonModule } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, of, switchMap, tap } from "rxjs";

import { TranslateModule } from "@ngx-translate/core";

import { CompService } from "./comp.service";
import { DocItemComponent, DocItemModule } from "@fhem-native/docs";
import { WebsettingsService } from "../../shared/services/webSettings.service";

import { SkelettonDocComponent } from "../../components/skeletton-doc/skeletton-doc.component";
import { ComponentInputsComponent } from "../../components/comp-inputs/comp-inputs.component";
import { ComponentDependencyComponent } from "../../components/comp-dependencies/comp-dependencies.component";

import { ScrollManagerModule } from "@fhem-native/directives";
import { ComponentTypes } from "@fhem-native/app-config";

import { ComponentLoaderModule, EditButtonComponent } from "@fhem-native/components";
import { EditorService } from "@fhem-native/services";

import { getUID } from "@fhem-native/utils";

import { FhemComponentSettings } from "@fhem-native/types/components";

@Component({
    standalone: true,
	selector: 'fhem-native-website-doc',
	templateUrl: 'comp.page.html',
	styleUrls: ['comp.page.scss'],
    imports: [ 
        IonicModule,
        CommonModule,
        TranslateModule,
        DocItemComponent,
        SkelettonDocComponent,
        ScrollManagerModule,

        DocItemModule,

        EditButtonComponent,
        ComponentLoaderModule,

        ComponentInputsComponent,
        ComponentDependencyComponent
    ],
    providers: [ CompService ],
    encapsulation: ViewEncapsulation.None
})
export class CompPageComponent{
    componentTypes = ComponentTypes;
    private currentComp: string|undefined;

    sandboxUID = getUID();
    sandboxComponents: FhemComponentSettings[]|undefined;

    comp$ = combineLatest([
        this.webSettings.getLanguageLoader(),
        this.route.params
    ]).pipe(
        switchMap(([langLoaded, params])=>{
            this.currentComp = params['comp'];
            return langLoaded ? this.compService.getComponent(params['comp']) : of(null)
        }),
        tap(x=> {
            if(!x) return;
            this.sandboxComponents = this.compService.getSandboxComponents(x.name);
        })
    );

    trackByFn(index:any){ return index; }
    keepOrder = (a: any, b: any) => {return a;}

    constructor(
        private route: ActivatedRoute,
        private editor: EditorService,
        private compService: CompService,
        private webSettings: WebsettingsService){
    }

    toggleEditMode(): void{
        if(!this.editor.core.getCurrentMode().editComponents) return this.editor.core.enterEditMode(this.sandboxUID);
        return this.editor.core.leaveEditMode();
    }
}