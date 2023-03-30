import { animate, animateChild, query, style, transition, trigger, group } from "@angular/animations";

export const PopupOpacity = trigger('PopupOpacity', [
	transition(':enter', [
		style({opacity: 0}),
        group([
            animate('200ms ease-out', style({opacity: 1})),
		    query('@*', animateChild(), { optional: true })
        ])
	]),
	transition(':leave', [
        group([
            query('@*', animateChild(), { optional: true }),
            animate('300ms ease-out', style({opacity: 0}))
        ])
	])
]);

export const PopupContent = trigger('PopupContent', [
    transition(':enter', [
		style({transform: 'translate(-50%, -50%) scale(0)'}),
        animate('300ms ease-out', style({transform: 'translate(-50%, -50%) scale(1)'}))
	]),
	transition(':leave', [
        style({transform: 'translate(-50%, -50%) scale(1)'}),
        animate('300ms ease-in', style({transform: 'translate(-50%, -50%) scale(0)'}))
    ])
]);