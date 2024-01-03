import { Injectable } from '@angular/core';

// Plugins
import 'cordova-plugin-purchase';
import { PRODUCTS } from './products';

@Injectable({providedIn: 'root'})
export class StoreService {
    private store?: CdvPurchase.Store;

    public initialize(){
        if(this.store) return;

        const {store, Platform} = CdvPurchase;

        this.store = store;
        this.store.register(PRODUCTS);

        this.store.when().productUpdated(this.demo)

        this.store.initialize([Platform.TEST]);
    }

    private demo(){
        // const {store, ProductType, Platform} = CdvPurchase;
        // const myProduct = store.get('my_product', Platform.TEST);
    }
}