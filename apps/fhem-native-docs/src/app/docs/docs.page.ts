import { Component } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { DocPageComponent } from "./doc/doc.page";

import { OverviewComponent } from "../components/overview/overview.component";
import { DOC_ITEMS } from "../shared/app-config";

@Component({
    standalone: true,
	selector: 'fhem-native-website-docs',
	templateUrl: 'docs.page.html',
	styleUrls: ['docs.page.scss'],
    imports: [
        RouterModule,
        OverviewComponent
    ]
})
export class DocsPageComponent {
    overviewItems = DOC_ITEMS.slice(1, DOC_ITEMS.length);
}

export const DOCS_ROUTES: Route[] = [
    {
        path: '',
        component: DocsPageComponent,
        children: [
            {
                path: ':doc',
                component: DocPageComponent
            }
        ]
    }
];