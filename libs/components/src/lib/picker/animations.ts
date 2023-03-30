import { animate, animateChild, query, style, transition, trigger, group } from "@angular/animations";

export const PickerOpacity = trigger('PickerOpacity', [
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

export const PickerContent = trigger('PickerContent', [
    transition(':enter', [
		style({transform: 'translateY(150%)'}),
        animate('300ms ease-out'),
	]),
	transition(':leave', [
        animate('300ms ease-in'),
        style({transform: 'translateY(150%)'})
    ])
]);