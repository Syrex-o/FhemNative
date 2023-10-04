import { Injectable, inject } from '@angular/core';

import { AnimationController } from '@ionic/angular';

const ION_ANIMATION = {
    // popup animations
    POPUP_scaleIn: 'scaleIn',
    POPUP_scaleOut: 'scaleOut',
    // picker animations
    PICKER_fromBottomIn: 'fromBottomIn',
    PICKER_fromBottomOut: 'fromBottomOut',
    
    PICKER_fromRightIn: 'fromRightIn',
    PICKER_fromRightOut: 'fromRightOut',

    PICKER_fromLeftIn: 'fromLeftIn',
    PICKER_fromLeftOut: 'fromLeftOut',
} as const;

export type IonAnimationName = (typeof ION_ANIMATION)[keyof typeof ION_ANIMATION];

export interface IonAnimation {
    key: IonAnimationName,
    func: (baseEl: HTMLElement) => any
}

@Injectable()
export class IonAnimationService {
    protected animCtrl = inject(AnimationController);

    protected animLib: IonAnimation[] = [];

    public getAnimation(ainmationKey: IonAnimationName){
        return this.animLib.find(x=> x.key === ainmationKey)?.func;
    }
}