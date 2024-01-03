import { Component, OnDestroy, OnInit } from "@angular/core";
import { Route } from "@angular/router";
import { IonicModule, NavController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

import { ScrollHeaderModule } from "@fhem-native/directives";

import { CloseBtnContainerModule, PickerComponent, SwitchModule } from "@fhem-native/components";

import { BackButtonService, Product, StoreService } from "@fhem-native/services";

import { getUID } from "@fhem-native/utils";
import { RightsSupportComponent } from "../../rights";
import { Observable, map } from "rxjs";

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

    termsAccepted = false;
    showGuidelines = false;

    selectedItem = 1;
    ownedItems$: Observable<Product[]> = this.store.getProducts().pipe( map(x=> x.filter(y=> y.owned)) );
    availableItems$: Observable<Product[]> = this.store.getProducts().pipe( map(x=> x.filter(y=> !y.owned)) );

    constructor(
        public store: StoreService,
        private navCtrl: NavController,
        private backBtn: BackButtonService){
    }

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
	}

    async subscribeToProduct(product: CdvPurchase.Product){
        const success = await this.store.purchaseProduct(product);
        if(success){
            this.selectedItem = -1;
            this.closePage();
        }
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