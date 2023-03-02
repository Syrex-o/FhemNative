import { createAnimation } from "@ionic/core";

export function pageTransition(_: HTMLElement, opts: any) {
	const DURATION = 300;
	const rootTransition = createAnimation().duration(opts.duration || DURATION).easing('cubic-bezier(0.3,0,0.66,1)');

	const enteringPage = createAnimation().addElement(opts.enteringEl);
	const leavingPage = createAnimation().addElement(opts.leavingEl);

	enteringPage.fromTo('opacity', '0', '1');
	leavingPage.fromTo('opacity', '1', '0');

	enteringPage.fromTo('transform', 'translateX(100%)', 'translateX(0)');
	leavingPage.fromTo('transform', 'translateX(0)', 'translateX(-100%)');

	rootTransition.addAnimation([enteringPage, leavingPage]);
	return rootTransition;
}