import { AfterViewInit, Component, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Route, Router, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { map } from "rxjs";

import { SandboxStructureService } from "@fhem-native/pages";

@Component({
    standalone: true,
	selector: 'fhem-native-website-playground',
	templateUrl: 'playground.page.html',
	styleUrls: ['playground.page.scss'],
    imports: [
        CommonModule,
        RouterModule, IonicModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class PlaygroundPageComponent implements AfterViewInit{
    routeChange$ = this.route.queryParamMap.pipe(
        map(()=> this.router.navigateByUrl('/sandbox',{skipLocationChange:true}))
    )

    constructor(private route: ActivatedRoute, private router: Router, private structure: SandboxStructureService){}

    ngAfterViewInit(): void {
        if(!('UID' in this.route.snapshot.queryParams)) this.structure.changeRoom(this.structure.rooms[0]);
    }
}

export const PLAYGROUND_ROUTES: Route[] = [
    {
        path: '',
        component: PlaygroundPageComponent,
        children: [
            {
                path: '',
                loadChildren: ()=> import('@fhem-native/pages').then(mod=> mod.SandboxPageModule)
            }
        ]
    }
];