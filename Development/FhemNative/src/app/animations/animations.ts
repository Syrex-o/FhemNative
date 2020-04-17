import { animation, keyframes, state, stagger, trigger, animateChild, group, transition, animate, style, query } from '@angular/animations';

interface KeyValue {
	[key: string]: string | number;
}

// reusable timing operations
const timing: KeyValue = {
	easeOut: 'ease-out',
	easeIn: 'ease-in',
	easeInOutExpo: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
	easeInCirc: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
	easeOutCirc: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
	easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
};
// reusable speed operations
const speed: KeyValue = {
	light: '100ms',
	fast: '200ms',
	medium: '300ms',
	slow: '400ms',
	// stagger 
	stagger: '50ms'
};

const styles: { [key: string]: KeyValue } = {
	// show/hide
	show: { opacity: '1' },
	hide: {opacity: '0'},
	// translate Y
	Y0: {transform: 'translateY(0px)'},
	YLittle_N: {transform: 'translateY(-15px)'},
	YLittle_P: {transform: 'translateY(15px)'},
	// translate X
	X0: {transform: 'translateX(0px)'},
	XLittle_N: {transform: 'translateX(-15px)'},
	XLittle_P: {transform: 'translateX(15px)'},
	// translate both
	XY0: {transform: 'translate(0, 0)'},
	XY50: {transform: 'translate(-50%, -50%)'},
	X0Y100_P: {transform: 'translate(0%, 100%)'},
	X0Y100_N: {transform: 'translate(0%, -100%)'},
	// scale and translate
	S0XY_Center: {transform: 'scale(0) translate(-50%, -50%)'},
	S1XY_Center: {transform: 'scale(1) translate(-50%, -50%)'},
	SX0XY_Center: {transform: 'scaleX(0) translate(-50%, -50%)'},
	SX1XY_Center: {transform: 'scaleX(1) translate(-50%, -50%)'},
	SY0XY_Center: {transform: 'scaleY(0) translate(-50%, -50%)'},
	SY1XY_Center: {transform: 'scaleY(1) translate(-50%, -50%)'},
	// scale
	S0: {transform: 'scale(0)'},
	S1: {transform: 'scale(1)'},
	SX0: {transform: 'scaleX(0)'},
	SX1: {transform: 'scaleX(1)'},
	SY0: {transform: 'scaleY(0)'},
	SY1: {transform: 'scaleY(1)'},
	// transform Origin
	O_TopLeft: {transformOrigin: 'top left'}
}

// style combiner
function styleCombiner(arr: Array<KeyValue>){
	return style(arr.reduce((obj, item) => (
		obj[Object.keys(item)[0]] = item[Object.keys(item)[0]], obj) ,{}
	));
}

// combine speed and timing
function animCombiner(speed: string|number, timing: string|number, style?:any){
	const combine: string =  speed + ' ' + timing;
	return style ? animate(combine, style) : animate(combine);
}

// Side Menu Items Animation
export const menuStagger = trigger('menuStagger', [
	transition('* <=> *', [
		query(':enter', [
           	style({ opacity: 0, transform: 'translateY(-15px)' }),
           	stagger(
           		speed.stagger,
           		// animate('200ms ease-out',style({ opacity: 1, transform: 'translateY(0px)' }))
           		animCombiner(speed.light, timing.easeOut, styleCombiner([styles.show, styles.Y0]))
           	)
         	],{ optional: true }),
       	query(':leave', [
       		animCombiner(speed.light, timing.easeOut, styleCombiner([styles.hide, styles.YLittle_N]))
       	],{ optional: true })	
    ])
]);

// Popup/Picker container Animation
export const PopupPicker = trigger('PopupPicker', [
	transition(':enter', [
		style(styles.hide),
		group([
			query('@*', animateChild(), { optional: true }),
			animCombiner(speed.fast, timing.easeOut, style(styles.show))
		])
	]),
	transition(':leave', group([
		query('@*', animateChild(), { optional: true }),
		animCombiner(speed.medium, timing.easeOut, style(styles.hide))
	]))
]);

