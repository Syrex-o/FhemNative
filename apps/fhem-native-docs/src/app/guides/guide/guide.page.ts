import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, of, switchMap } from "rxjs";

import { GuideService } from "./guide.service";
import { DocItemComponent } from "@fhem-native/docs";
import { WebsettingsService } from "../../shared/services/webSettings.service";

import { SkelettonDocComponent } from "../../components/skeletton-doc/skeletton-doc.component";
import { ScrollManagerModule } from "@fhem-native/directives";
import { SettingsService } from "@fhem-native/services";

@Component({
    standalone: true,
	selector: 'fhem-native-website-guide',
	templateUrl: 'guide.page.html',
	styleUrls: ['guide.page.scss'],
    imports: [ 
        IonicModule,
        CommonModule,
        DocItemComponent,
        SkelettonDocComponent,
        ScrollManagerModule
    ],
    providers: [ GuideService ]
})
export class GuidePageComponent {
    private currentDoc: string|undefined;

    doc$ = combineLatest([
        this.webSettings.getLanguageLoader(),
        this.route.params
    ]).pipe(
        switchMap(([langLoaded, params])=>{
            this.currentDoc = params['guide'];
            return langLoaded ? this.guideService.getGuide(params['guide']) : of(false)
        })
    );

    constructor(
        private route: ActivatedRoute, 
        private guideService: GuideService, 
        private settings: SettingsService,
        private webSettings: WebsettingsService){
    }

    editPageOnGithub(): void{
        if(!this.currentDoc) return;
        const base = 'https://github.com/Syrex-o/FhemNative/tree/main/apps/fhem-native-docs/src/assets/i18n';
        const lang = this.settings.app.language;
        const url = `${base}/${lang}/guides/${this.currentDoc}.yaml`;
        window.open(url, '_blank');
    }
}