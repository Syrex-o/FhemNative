import { Injectable, Type } from "@angular/core";
import { PopoverController } from "@ionic/angular";

import { ConextMenuProbs } from "@fhem-native/types/components";

@Injectable()
export class ContextMenuService {
    private contextMenuState = false;

    constructor(private popoverCtrl: PopoverController){}

    public async createContextMenu(comp: Type<any>, event: Event, dismissOnSelect: boolean, componentProps: ConextMenuProbs) {
        this.contextMenuState = true;

        const popover = await this.popoverCtrl.create({
			component: comp, event: event,
			mode: 'md', reference: 'event',
			dismissOnSelect: dismissOnSelect, 
            cssClass: 'context-menu-popover',
			componentProps: componentProps
		});

        await popover.present();
        const { role, data } = await popover.onWillDismiss();

        this.contextMenuState = false;

        return { role, data };
    }

    public getContextMenuState(){ 
        return this.contextMenuState; 
    }
}