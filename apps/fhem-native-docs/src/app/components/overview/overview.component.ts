import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

import { NavItem } from '@fhem-native/types/docs';
import { filter, map, merge, Observable, of, tap } from 'rxjs';

interface Pagination {
    next: number,
    prev: number
}

interface Display {
    currentItem: number,
    pagination: Pagination
}

@Component({
    standalone: true,
	selector: 'fhem-native-docs-overview',
	templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
    imports: [ 
        IonicModule,
        CommonModule,
        RouterModule,
        TranslateModule
    ]
})
export class OverviewComponent implements OnInit{
    @Input() items: NavItem[] = [];

    itemRef$: Observable<Display> = of({currentItem: -1, pagination: {next: -1, prev: -1}});

    constructor(private router: Router){}

    ngOnInit(): void {
        this.itemRef$ = merge(
            of( this.getItemRef() ),
            this.router.events.pipe(
                filter((e): e is NavigationEnd => e instanceof NavigationEnd),
                map(()=> this.getItemRef())
            )
        );
    }

    private getItemRef(): Display{
        const baseUrl = this.router.url.split('#')[0].replace('%20', ' ');
        const activeIndex = this.items.findIndex(x=> (x.ref || []).join('/').slice(1) === baseUrl);
        let nextItem = -1, prevItem = -1
        if(activeIndex > -1){
            nextItem = this.items[activeIndex +1] ? activeIndex +1 : -1;
            prevItem = this.items[activeIndex -1] ? activeIndex -1 : -1;
        }

        return {
            currentItem: activeIndex, 
            pagination: { next: nextItem, prev: prevItem }
        };
    }
}