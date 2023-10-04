import { Injectable } from '@angular/core';

import { IonAnimation, IonAnimationService } from './ion-animation.service';

@Injectable()
export class IonPickerAnimationService extends IonAnimationService{
	// BEGIN - BOTTOM Section
	private fromBottomIn = (baseEl: HTMLElement) => {
		const root = baseEl.shadowRoot;
		if(!root) return;

		const backdrop = root.querySelector('ion-backdrop');
		const wrapper = root.querySelector('.modal-wrapper');
		if(!wrapper || !backdrop) return;
	
		const backdropAnimation = this.animCtrl.create().addElement(backdrop)
			.fromTo('opacity', '0.01', 'var(--backdrop-op)');
	
		const wrapperAnimation = this.animCtrl.create().addElement(wrapper)
			.keyframes([
				{ offset: 0, opacity: 0.01, transform: 'translateY(40px)' },
				{ offset: 1, opacity: 1, transform: `translateY(0px)` },
			]);
	
		return this.animCtrl.create()
			.addElement(baseEl)
			.easing('cubic-bezier(0.36,0.66,0.04,1)')
			.duration(280)
			.addAnimation([backdropAnimation, wrapperAnimation]);
	};

	private fromBottomOut = (baseEl: HTMLElement) => {
		return this.fromBottomIn(baseEl)?.direction('reverse');
	};
	// END - BOTTOM Section

	// BEGIN - RIGHT Section
	private fromRightIn = (baseEl: HTMLElement) => {
		const root = baseEl.shadowRoot;
		if(!root) return;

		const backdrop = root.querySelector('ion-backdrop');
		const wrapper = root.querySelector('.modal-wrapper');
		if(!wrapper || !backdrop) return;
	
		const backdropAnimation = this.animCtrl.create().addElement(backdrop)
			.fromTo('opacity', '0.01', 'var(--backdrop-op)');
	
		const wrapperAnimation = this.animCtrl.create().addElement(wrapper)
			.keyframes([
				{ offset: 0, opacity: 0.01, transform: 'translateX(100%)' },
				{ offset: 1, opacity: 1, transform: `translateY(0%)` },
			]);
	
		return this.animCtrl.create()
			.addElement(baseEl)
			.easing('ease')
			.duration(200)
			.addAnimation([backdropAnimation, wrapperAnimation]);
	}; 

	private fromRightOut = (baseEl: HTMLElement) => {
		return this.fromRightIn(baseEl)?.direction('reverse');
	};
	// END - RIGHT Section

	// BEGIN - LEFT Section
	private fromLeftIn = (baseEl: HTMLElement) => {
		const root = baseEl.shadowRoot;
		if(!root) return;

		const backdrop = root.querySelector('ion-backdrop');
		const wrapper = root.querySelector('.modal-wrapper');
		if(!wrapper || !backdrop) return;
	
		const backdropAnimation = this.animCtrl.create().addElement(backdrop)
			.fromTo('opacity', '0.01', 'var(--backdrop-op)');
	
		const wrapperAnimation = this.animCtrl.create().addElement(wrapper)
			.keyframes([
				{ offset: 0, opacity: 0.01, transform: 'translateX(-100%)' },
				{ offset: 1, opacity: 1, transform: `translateY(0%)` },
			]);
	
		return this.animCtrl.create()
			.addElement(baseEl)
			.easing('ease')
			.duration(200)
			.addAnimation([backdropAnimation, wrapperAnimation]);
	}; 

	private fromLeftOut = (baseEl: HTMLElement) => {
		return this.fromLeftIn(baseEl)?.direction('reverse');
	};
	// END - LEFT Section

	// set animations
	override animLib: IonAnimation[] = [
		{ key: 'fromBottomIn', func: this.fromBottomIn },
		{ key: 'fromBottomOut', func: this.fromBottomOut },

		{ key: 'fromRightIn', func: this.fromRightIn },
		{ key: 'fromRightOut', func: this.fromRightOut },

		{ key: 'fromLeftIn', func: this.fromLeftIn },
		{ key: 'fromLeftOut', func: this.fromLeftOut }
	];
}