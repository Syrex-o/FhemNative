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

    for( const compCategory of Object.values(ComponentCategories)){
        for(let i = 0; i < compCategory.components.length; i++){
            const compName = compCategory.components[i];
            compItems.push({
                name: baseTranslateKey + compName,
                info: 'COMPONENTS.'+ toTitleCase(compName) +'.INFO',
                icon: 'cube-outline',
                ref: [...baseRoute, compName.toLocaleLowerCase()]
            });
        }
    }

    return compItems;
}