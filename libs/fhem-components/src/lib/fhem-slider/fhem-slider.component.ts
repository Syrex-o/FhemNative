import { Component, Input, ViewChild } from '@angular/core';

import { FhemComponent, FhemComponentModule } from '../_fhem-component';
import { MoverModule, WhileMoveEvent } from '@fhem-native/directives';
import { IconModule } from '@fhem-native/components';

import { FhemService } from '@fhem-native/services';

import { animateMove, getNumberOrDefault, minToTime, toValueNumber } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ FhemComponentModule, MoverModule, IconModule ],
	selector: 'fhem-native-component-slider',
	templateUrl: './fhem-slider.component.html',
	styleUrls: ['./fhem-slider.component.scss'],
})
export class FhemSliderComponent{
	@ViewChild('COMPONENT', {read: FhemComponent, static: false}) component: FhemComponent|undefined;

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

	// Data
	@Input() device!: string;
	@Input() reading!: string;
	@Input() setReading!: string;

	@Input() threshold!: number;

	@Input() labelExtension!: string;

	@Input() sliderHeight!: number;
	@Input() thumbWidth!: number;
	@Input() thumbHeight!: number;

	@Input() steps!: number;
	@Input() min!: number;
	@Input() max!: number;

	// Selections
	@Input() sliderType!: string;
	@Input() orientation!: string;

	// Icons
	@Input() sliderIcon!: string;

	// Styling
	@Input() backgroundColor!: string;
	@Input() boxBackgroundColor!: string;
	@Input() thumbColor!: string;
	@Input() fillColor!: string;
	@Input() thumbValueColor!: string;
	@Input() buttonColor!: string;
	@Input() iconColor!: string;

	// Bool
	@Input() updateOnMove!: boolean;
	@Input() showPin!: boolean;
	@Input() showValueInThumb!: boolean;

	// minimal width/height properties based on different styles
	minX = 150; minY = 30;

	private bounding!: DOMRect;
	styles: Record<string, any> = {
		baseSliderStyle: {},
		baseThumbStyle: {
			top: '0%',
			left: '100%'
		},
		move: 0,
		showPin: false,
		// for time value input
		isValueInSec: false,
		isValueTime: false,
		// indicate min < max
		minMax: false
	};

	value = 0;
	fhemDevice: FhemDevice|undefined;

	constructor(private fhem: FhemService){}

	initialize(): void{
		// set initial values
		this.value = this.min;
		this.steps = this.steps > 0 ? this.steps : 0.1;

		// initial slider positioning
		if(this.min <= this.max){
			if(this.orientation === 'horizontal'){
				// btn style
				this.styles['baseBtnAddStyle'] = {right: '5px'};
				this.styles['baseBtnReduceStyle'] = {left: '5px'};

			}else{
				this.styles['baseSliderStyle']['bottom'] = '0px';

				// btn style
				this.styles['baseBtnAddStyle'] = {top: '5px'};
				this.styles['baseBtnReduceStyle'] = {bottom: '5px'};
			}
		}else{
			// min max swap
			this.styles['minMax'] = true;
			if(this.orientation === 'horizontal'){
				this.styles['baseSliderStyle']['right'] = '0px';
				this.styles['baseThumbStyle']['left'] = '0px';
			}else{
				this.styles['baseThumbStyle']['top'] = '100%';
			}
		}

		// set width/height
		if(this.orientation === 'horizontal'){
			this.minX = 150;
			this.minY = 30;
		}else{
			this.minX = 30;
			this.minY = 150;
		}
	}

	setFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
		this.value = getNumberOrDefault(device.readings[this.reading].Value, this.min);

		animateMove(this.min, this.value, (num)=> {
			this.value = num;
			this.styles['move'] = Math.round(this.getValuePercentage(num) * 100);
		});
	}

	updateFhemDevice(device: FhemDevice): void{
		this.fhemDevice = device;
		const updateValue = getNumberOrDefault(this.fhemDevice.readings[this.reading].Value, this.min);
		const oldValue = this.value;
		if (updateValue !== this.value) {
			this.value = updateValue;
			animateMove(oldValue, this.value, (num)=>  {
				this.value = num;
				this.styles['move'] = Math.round(this.getValuePercentage(num) * 100);
			});
		}
	}

	startMove(): void{
		const rect = this.component?.elem?.nativeElement.querySelector('.inner')?.getBoundingClientRect();
		if(!rect) return;

		this.bounding = rect;
		if(this.showPin) this.styles['showPin'] = true;
	}

	whileMove(event: WhileMoveEvent): void{
		if(!this.bounding) return;

		const value = this.toValueNumber(
			this.orientation === 'horizontal' ? 
			( (event.current.x - this.bounding.left) / this.bounding.width ) : 
			( (event.current.y - this.bounding.top) / this.bounding.height )
		);

		// update value
        this.value = parseFloat(value.toFixed(1));
		this.updateSliderValues();
		// check for trigger
		if(event.triggerEvent) this.sendValue(this.value);
	}

	endMove(): void{
		this.styles['showPin'] = false;
		this.sendValue(this.value);
	}

	// update slider values
	private updateSliderValues(): void{
		this.styles['move'] = Math.round(this.getValuePercentage(this.value) * 100);
	}

	private getValuePercentage(value: number): number {
		let val = this.min <= this.max 
			? (value - this.min) / (this.max - this.min) 
			: (value - this.max) / (this.min - this.max);

		// just to ensure, that changes in min and max don´t put slider out of range
		if(val >= 1) val = 1;
		if(val <= 0) val = 0;

		return val;
	}

	private toValueNumber(factor: number): number {
		let value = toValueNumber(factor, this.min, this.max, this.steps);

		if(this.min <= this.max){
			if(this.orientation === 'vertical') value = this.max - (value - this.min);
			
			if (value <= this.min) value = this.min; 
			if (value >= this.max) value = this.max;
		}else{
			if (value <= this.max) value = this.max;
			if (value >= this.min) value = this.min;
		}

		return value;
	}

	reduceByStep(): void{
		this.setStepValue(this.value - this.steps);
	}

	addByStep(): void{
		this.setStepValue(this.value + this.steps);
	}	

	private setStepValue(val: number): void{
		const min = Math.min(this.min, this.max);
		const max = Math.max(this.min, this.max);

		if (val <= min) val = min;
		if (val >= max) val = max;

		this.value = val;
		this.updateSliderValues();
		this.sendValue(val);
	}

	private sendValue(value: number): void{
		if(!this.fhemDevice) return;
		if(this.fhemDevice.readings[this.reading].Value === value) return;

		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, value);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, value);
	}

	// value display
	displayAs(val: number): any{
		if(!this.styles['isValueTime']) return val;
		
		if(!this.styles['isValueInSec']) return minToTime(val);
			
		let h: string|number = Math.floor(val / 3600);
		let m: string|number = Math.floor((val - (h * 3600)) / 60);
		let s: string|number = val - (h * 3600) - (m * 60);

		if(h < 10) h = "0"+h;
		if(m < 10) m = "0"+m;
		if(s < 10) s = "0"+s;

		return h+':'+m+':'+s;
	}
}