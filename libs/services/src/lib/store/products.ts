import { ProductEntry } from "./store.service";

export const PRODUCTS: ProductEntry[] = [
    // PlayStore
    {
        id: 'membership_monthly_1',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
    },
    {
        id: 'membership_monthly_2',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
    },
    {
        id: 'membership_monthly_5',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
    },
    {
        id: 'membership_monthly_10',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY
    },
    // AppStore
    {
        id: 'membership_monthly_1',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE
    },
    {
        id: 'membership_monthly_2',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE
    },
    {
        id: 'membership_monthly_5',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE
    },
    {
        id: 'membership_monthly_10',
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE
    },
];