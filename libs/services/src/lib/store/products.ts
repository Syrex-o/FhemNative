import 'cordova-plugin-purchase';

export interface Product {
    id: string,
    type: CdvPurchase.ProductType,
    platform: CdvPurchase.Platform
}

export const PRODUCTS: Product[] = [
    {
        id: 'membership_monthly_1',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
    }
];