import { trigger, animateChild, group, transition, animate, style, query } from '@angular/animations';

export const ShowHide = trigger('ShowHide', [
	transition(':enter', [
		style({ opacity: 0 }),
		group([
			animate('300ms ease-out', style({ opacity: 1 })),
			query('@*', animateChild(), { optional: true })
		])
	]),
	transition(':leave', [
		style({ opacity: 1 }),
		group([
			query('@*', animateChild(), { optional: true }),
			animate('300ms ease-out', style({ opacity: 0 }))
		])
	])
]);

export const SlideMenu = trigger('SlideMenu', [
	transition(':enter', [
		style({ transform: 'translateX(-100%)' }),
		group([
			query('@*', animateChild(), { optional: true }),
			animate('300ms ease-out', style({ transform: 'translateX(0%)' }))
		])
	]),
	transition(':leave', [
		style({ transform: 'translateX(0%)' }),
		group([
			query('@*', animateChild(), { optional: true }),
			animate('300ms ease-out', style({ transform: 'translateX(-100%)' }))
		])
	])
]);