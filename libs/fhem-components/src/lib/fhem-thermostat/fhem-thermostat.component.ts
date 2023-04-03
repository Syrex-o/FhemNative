import { Component, Input, ViewChild } from '@angular/core';

import { FhemComponent, FhemComponentModule } from '../_fhem-component';
import { MoverModule, WhileMoveEvent } from '@fhem-native/directives';
import { IconModule } from '@fhem-native/components';

import { FhemService } from '@fhem-native/services';

import { animateMove, getValuePercentage, restrictToRange, toValueNumber } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ FhemComponentModule, MoverModule, IconModule ],
	selector: 'fhem-native-component-thermostat',
	templateUrl: './fhem-thermostat.component.html',
	styleUrls: ['./fhem-thermostat.component.scss'],
})
export class FhemThermostatComponent{
	@ViewChild('COMPONENT', {read: FhemComponent, static: false}) component: FhemComponent|undefined;

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

	// Data
	@Input() device!: string;
	@Input() reading!: string;
	@Input() setReading!: string;
    @Input() displayReading!: string;

	@Input() threshold!: number;
	@Input() labelExtension!: string;

	@Input() steps!: number;
	@Input() min!: number;
	@Input() max!: number;

	// Selections
	@Input() sliderType!: string;

	// Styling
	@Input() backgroundColor!: string;
	@Input() tickColor!: string;

	@Input() heatingColor!: string;
	@Input() coolingColor!: string;

	@Input() labelColor!: string;

	@Input() gradientColor1!: string;
	@Input() gradientColor2!: string;
    @Input() gradientColor3!: string;
    @Input() gradientColor4!: string;

    @Input() tickGradientColor1!: string;
    @Input() tickGradientColor2!: string;

	// Bool
	@Input() updateOnMove!: boolean;
	@Input() enableAnimation!: boolean;

	private bounding!: DOMRect;
    private center = {x: 0, y: 0};
	styles: Record<string, any> = {
		// percentage movement
		move: 0,
		// rotation in deg
		rotation: 0,
		// multiply factor for movement
		factor: 100,
		// rotation substraction
		rotationSub: 0,
		// heater ticks
		heaterTicks: [],
		// tick styles
		viewBox: '0 0 300 300',
		radius: 0,
		tickAmount: 150,
		tickDeg: 300,
		offsetDegrees: 0,
		currentPos: [],
		tickDrawPos: [0, 0],
		tickPoints: [],
		tickPointsLarge: [],
		ticks: []
	};

