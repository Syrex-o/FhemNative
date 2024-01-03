import { ComponentCategories } from '@fhem-native/app-config';

import { NavItem } from '@fhem-native/types/docs';
import { toTitleCase } from '@fhem-native/utils';

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
    },
    {   
        name: 'WEB.DOCS.ITEMS.SHORTCUTS.HEAD',
        info: 'WEB.DOCS.ITEMS.SHORTCUTS.INFO',
        icon: 'arrow-redo-outline',
        ref: ['/', 'docs', 'shortcuts']
    }
];

export const GUIDE_ITEMS = [
    {
        name: 'WEB.GUIDES.ITEMS.OVERVIEW.HEAD',
        icon: 'apps-outline',
        ref: ['/', 'guides']
    },
    {   
        name: 'WEB.GUIDES.ITEMS.CREATE.HEAD',
        info: 'WEB.GUIDES.ITEMS.CREATE.INFO',
        icon: 'pencil-outline',
        ref: ['/', 'guides', 'create']
    }
];

export const COMP_ITEMS: NavItem[] = getCompItems();

export const NAV_ITEMS: NavItem[] = [
    {
        name: 'WEB.DOCS.HEAD',
        subItems: DOC_ITEMS
    },
    {
        name: 'WEB.GUIDES.HEAD',
        subItems: GUIDE_ITEMS
    },
    {
        name: 'WEB.COMPS.HEAD',
        subItems: COMP_ITEMS
    },
    {
        name: 'Playground',
        icon: 'dice-outline',
        ref: ['/', 'sandbox']
    },
    {
        name: 'Config Converter',
        icon: 'swap-horizontal-outline',
        ref: ['/', 'config-converter']
    },
    {
        name: 'Icons',
        icon: 'happy-outline',
        ref: ['/', 'icons']
    }
];

function getCompItems(): NavItem[] {
    const baseRoute = ['/', 'components'];
    const baseTranslateKey = 'MENUS.CREATE_COMPONENT.COMPONENT_NAMES.';

    const compItems: NavItem[] = [{
        name: 'WEB.COMPS.ITEMS.OVERVIEW.HEAD',
        icon: 'apps-outline',
        ref: ['/', 'components']
    }];

    const compNames = Object.values(ComponentCategories)
        .map(x=> x.components)
        .reduce((prev, next)=> prev.concat(next))
        .sort();

    for(let i = 0; i < compNames.length; i++){
        compItems.push({
            name: baseTranslateKey + compNames[i],
            info: 'COMPONENTS.'+ toTitleCase(compNames[i]) +'.INFO',
            icon: 'cube-outline',
            ref: [...baseRoute, compNames[i].toLowerCase()]
        });
    }
    return compItems;
}