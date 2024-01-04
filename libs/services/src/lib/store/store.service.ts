import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, filter, map } from 'rxjs';
import { Platform } from '@ionic/angular';

import { ToastService } from '../toast.service';
import { LoaderService } from '../loader.service';
import { inputIsNotNullOrUndefined } from '@fhem-native/utils';
import { APP_CONFIG, AppConfig } from '@fhem-native/app-config';

// Plugins
import 'cordova-plugin-purchase';
import { PRODUCTS } from './products';

export interface ProductEntry {
    id: string,
    type: CdvPurchase.ProductType,
    platform: CdvPurchase.Platform
}

export interface Product extends CdvPurchase.Product{

}

@Injectable({providedIn: 'root'})
export class StoreService {
    private platform = inject(Platform);
    private toast = inject(ToastService);
    private loader = inject(LoaderService);
    private appConfig: AppConfig = inject(APP_CONFIG);


    private store?: CdvPurchase.Store;
    private readonly storePlatform = this.getStorePlatform();

    private products: Product[] = [];
    private productUpdate = new BehaviorSubject<Product[]>([]);

    private getStorePlatform(){
        if(this.appConfig.store.testMode) return CdvPurchase.Platform.TEST;
        if(this.platform.is('android')) return CdvPurchase.Platform.GOOGLE_PLAY;
        if(this.platform.is('ios')) return CdvPurchase.Platform.APPLE_APPSTORE;

        // default no platform
        return CdvPurchase.Platform.TEST;
    }

    public getProducts(){
        return this.productUpdate.pipe(
            map(x=> x.filter(y=> y.platform === this.storePlatform))
        );
    }

    /**
     * Get Single product Observable
     * @param productId 
     */
    public getProduct(productId: string): Observable<Product>{
        return this.getProducts().pipe(
            map(x=> x.find(y=> y.id === productId)),
            filter(inputIsNotNullOrUndefined)
        );
    }

    private getProductDirect(productId: string): Product|undefined {
        return this.products.filter(x=> x.platform === this.storePlatform).find(x=> x.id === productId);
    }

    public initialize(){
        if(this.store) return;

        const {store, LogLevel} = CdvPurchase;

        this.store = store;
        if(this.appConfig.store.debugMode) this.store.verbosity = LogLevel.DEBUG;

        this.store.register(this.appConfig.store.testMode ? CdvPurchase.Test.testProductsArray : PRODUCTS);

        this.store.when()
            .productUpdated(product=> this.updateProduct(product))
            .approved(transaction=> transaction.verify())
            .verified(receipt => receipt.finish());

        this.store.initialize([this.storePlatform]);
    }

    private updateProduct(product: Product){
        const productIndex = this.products.findIndex(x=> x.id === product.id);
        if(productIndex > -1){
            this.products[productIndex] = product;
        }else{
            this.products.push(product);
        }
        this.productUpdate.next(this.products);
    }

    public async purchaseProduct(product: Product){
        this.loader.showLogoLoader();

        const selProduct = this.getProductDirect(product.id);
        if(!selProduct){
            this.loader.hideLoader();
            this.whoopsAlert();
            return false;
        }

        const offer = selProduct.getOffer();

        if(!offer){
            this.loader.hideLoader();
            this.whoopsAlert();
            return false;
        }

        const res = await offer.order();
        if(res !== undefined){
            this.loader.hideLoader();
            this.whoopsAlert();
            return false;
        }

        // apply product updates
        this.updateProduct(selProduct);

        this.loader.hideLoader();
        this.toast.showTranslatedAlert('STORE.PURCHASE.SUCCESS_TOAST.HEAD', 'STORE.PURCHASE.SUCCESS_TOAST.INFO', false);
        return true;
    }

    public async restorePurchases(){
        this.loader.showLogoLoader();

        const res = await this.store?.restorePurchases();
        if(res !== undefined) this.whoopsAlert();

        await this.store?.update();
        this.loader.hideLoader();
    }

    private whoopsAlert(){
        this.toast.showTranslatedAlert('STORE.PURCHASE.ERROR_TOAST.HEAD', 'STORE.PURCHASE.ERROR_TOAST.INFO', false);
    }
}