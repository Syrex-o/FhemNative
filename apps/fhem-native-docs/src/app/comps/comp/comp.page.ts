import { CommonModule } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { Observable, combineLatest, delay, map, merge, of, switchMap } from "rxjs";

import { TranslateModule } from "@ngx-translate/core";

import { CompService } from "./comp.service";
import { DocItemComponent, DocItemModule } from "@fhem-native/docs";
import { WebsettingsService } from "../../shared/services/webSettings.service";

import { SkelettonDocComponent } from "../../components/skeletton-doc/skeletton-doc.component";
import { ComponentInputsComponent } from "../../components/comp-inputs/comp-inputs.component";
import { ComponentDependencyComponent } from "../../components/comp-dependencies/comp-dependencies.component";

import { SandboxFhemService } from "@fhem-native/pages";
import { ScrollManagerModule } from "@fhem-native/directives";
import { ComponentLoaderModule, EditButtonComponent, LoaderModule } from "@fhem-native/components";

import { EditorService, FhemService } from "@fhem-native/services";

import { ComponentTypes } from "@fhem-native/app-config";
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

        LoaderModule,
        EditButtonComponent,
        ComponentLoaderModule,

        ComponentInputsComponent,
        ComponentDependencyComponent
    ],
    providers: [ 
        CompService, 
        {provide: FhemService, useClass: SandboxFhemService}, 
    ],
    encapsulation: ViewEncapsulation.None
})
export class CompPageComponent{
    componentTypes = ComponentTypes;

    comp$ = combineLatest([
        this.webSettings.getLanguageLoader(),
        this.route.params
    ]).pipe(
        switchMap(([langLoaded, params])=>{
            return langLoaded ? this.compService.getComponent(params['comp']) : of(null)
        })
    );

    sandboxUID$ = this.comp$.pipe(  map(()=> getUID()) );
    sandboxComponents$: Observable<{loading: boolean, comps: FhemComponentSettings[]}> = merge(
        of({loading: true, comps: []}),
        this.comp$.pipe(
            switchMap((x)=>{
                return merge(
                    of({loading: true, comps: []}),
                    of({
                        loading: false,
                        comps: x ? this.compService.getSandboxComponents(x.name) || [] : []
                    }).pipe( delay(100) )
                )
            })
        )
    );

    trackByFn(index:any){ return index; }
    keepOrder = (a: any, b: any) => {return a;}

    constructor(
        private route: ActivatedRoute,
        private editor: EditorService,
        private compService: CompService,
        private webSettings: WebsettingsService){
    }

    toggleEditMode(sandboxUID: string): void{
        if(!this.editor.core.getCurrentMode().editComponents) return this.editor.core.enterEditMode(sandboxUID);
        return this.editor.core.leaveEditMode();
    }
}