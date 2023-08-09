import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Route, RouterModule } from "@angular/router";
import { IonicModule, NavController } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { SharedConfigSettingsPageComponent } from "./shared-config/shared-config.page";

import { ScrollHeaderModule } from "@fhem-native/directives";

import { CloseBtnContainerModule, SwitchModule, TextBlockModule, UI_BoxComponent, UI_CategoryComponent } from "@fhem-native/components";

import { BackButtonService, SettingsService, StorageService, ThemeService } from "@fhem-native/services";

import { clone, getUID } from "@fhem-native/utils";

@Component({
    standalone: true,
	selector: 'fhem-native-settings-advanced',
	templateUrl: 'advanced.page.html',
	styleUrls: ['../../pages.style.scss'],
    imports: [
        IonicModule,
        FormsModule,
        CommonModule,
        RouterModule,
        TranslateModule,
        CloseBtnContainerModule,
        ScrollHeaderModule,

        SwitchModule,
        TextBlockModule,
        UI_BoxComponent,
        UI_CategoryComponent
    ]
})
export class AdvancedSettingsPageComponent implements OnInit, OnDestroy{
    private handleID = getUID();
    
    primaryColor$ = this.theme.getThemePipe('--primary');

    showSharedConfig = false;

    sharedConfigValid = false;
    sharedConfig = clone(this.settings.app.sharedConfig);

    constructor(
        private theme: ThemeService,
        private navCtrl: NavController,
        private storage: StorageService,
        public settings: SettingsService,
        private backBtn: BackButtonService){
    }

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
	}

    changeExperimentalSetting(jsonKey: string, value: any){
        if(!(jsonKey in this.settings.app.experimentalFeatures)) return;
        this.settings.app.experimentalFeatures[jsonKey] = value;

        this.storage.changeSetting({name: 'experimentalFeatures', change: JSON.stringify(this.settings.app.experimentalFeatures)});
    }

    closePage(): void{
        this.navCtrl.back();
    }

    ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}

export const ADVANCED_ROUTES: Route[] = [
    {
        path: '',
        component: AdvancedSettingsPageComponent
    },
    {
        path: 'shared-config',
        component: SharedConfigSettingsPageComponent
    }
];