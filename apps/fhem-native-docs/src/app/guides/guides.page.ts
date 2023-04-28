import { Component } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { GuidePageComponent } from "./guide/guide.page";

import { OverviewComponent } from "../components/overview/overview.component";
import { GUIDE_ITEMS } from "../shared/app-config";

@Component({
    standalone: true,
	selector: 'fhem-native-website-guides',
	templateUrl: 'guides.page.html',
	styleUrls: ['guides.page.scss'],
    imports: [
        RouterModule,
        OverviewComponent
    ]
})
export class GuidesPageComponent {
    overviewItems = GUIDE_ITEMS.slice(1, GUIDE_ITEMS.length);
}

export const GUIDES_ROUTES: Route[] = [
    {
        path: '',
        component: GuidesPageComponent,
        children: [
            {
                path: ':guide',
                component: GuidePageComponent
            }
        ]
    }
];