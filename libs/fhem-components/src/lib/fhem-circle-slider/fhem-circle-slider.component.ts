import { Component, Input, ViewChild } from '@angular/core';

import { FhemComponent, FhemComponentModule } from '../_fhem-component';
import { MoverModule, WhileMoveEvent } from '@fhem-native/directives';

import { FhemService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

import { animateMove, getValuePercentage, toValueNumber } from '@fhem-native/utils';

@Component({
	standalone: true,
	imports: [ FhemComponentModule, MoverModule ],
	selector: 'fhem-native-component-circle-slider',
	templateUrl: './fhem-circle-slider.component.html',
	styleUrls: ['./fhem-circle-slider.component.scss'],
})
export class FhemCircleSliderComponent{
    @ViewChild('COMPONENT', {read: FhemComponent, static: false}) component: FhemComponent|undefined;

    // meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

    // Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;

    @Input() threshold!: number;

    @Input() label!: string;
    @Input() labelExtension!: string;
    @Input() textSize!: number;
    @Input() labelTopPos!: number;
    @Input() labelLeftPos!: number;

    @Input() bottomAngle!: number;
    @Input() arcThickness!: number;
    @Input() thumbRadius!: number;
    @Input() thumbBorder!: number;

    @Input() step!: number;
    @Input() min!: number;
    @Input() max!: number;

    // Styling
	@Input() backgroundColor!: string;
	@Input() circleBackgroundColor!: string;
	@Input() labelColor!: string;
    @Input() thumbColor!: string;

	// Gradient Styling
	@Input() fillColors!: string[];

	// Bool
    @Input() updateOnMove!: boolean;
    @Input() customLabelPosition!: boolean;

    // circle slider settings
    VIEW_BOX_SIZE = 300;
    scaleFactor = 1;
    bottomAngleRad = 0;
    radius = 100;
    translateXValue = 0;
	translateYValue = 0;
	thickness = 6;
	pinRadius = 10;
	pinVisible = false;

    styles: Record<string, any> = {
        viewBox: '0 0 300 300',
		arcTranslateStr: 'translate(0, 0)',
		clipPathStr: '',
		gradArcs: [],
		nonSelectedArc: {},
		thumbPosition: { x: 0, y: 0 },
		blurRadius: 15,
		translateBg: 'translate(0, 0)',
    };
    
    // movement
    private center = {x: 0, y: 0};

    value = 0;
    fhemDevice: FhemDevice|undefined;

    constructor(private fhem: FhemService){}

    initialize(): void{
        // set initial values
        this.value = this.min;
		this.step = this.step > 0 ? this.step : 0.1;
        this.bottomAngleRad = Math.PI * this.bottomAngle / 180;
        this.label = this.label !== '' ? this.label : this.device;
    }

    setFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
        this.value = device.readings[this.reading].Value || this.min;
        this.invalidate();
		animateMove(this.min, this.value, (num)=> {
			this.value = num;
			this.invalidatePinPosition(num);
		});
	}

    updateFhemDevice(device: FhemDevice): void{
        this.fhemDevice = device;
		const updateValue = this.fhemDevice.readings[this.reading].Value;
		const oldValue: number = this.value;
		if (updateValue !== this.value) {
			this.value = updateValue;
			animateMove(oldValue, this.value, (num)=>  {
				this.value = num;
				this.invalidatePinPosition();
			});
		}
    }

    startMove(): void{
        const rect = this.component?.elem?.nativeElement.getBoundingClientRect();
        if(!rect) return;

        this.center.x = rect.left + rect.width / 2;
        this.center.y = rect.top + rect.height / 2;
    }

    whileMove(event: WhileMoveEvent): void{
        let actualAngle = Math.atan2(this.center.x - event.current.x, event.current.y - this.center.y);
        if (actualAngle < 0) actualAngle = actualAngle + 2 * Math.PI;

        let relativeValue = 0;
        if (actualAngle < this.bottomAngleRad / 2) {
			relativeValue = 0;
		} else if (actualAngle > 2 * Math.PI - this.bottomAngleRad / 2) {
			relativeValue = 1;
		} else {
			relativeValue = (actualAngle - this.bottomAngleRad / 2) / (2 * Math.PI - this.bottomAngleRad);
		}

        const value = toValueNumber(relativeValue, this.min, this.max, this.step);
        this.value = parseFloat(value.toFixed(1));
        this.invalidatePinPosition();

		// check for trigger
		if(event.triggerEvent) this.sendValue(this.value);
    }

	endMove(): void{
		this.sendValue(this.value);
	}

	private sendValue(value: number): void{
		if(!this.fhemDevice) return;
		if(this.fhemDevice.readings[this.reading].Value === value) return;

		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, value);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, value);
	}

    updateScales(): void{
        this.invalidate();
    }

    private invalidate(): void{
        this.calculateVars();
        this.invalidateClipPathStr();
        this.invalidatePinPosition();
        this.invalidateGradientArcs();
    }

    private calculateVars(): void{
        const dims = {width: this.component?.elem?.nativeElement.clientWidth || 0, height: this.component?.elem?.nativeElement.clientHeight || 0}
        const halfAngle = this.bottomAngleRad / 2;
        const svgAreaFactor = dims.height && dims.width / dims.height || 1;

        this.VIEW_BOX_SIZE = Math.max(dims.width, dims.height);
        const svgHeight = this.VIEW_BOX_SIZE / svgAreaFactor;

        const thumbMaxRadius = this.thumbRadius * 2;
        const thumbMargin = 2 * thumbMaxRadius > this.arcThickness ? (thumbMaxRadius - this.arcThickness / 2) / this.scaleFactor : 0;

        this.scaleFactor = Math.max(dims.width, dims.height) / this.VIEW_BOX_SIZE || 1;
		this.styles['viewBox'] = `0 0 ${this.VIEW_BOX_SIZE} ${svgHeight}`;

        const circleFactor = this.bottomAngleRad <= Math.PI ? ( 2 / (1 + Math.cos(halfAngle)) ) : ( 2 * Math.sin(halfAngle) / (1 + Math.cos(halfAngle)) );

        if (circleFactor > svgAreaFactor) {
			if (this.bottomAngleRad > Math.PI) {
				this.radius = (this.VIEW_BOX_SIZE - 2 * thumbMargin) / (2 * Math.sin(halfAngle));
			} else {
				this.radius = this.VIEW_BOX_SIZE / 2 - thumbMargin;
			}
		} else {
			this.radius = (svgHeight - 2 * thumbMargin) / (1 + Math.cos(halfAngle));
		}

        this.thickness = this.arcThickness / this.scaleFactor;
		this.pinRadius = this.thumbRadius;

        this.translateXValue = this.VIEW_BOX_SIZE / 2 - this.radius;
		this.translateYValue = svgHeight / 2 - (this.radius - (this.thickness / 2));

        this.styles['arcTranslateStr'] = `translate(${this.translateXValue}, ${this.translateYValue})`;
		this.styles['translateBg'] = `translate(${(this.VIEW_BOX_SIZE / 2) - this.translateXValue}, ${(svgHeight / 2) - this.translateYValue })`;
    }

    private calculateClipPathSettings(): Record<string, any>{
		const halfAngle: number = this.bottomAngleRad / 2;
		const innerRadius: number = this.radius - this['thickness'];
		const xStartMultiplier: number = 1 - Math.sin(halfAngle);
		const yMultiplier: number = 1 + Math.cos(halfAngle);
		const xEndMultiplier: number = 1 + Math.sin(halfAngle);

		return {
			outer: {
				start: { x: xStartMultiplier * this.radius, y: yMultiplier * this.radius },
				end: { x: xEndMultiplier * this.radius, y: yMultiplier * this.radius },
				radius: this.radius,
			},
			inner: {
				start: { x: xStartMultiplier * innerRadius + this['thickness'], y: yMultiplier * innerRadius + this['thickness'] },
				end: { x: xEndMultiplier * innerRadius + this['thickness'], y: yMultiplier * innerRadius + this['thickness'] },
				radius: innerRadius,
			},
			thickness: this['thickness'],
			big: this.bottomAngleRad < Math.PI ? '1' : '0',
		};
	}

    private invalidateClipPathStr(): void{
        const s = this.calculateClipPathSettings();

		let path = `M ${s['outer'].start.x},${s['outer'].start.y}`; // Start at startangle top

		// Outer arc
		path += ` A ${s['outer'].radius},${s['outer'].radius} 0 ${s['big']} 1 ${s['outer'].end.x},${s['outer'].end.y}`;

		// Outer to inner connector
		path += ` A ${s['thickness'] / 2},${s['thickness'] / 2} 0 1 1 ${s['inner'].end.x},${s['inner'].end.y}`;

		// Inner arc
		path += ` A ${s['inner'].radius},${s['inner'].radius} 1 ${s['big']} 0 ${s['inner'].start.x},${s['inner'].start.y}`;

		// Outer to inner connector
		path += ` A ${s['thickness'] / 2},${s['thickness'] / 2} 0 1 1 ${s['outer'].start.x},${s['outer'].start.y}`;

		// Close path
		path += ' Z';
		this.styles['clipPathStr'] = path;
    }

    private invalidatePinPosition(customNumber?: number): void{
		const radiusOffset: number = this.thickness / 2;
		const curveRadius: number = this.radius - radiusOffset;
		const actualAngle: number = (2 * Math.PI - this.bottomAngleRad) * getValuePercentage(customNumber || this.value, this.min, this.max) + this.bottomAngleRad / 2;

		this.styles['thumbPosition'] = {
			x: curveRadius * (1 - Math.sin(actualAngle)) + radiusOffset,
			y: curveRadius * (1 + Math.cos(actualAngle)) + radiusOffset,
		};
		this.invalidateNonSelectedArc(customNumber);
	}

    private invalidateNonSelectedArc(customNumber?: number): void{
		const angle: number = this.bottomAngleRad / 2 + (1 - getValuePercentage(customNumber || this.value, this.min, this.max)) * (2 * Math.PI - this.bottomAngleRad);
		this.styles['nonSelectedArc'] = {
			color: this.backgroundColor,
			d: `M ${this.radius},${this.radius}
			 L ${this.radius},${3 * this.radius}
			 A ${2 * this.radius},${2 * this.radius}
			 1 ${angle > Math.PI ? '1' : '0'} 0
			 ${this.radius + this.radius * 2 * Math.sin(angle)},${this.radius + this.radius * 2 * Math.cos(angle)}
			 Z`
		};
	}

    private invalidateGradientArcs(): void{
		const radius = this.radius;

		const getArc = (des: {start: {x: number, y: number}, end: {x: number, y: number}, big: number}): string =>{
			return `M ${radius},${radius} L ${des.start.x},${des.start.y} A ${2 * radius},${2 * radius} 0 ${des.big} 1 ${des.end.x},${des.end.y} Z`;
		}

		const angleStep: number = (2 * Math.PI - this.bottomAngleRad) / this.fillColors.length;
		const s = this.calculateGradientConePaths(angleStep);

		this.styles['gradArcs'] = [];
		for (let i = 0; i < s.length; i++) {
			const si = s[i];
			const arcValue = getArc(si);
			this.styles['gradArcs'].push({ color: this.fillColors[i], d: arcValue });
		}
		this.styles['blurRadius'] = 2 * radius * Math.sin(angleStep / 6);
	}

    private calculateGradientConePaths(angleStep: number){
		const radius: number = this.radius;
		const calcX = (angle: number): number =>{ return radius * (1 - 2 * Math.sin(angle)); }
		const calcY = (angle: number): number =>{ return radius * (1 + 2 * Math.cos(angle)); }

		const gradArray: {start: {x: number, y: number}, end: {x: number, y: number}, big: number}[] = [];
		for (let i = 0, currentAngle = this.bottomAngleRad / 2; i < this.fillColors.length; i++, currentAngle += angleStep) {
			gradArray.push({
				start: { x: calcX(currentAngle), y: calcY(currentAngle) },
				end: { x: calcX(currentAngle + angleStep), y: calcY(currentAngle + angleStep) },
				big: Math.PI <= angleStep ? 1 : 0,
			});
		}
		return gradArray;
	}
}