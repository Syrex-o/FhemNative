import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, of, switchMap } from "rxjs";

import { DocService } from "./doc.service";
import { DocItemComponent } from "@fhem-native/docs";
import { WebsettingsService } from "../../shared/services/webSettings.service";

import { SkelettonDocComponent } from "../../components/skeletton-doc/skeletton-doc.component";
import { ScrollManagerModule } from "@fhem-native/directives";
import { SettingsService } from "@fhem-native/services";

@Component({
    standalone: true,
	selector: 'fhem-native-website-doc',
	templateUrl: 'doc.page.html',
	styleUrls: ['doc.page.scss'],
    imports: [ 
        IonicModule,
        CommonModule,
        DocItemComponent,
        SkelettonDocComponent,
        ScrollManagerModule
    ],
    providers: [ DocService ]
})
export class DocPageComponent {
    private currentDoc: string|undefined;

    doc$ = combineLatest([
        this.webSettings.getLanguageLoader(),
        this.route.params
    ]).pipe(
        switchMap(([langLoaded, params])=>{
            this.currentDoc = params['doc'];
            return langLoaded ? this.docService.getDoc(params['doc']) : of(false)
        })
    );

    constructor(
        private route: ActivatedRoute, 
        private docService: DocService, 
        private settings: SettingsService,
        private webSettings: WebsettingsService){
    }

    editPageOnGithub(): void{
        if(!this.currentDoc) return;
        const base = 'https://github.com/Syrex-o/FhemNative/tree/main/apps/fhem-native/src/assets/i18n';
        const lang = this.settings.app.language;
        const url = `${base}/${lang}/docs/${this.currentDoc}.yaml`;
        window.open(url, '_blank');
    }
}