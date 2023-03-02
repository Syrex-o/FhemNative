import { trigger, transition, style, query, animateChild, group, animate } from '@angular/animations';

// show/hide
export const ShowHide = trigger('ShowHide', [
	transition(':enter', [
		style({ opacity: 0 }),
		group([
			animate('200ms ease-out', style({ opacity: 1 })),
			query('@*', animateChild(), { optional: true })
		])
	]),
	transition(':leave', [
		style({ opacity: 1 }),
		group([
			animate('200ms ease-out', style({ opacity: 0 })),
			query('@*', animateChild(), { optional: true })
		])
	])
]);