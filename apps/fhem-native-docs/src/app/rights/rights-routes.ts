import { Route } from "@angular/router";

import { TermsPageComponent } from "./terms.component";
import { UsagePageComponent } from "./usage.component";
import { ImprintPageComponent } from "./imprint.component";
import { PrivacyPageComponent } from "./privacy.component";

export const RIGHTS_ROUTES: Route[] = [
    {
        path: '',
        children: [
            {
                path: 'terms',
                component: TermsPageComponent
            },
            {
                path: 'hinweis-zur-markennutzung',
                component: UsagePageComponent
            },
            {
                path: 'impressum',
                component: ImprintPageComponent
            },
            {
                path: 'datenschutz',
                component: PrivacyPageComponent
            },
        ]
    }
];