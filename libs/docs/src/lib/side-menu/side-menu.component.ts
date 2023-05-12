import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { TextBlockModule } from '@fhem-native/components';

import { NavItem } from '@fhem-native/types/docs';
import { filter, map, share, tap } from 'rxjs';

interface NavItemMapped extends NavItem {
    state: boolean
}

@Component({
    standalone: true,
	selector: 'fhem-native-doc-side-menu',
	templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.scss'],
    imports: [
        RouterModule,
        CommonModule,
        IonicModule,
        TranslateModule,
        TextBlockModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocSideMenuComponent implements OnInit{
    @Input() menuItems: NavItem[] = [];
    menuItemsMapped: NavItemMapped[] = [];
    
    menuCtrl = inject(MenuController);
    navEnd$ = inject(Router).events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        tap(e=> {
            const main = this.menuItemsMapped.find(x=> x.subItems?.find(y=> {
                const joined = y.ref?.join('/');
                if(!joined) return;
                return joined.substring(1, joined.length) === e.url;
            }));
            if(main) main.state = true;
        }),
        share()
    );

    ngOnInit(): void{
        this.menuItemsMapped = this.menuItems.map(x=> Object.assign(x, {state: false}));
    }
}