	// desired temp
	value = 0;
	// current temp
	current = 0;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService){}

	initialize(): void{
		// set initial values
		this.value = this.min;
		this.steps = this.steps > 0 ? this.steps : 0.1;

		if(this.sliderType === 'thermostat'){
			this.styles['factor'] = 83;
            return;
		}
	}

	setFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
		this.value = device.readings[this.reading].Value || this.min;

        this.getCurrentValue();
        if(this.sliderType === 'tick') this.getSVGforTick();

		animateMove(this.min, this.value, (num)=> {
			this.value = num;
            const modNum = getValuePercentage(num, this.min, this.max) * this.styles['factor'];
			this.styles['move'] = modNum;

            if(this.sliderType === 'tick') this.updateTicks();
		});
	}

	updateFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
		const updateValue = this.fhemDevice.readings[this.reading].Value;
		const oldValue: number = this.value;
		
        this.value = updateValue;
		animateMove(oldValue, this.value, (num)=>  {
			this.value = num;
            const modNum = getValuePercentage(num, this.min, this.max) * this.styles['factor'];
			this.styles['move'] = modNum;
		});

        this.getCurrentValue();
        if(this.sliderType === 'tick') this.updateTicks();
	}

    private getSVGforTick(): void{
        const container = this.component?.elem?.nativeElement.getBoundingClientRect();
        if(!container) return;

        const viewBox = this.getViewbox(container);
        this.styles['viewBox'] = `0 0 ${viewBox} ${viewBox}`;
        this.styles['radius'] = viewBox / 2;

        // get number of ticks
		let ticks: number = Math.round(Math.min(container.width, container.height) / 2);
		ticks = ticks % 2 === 0 ? ticks : ticks -1;
		this.styles['tickAmount'] = ticks;
		this.drawTicks();
    }

    private getViewbox(container: DOMRect): number{
        return Math.max(container.width, container.height);
    }

    private drawTicks(): void{
        const container = this.component?.elem?.nativeElement.getBoundingClientRect();
        if(!container) return;

		const viewBox: number = this.getViewbox(container);
		const ticksOuterRadius: number = viewBox / 8;
		const ticksInnerRadius: number = viewBox / 5;
		this.styles['offsetDegrees'] = 180 - ( 360 - this.styles['tickDeg'] ) / 2;

		const theta: number = this.styles['tickDeg'] / this.styles['tickAmount'];
		const rangeValue: number = this.max - this.min;

		this.styles['ticks'] = [];
		this.styles['tickPoints'] = [
			[this.styles['radius']-1, ticksOuterRadius], [this.styles['radius']+1, ticksOuterRadius],
			[this.styles['radius']+1, ticksInnerRadius], [this.styles['radius']-1, ticksInnerRadius]
		];
		this.styles['tickPointsLarge'] = [
			[this.styles['radius']-1.5, ticksOuterRadius], [this.styles['radius']+1.5, ticksOuterRadius],
			[this.styles['radius']+1.5, ticksInnerRadius + 10], [this.styles['radius']-1.5, ticksInnerRadius + 10]
		];

		this.styles['currentPos'] = [
			this.styles['radius'], 
			ticksOuterRadius - (ticksOuterRadius - ticksInnerRadius)/2
		];

		const vMin: number = Math.min(this.current, this.value);
		const vMax: number = Math.max(this.current, this.value);
		const min: number = restrictToRange(Math.round(( vMin - this.min) / rangeValue * this.styles['tickAmount']),0, this.styles['tickAmount'] -1);
		const max: number = restrictToRange(Math.round(( vMax - this.min) / rangeValue * this.styles['tickAmount']), 0, this.styles['tickAmount'] - 1);

		for(let i = 0; i < this.styles['tickAmount']; i++){
			const isLarge: boolean = i == min || i == max;
			const isActive: boolean = i >= min && i <= max;
			const t: number = i * theta - this.styles['offsetDegrees'];

			this.styles['ticks'].push({
				t: t,
				d: this.pointsToPath( this.rotatePoints(isLarge ? this.styles['tickPointsLarge'] : this.styles['tickPoints'], t, [this.styles['radius'], this.styles['radius']]) ),
				class: isActive
			});
		}
		this.createCurrentTickTemp(rangeValue);
	}

    private updateTicks(): void{
		if(this.styles['ticks'].length > 0){
			const rangeValue: number = this.max - this.min;

			const vMin: number = Math.min(this.current, this.value);
			const vMax: number = Math.max(this.current, this.value);
			const min: number = restrictToRange(Math.round(( vMin - this.min) / rangeValue * this.styles['tickAmount']),0, this.styles['tickAmount'] -1);
			const max: number = restrictToRange(Math.round(( vMax - this.min) / rangeValue * this.styles['tickAmount']), 0, this.styles['tickAmount'] - 1);

			this.styles['ticks'].forEach((tick: any, i: number)=>{
				const isLarge: boolean = i == min || i == max;
				const isActive: boolean = i >= min && i <= max;

				// update
				tick.d = this.pointsToPath( this.rotatePoints(isLarge ? this.styles['tickPointsLarge'] : this.styles['tickPoints'], tick.t, [this.styles['radius'], this.styles['radius']]) );
				tick.class = isActive
			});
			this.createCurrentTickTemp(rangeValue);
		}
	}

    private createCurrentTickTemp(rangeValue: number): void{
		const padded: number = restrictToRange(this.current, this.min, this.max);
		let degs: number = this.styles['tickDeg'] * (padded - this.min) / rangeValue - this.styles['offsetDegrees'];

		if (padded > this.value) {
			degs += 15;
		}else{
			degs -= 15;
		}

		this.styles['tickDrawPos'] = this.rotatePoint(this.styles['currentPos'] ,degs, [this.styles['radius'], this.styles['radius']]);
	}

    private rotatePoint(point: any, angle: number, origin: any): number[] {
		const radians: number = angle * Math.PI/180;
		const x: number = point[0] - origin[0];
		const y: number = point[1] - origin[1];
		const x1: number = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
		const y1: number = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
		return [x1, y1];
	}

    private rotatePoints(points: any, angle: number, origin: any): number[]{
		return points.map((point: any)=>{
			return this.rotatePoint(point, angle, origin);
		});
	}

    private pointsToPath(points: Array<any>): string{
		return points.map((point, iPoint)=>{
			return (iPoint > 0?'L':'M') + point[0] + ' ' + point[1];
		}).join(' ')+'Z';
	}

    private getCurrentValue(): void{
        this.current = this.fhemDevice?.readings[this.displayReading].Value || this.value;
    }

	startMove(): void{
        const rect = this.component?.elem?.nativeElement.querySelector('.bounding')?.getBoundingClientRect();
		if(!rect) return;

        this.bounding = rect;
	}

    startTickMove(): void{
        const rect = this.component?.elem?.nativeElement.getBoundingClientRect();
        if(!rect) return;

        this.bounding = rect;
        this.center = { x: rect.left + (rect.width) / 2, y: rect.top + (rect.height) / 2 };
    }

	whileMove(event: WhileMoveEvent): void{
        if(!this.bounding) return;

        let value = toValueNumber( (event.current.y - this.bounding.top) / this.bounding.height, this.min, this.max, this.steps );
        value = this.max - (value - this.min);

        // min max
		if (value <= this.min) value = this.min;
		if (value >= this.max) value = this.max;

        this.styles['move'] = getValuePercentage(value, this.min, this.max) * this.styles['factor'];
        // update value
        this.value = parseFloat(value.toFixed(1));
        // check for trigger
		if(event.triggerEvent) this.sendValue(this.value);
	}

    whileTickMove(event: WhileMoveEvent): void{
        if(!this.bounding) return;

        let actualAngle = Math.atan2(this.center.x - event.current.x, event.current.y - this.center.y);
        if (actualAngle < 0) actualAngle = actualAngle + 2 * Math.PI;

        const openRad = Math.PI * 60 / 180;
        let relativeValue = 0;
		if (actualAngle < openRad / 2) {
			relativeValue = 0;
		} else if (actualAngle > 2 * Math.PI - openRad / 2) {
			relativeValue = 1;
		} else {
			relativeValue = (actualAngle - openRad / 2) / (2 * Math.PI - openRad);
		}

        const value = toValueNumber(relativeValue, this.min, this.max, this.steps);
        // update value
        this.value = parseFloat(value.toFixed(1));
        this.updateTicks();
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
        if(this.sliderType === 'tick'){
            this.getSVGforTick();
        }
    }
}