// Popup content Animation based on animation property
export const PopupContent = trigger('PopupContent', [
	// states
	state('scale, scale-invert, jump-in, jump-in-invert', styleCombiner([ styles.S1XY_Center, styles.O_TopLeft ])),
	state('scale-x, scale-x-invert', styleCombiner([ styles.SX1XY_Center, styles.O_TopLeft ])),
	state('scale-y, scale-y-invert', styleCombiner([ styles.SY1XY_Center, styles.O_TopLeft ])),
	state('from-top, from-top-invert, from-bottom, from-left, from-right', style(styles.XY50)),
	state('flip-in-x, flip-in-y, flip-in-x-invert, flip-in-y-invert', style({
			transform: 'translate(-50%, -50%) perspective(400px)'
	})),
	// Scale
	transition('* => scale, * => scale-invert', [
		styleCombiner([ styles.S0XY_Center, styles.O_TopLeft ]),
		animCombiner(speed.medium, timing.easeOutCirc)
	]),
	transition('scale => void', animCombiner( 
		speed.medium, timing.easeOutCirc, 
		styleCombiner([ styles.S0XY_Center, styles.O_TopLeft ]) 
	)),
	// Scale X
	transition('* => scale-x, * => scale-x-invert', [
		styleCombiner([ styles.SX0XY_Center, styles.O_TopLeft ]),
		animCombiner(speed.medium, timing.easeInCirc)
	]),
	transition('scale-x => void', animCombiner( 
		speed.medium, timing.easeOutCirc, 
		styleCombiner([ styles.SX0XY_Center, styles.O_TopLeft ]) 
	)),
	transition('scale-x-invert => void', animCombiner( 
		speed.medium, timing.easeOutCirc, 
		styleCombiner([ {transform: 'scaleX(1.3) translate(-50%, -50%)'}, styles.O_TopLeft ]) 
	)),
	// Scale Y
	transition('* => scale-y, * => scale-y-invert', [
		styleCombiner([ styles.SY0XY_Center, styles.O_TopLeft ]),
		animCombiner(speed.medium, timing.easeInCirc)
	]),
	transition('scale-y => void', animCombiner( 
		speed.medium, timing.easeOutCirc, 
		styleCombiner([ styles.SY0XY_Center, styles.O_TopLeft ]) 
	)),
	transition('scale-y-invert => void', animCombiner( 
		speed.medium, timing.easeOutCirc, 
		styleCombiner([ {transform: 'scaleY(1.3) translate(-50%, -50%)'}, styles.O_TopLeft ]) 
	)),
	// From top
	transition('* => from-top, * => from-top-invert', [
		style({transform: 'translate(-50%, -150%)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('from-top => void, from-bottom-invert => void', animCombiner( 
		speed.medium, timing.easeIn, 
		style({transform: 'translate(-50%, -150%)'}) 
	)),
	// From bottom
	transition('* => from-bottom, * => from-bottom-invert', [
		style({transform: 'translate(-50%, 150%)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('from-bottom => void, from-top-invert => void', animCombiner(
		speed.medium, timing.easeOut, 
		style({transform: 'translate(-50%, 150%)'})
	)),
	// From left
	transition('* => from-left, * => from-left-invert', [
		style({transform: 'translate(-150%, -50%)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('from-left => void, from-right-invert => void', animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(-150%, -50%)'})
	)),
	// From right
	transition('* => from-right, * => from-right-invert', [
		style({transform: 'translate(150%, -50%)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('from-right => void, from-left-invert => void',animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(150%, -50%)'})
	)),
	// Jump-in
	transition('* => jump-in, * => jump-in-invert', [
		style({
			transform: 'scale(1.3) translate(-50%, -50%)',
			transformOrigin: 'left top'
		}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('jump-in => void, scale-invert => void', animCombiner(
		speed.medium, timing.easeOut,
		style({
			transform: 'scale(1.3) translate(-50%, -50%)',
			transformOrigin: 'left top'
		})
	)),
	transition('jump-in-invert => void', animCombiner(
		speed.medium, timing.easeOut,
		style({
			transform: 'scale(0.7) translate(-50%, -50%)',
			transformOrigin: 'left top'
		}),
	)),
	// Flip in x
	transition('* => flip-in-x, * => flip-in-x-invert', [
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(1, 0, 0, -90deg)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('flip-in-x => void', animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(1, 0, 0, -90deg)'})
	)),
	transition('flip-in-x-invert => void', animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(1, 0, 0, 90deg)'})
	)),
	// Flip in y
	transition('* => flip-in-y, * => flip-in-y-invert', [
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(0, 1, 0, -90deg)'}),
		animCombiner(speed.medium, timing.easeOut)
	]),
	transition('flip-in-y => void',animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(0, 1, 0, -90deg)'})
	)),
	transition('flip-in-y-invert => void',animCombiner(
		speed.medium, timing.easeOut,
		style({transform: 'translate(-50%, -50%) perspective(400px) rotate3d(0, 1, 0, 90deg)'})
	))
]);

// Picker content Animation based on animation property
export const PickerContent = trigger('PickerContent', [
	state('from-top', style(styles.XY0)),
	state('from-bottom', styleCombiner([ styles.XY0, {bottom: 0} ])),
	// From top
	transition('* => from-top', [
		style(styles.X0Y100_N),
		animCombiner(speed.medium, timing.easeInCirc)
	]),
	transition('from-top => void', animCombiner(
		speed.medium, timing.easeOutCirc,
		style(styles.X0Y100_N)
	)),
	// From bottom
	transition('* => from-bottom', [
		styleCombiner([ styles.X0Y100_P, {bottom: 0} ]),
		animCombiner(speed.medium, timing.easeInCirc)
	]),
	transition('from-bottom => void', animCombiner(
		speed.medium, timing.easeOutCirc,
		styleCombiner([ styles.X0Y100_P, {bottom: 0} ])
	))
])

// unfold animation stagger
export const Unfold = trigger('Unfold', [
	transition(':enter', [
		style({height: '0px'}),
		animCombiner(speed.fast, timing.easeOut, style({height: 'auto'}))
	]),
	transition(':leave', animCombiner(speed.fast, timing.easeOut, style({height: '0px'})))
])