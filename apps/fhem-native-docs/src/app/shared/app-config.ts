import { NavItem } from '@fhem-native/types/docs';

export const DOC_ITEMS: NavItem[] = [
    {
        name: 'WEB.DOCS.ITEMS.OVERVIEW.HEAD',
        icon: 'apps-outline',
        ref: ['/', 'docs']
    },
    {   
        name: 'WEB.DOCS.ITEMS.INSTALL.HEAD',
        info: 'WEB.DOCS.ITEMS.INSTALL.INFO',
        icon: 'download-outline',
        ref: ['/', 'docs', 'install']
    },
    {   
        name: 'WEB.DOCS.ITEMS.SECURE.HEAD',
        info: 'WEB.DOCS.ITEMS.SECURE.INFO',
        icon: 'lock-closed-outline',
        ref: ['/', 'docs', 'secure']
    },
    {   
        name: 'WEB.DOCS.ITEMS.EXTERNAL.HEAD',
        info: 'WEB.DOCS.ITEMS.EXTERNAL.INFO',
        icon: 'wifi-outline',
        ref: ['/', 'docs', 'external']
    }
];

export const NAV_ITEMS: NavItem[] = [
    {
        name: 'Docs',
        subItems: DOC_ITEMS
    },
    {
        name: 'Playground',
        icon: 'dice-outline',
        ref: ['/', 'sandbox']
    }
];