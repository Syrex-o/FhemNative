import { Injectable } from '@angular/core';

import { IonAnimation, IonAnimationService } from './ion-animation.service';

@Injectable()
export class IonPopupAnimationService extends IonAnimationService{
    private scaleIn = (baseEl: HTMLElement) => {
		const root = baseEl.shadowRoot;
		if(!root) return;

		const backdrop = root.querySelector('ion-backdrop');
		const wrapper = root.querySelector('.modal-wrapper');
		if(!wrapper || !backdrop) return;
	
		const backdropAnimation = this.animCtrl.create().addElement(backdrop)
			.fromTo('opacity', '0.01', 'var(--backdrop-op)');
	
		const wrapperAnimation = this.animCtrl.create().addElement(wrapper)
			.keyframes([
				{ offset: 0, opacity: '0', transform: 'scale(0)' },
				{ offset: 1, opacity: '0.99', transform: 'scale(1)' },
			]);
	
		return this.animCtrl.create()
			.addElement(baseEl)
			.easing('cubic-bezier(0.36,0.66,0.04,1)')
			.duration(280)
			.addAnimation([backdropAnimation, wrapperAnimation]);
	};

    private scaleOut = (baseEl: HTMLElement) => {
        return this.scaleIn(baseEl)?.direction('reverse');
    };

    // set animations
    override animLib: IonAnimation[] = [
        { key: 'scaleIn', func: this.scaleIn },
        { key: 'scaleOut', func: this.scaleOut }
    ];
}