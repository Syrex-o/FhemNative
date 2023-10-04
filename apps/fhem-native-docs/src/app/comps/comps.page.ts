import { Component } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { CompPageComponent } from "./comp/comp.page"; 

import { OverviewComponent } from "../components/overview/overview.component";
import { COMP_ITEMS } from "../shared/app-config";

@Component({
    standalone: true,
	selector: 'fhem-native-website-comps',
	templateUrl: 'comps.page.html',
	styleUrls: ['comps.page.scss'],
    imports: [
        RouterModule,
        OverviewComponent
    ]
})
export class CompsPageComponent {
    overviewItems = COMP_ITEMS.slice(1, COMP_ITEMS.length);
}

export const COMPS_ROUTES: Route[] = [
    {
        path: '',
        component: CompsPageComponent,
        children: [
            {
                path: ':comp',
                component: CompPageComponent
            }
        ]
    }
];