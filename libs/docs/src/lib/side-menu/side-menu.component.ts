import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { TextBlockModule } from '@fhem-native/components';

import { NavItem } from '@fhem-native/types/docs';

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

    constructor(public menuCtrl: MenuController){}

    ngOnInit(): void{
        this.menuItemsMapped = this.menuItems.map(x=> Object.assign(x, {state: false}));
    }
}