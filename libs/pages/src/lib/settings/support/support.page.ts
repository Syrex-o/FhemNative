import { Component, OnDestroy, OnInit } from "@angular/core";
import { Route } from "@angular/router";
import { IonicModule, NavController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

import { ScrollHeaderModule } from "@fhem-native/directives";

import { CloseBtnContainerModule, PickerComponent, SwitchModule } from "@fhem-native/components";

import { BackButtonService, StoreService } from "@fhem-native/services";

import { getUID } from "@fhem-native/utils";
import { RightsSupportComponent } from "../../rights";

@Component({
    standalone: true,
	selector: 'fhem-native-support',
	templateUrl: 'support.page.html',
	styleUrls: ['../../pages.style.scss', 'support.page.scss'],
    imports: [
        FormsModule,
        CommonModule,
        IonicModule,
        TranslateModule,
        CloseBtnContainerModule,
        SwitchModule,
        PickerComponent,
        ScrollHeaderModule,
        RightsSupportComponent
    ]
})
export class SupportPageComponent implements OnInit, OnDestroy{
    private handleID = getUID();

    showSupport = true;
    termsAccepted = false;

    selectedAmount = 3;
    readonly availableAmounts = [1, 3, 5, 10];
    
    showGuidelines = false;

    constructor(
        private store: StoreService,
        private navCtrl: NavController,
        private backBtn: BackButtonService){
    }

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
	}

    closePage(): void{
        this.navCtrl.back();
    }

    ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}

export const SUPPORT_ROUTES: Route[] = [
    {
        path: '',
        component: SupportPageComponent
    }
];