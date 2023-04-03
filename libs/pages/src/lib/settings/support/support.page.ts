import { Component, OnDestroy, OnInit } from "@angular/core";
import { Route } from "@angular/router";
import { IonicModule, NavController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from "@ngx-translate/core";

import { ScrollHeaderModule } from "@fhem-native/directives";

import { CloseBtnContainerModule, PickerComponent, SwitchModule } from "@fhem-native/components";

import { BackButtonService, ToastService } from "@fhem-native/services";

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

    showSupport = false;
    termsAccepted = false;
    readonly availableAmounts = [1, 3, 5, 10];
    selectedAmount = 3;
    
    showGuidelines = false;
    showPaymentDetails = false;

    constructor(
        private toast: ToastService,
        private clipboard: Clipboard,
        private navCtrl: NavController,
        private backBtn: BackButtonService){
    }

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
	}

    copytoClip(data: string): void{
        // copy to clipboard
		this.clipboard.copy(data);
		// toast message
		this.toast.addToast('Copied', 'Copied to clipboard!', 'info', 2000);
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