import { Component, Input, NgModule, OnInit, OnDestroy, ViewChildren, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

// Components
import { FhemComponentModule } from '../fhem-component.module';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../../services/fhem.service';
import { StructureService } from '../../../services/structure.service';
import { EventHandlerService } from '../../../services/event-handler.service';
import { SelectComponentService } from '../../../services/select-component.service';

@Component({
	selector: 'fhem-circle-slider',
	templateUrl: './fhem-circle-slider.component.html',
	styleUrls: ['./fhem-circle-slider.component.scss']
})
export class FhemCircleSliderComponent implements OnInit, OnDestroy {
	// relevant dimensions
	private dims: {width: number, height: number} = {width: 0, height: 0};

	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_setReading!: string;

	@Input() data_textSize!: string;
	@Input() data_labelExtension!: string;
	@Input() data_label!: string;
	@Input() data_bottomAngle!: string;
	@Input() data_arcThickness: any = 10;
	@Input() data_thumbRadius!: string;
	@Input() data_thumbBorder: any;

	@Input() bool_data_updateOnMove!: boolean;
	@Input() data_threshold!: string;

	@Input() data_min!: string;
	@Input() data_max!: string;
	@Input() data_step!: string;

	// Styling
	@Input() style_backgroundColor!: string;
	@Input() style_circleBackgroundColor!: string;
	@Input() style_thumbColor!: string;
	@Input() arr_style_fillColors!: string[];

	// custom label position
	@Input() bool_data_customLabelPosition!: boolean;
	@Input() data_labelTopPos!: string;
	@Input() data_labelLeftPos!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	fhemDevice!: FhemDevice|null;
	value: number = 0;
	// threshold
	private waitForThreshold: number = 0;

	// circle slider settings
	UID: string = '_' + Math.random().toString(36).substr(2, 9);
	VIEW_BOX_SIZE: number = 300;
	scaleFactor: number = 1;
	bottomAngleRad: number = 0;
	radius: number = 100;
	translateXValue: number = 0;
	translateYValue: number = 0;
	thickness: number = 6;
	pinRadius: number = 10;
	pinVisible: boolean = false;

	styles: {[key: string]: any} = {
		viewBox: '0 0 300 300',
		arcTranslateStr: 'translate(0, 0)',
		clipPathStr: '',
		gradArcs: [],
		nonSelectedArc: {},
		thumbPosition: { x: 0, y: 0 },
		blurRadius: 15,
		translateBg: 'translate(0, 0)',
	};

	ngOnInit(){
		this.dims.width = parseFloat(this.width);
		this.dims.height = parseFloat(this.height);
		// set initial values
		this.value = parseInt(this.data_min);
		this.bottomAngleRad = Math.PI * parseInt(this.data_bottomAngle) / 180;
		this.data_thumbBorder = parseFloat(this.data_thumbBorder);
		this.data_arcThickness = parseFloat(this.data_arcThickness);

		// get fhem device
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.updateValue(device);
		}).then((device: FhemDevice|null)=>{
			this.initValue(device);
		});
		// init resize handle
		this.selectComponent.addHandle(this.ID, 'resize', (dimensions: any)=>{ this.invalidate(dimensions); });
		// create event event handler
		this.buildEventHandler();
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.ID);
		// start event
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: any) =>{
			if (target.className.baseVal === 'circle' && this.dims.width > 0 && this.fhemDevice) {
				const container = this.ref.nativeElement.parentElement;
				if(container) container.style.overflowY = 'hidden';


				const svgRoot = this.ref.nativeElement.querySelector('.fhem-component-container');
				const rect: ClientRect = svgRoot.getBoundingClientRect();
				const center: {x: number, y: number} = {
					x: rect.left + this.VIEW_BOX_SIZE * this.scaleFactor / 2,
					y: rect.top + (this.translateYValue + this.radius) * this.scaleFactor,
				};

				const whileMove = (e: MouseEvent|TouchEvent): void => {
					this.recalculateValue(e, rect, center);
					this.cdr.detectChanges();
				}

				const endMove = (): void => {
					if(container) container.style.overflowY = 'auto';
					// remove listeners
					document.removeEventListener('mousemove', whileMove);
					document.removeEventListener('touchmove', whileMove);
					document.removeEventListener('mouseup', endMove);
					document.removeEventListener('touchend', endMove);
					this.end();
				};

				document.addEventListener('mousemove', whileMove, {passive: true});
				document.addEventListener('touchmove', whileMove, {passive: true});
				document.addEventListener('mouseup', endMove, {passive: true});
				document.addEventListener('touchend', endMove, {passive: true});
			}
		};
		this.eventHandler.handle(this.ID, this.ref.nativeElement, startMove, true);
	}

	private end(): void{
		if(this.fhemDevice) {
			if (parseFloat(this.fhemDevice.readings[this.data_reading].Value) !== this.value) {
				this.sendValue(this.value);
			}
		}
	}

	// init slider
	private initValue(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			this.invalidate();
			this.data_label = (this.data_label === '') ? this.fhemDevice.device : this.data_label;
			this.value = parseFloat(this.fhemDevice.readings[this.data_reading].Value);
			this.animateMove(parseInt(this.data_min));
		}
	}

	// received update from fhem
	private updateValue(device: FhemDevice): void{
		this.fhemDevice = device;
		const updateValue: number = parseFloat(this.fhemDevice.readings[this.data_reading].Value);
		const oldValue: number = this.value;
		if (updateValue !== this.value) {
			this.value = updateValue;
			this.animateMove(oldValue);
		}
	}

	private invalidate(dims?: any): void{
		// init dims after rescale
		if(dims){
			this.dims.width = dims.width;
			this.dims.height = dims.height;
		}

		if(this.fhemDevice){
			this.calculateVars();
			this.invalidateClipPathStr();
			this.invalidatePinPosition();
			this.invalidateGradientArcs();
			this.pinVisible = true;
		}
	}

	private calculateVars(): void{
		const halfAngle: number = this.bottomAngleRad / 2;
		this.VIEW_BOX_SIZE = Math.max(this.dims.width, this.dims.height);

		const svgAreaFactor: number = this.dims.height && this.dims.width / this.dims.height || 1;
		const svgHeight: number = this.VIEW_BOX_SIZE / svgAreaFactor;
		const thumbMaxRadius: number = parseInt(this.data_thumbRadius) * 2;
		const thumbMargin: number = 2 * thumbMaxRadius > parseInt(this.data_arcThickness) ? (thumbMaxRadius - parseInt(this.data_arcThickness) / 2) / this.scaleFactor : 0;

		this.scaleFactor = Math.min(this.dims.width, this.dims.height) / this.VIEW_BOX_SIZE || 1;
		this.styles.viewBox = `0 0 ${this.VIEW_BOX_SIZE} ${svgHeight}`;

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

		this.translateXValue = this.VIEW_BOX_SIZE / 2 - this.radius;
		this.translateYValue = this.VIEW_BOX_SIZE / 2 - this.radius;

		this.styles.arcTranslateStr = `translate(${this.translateXValue}, ${this.translateYValue})`;
		// background Circle
		this.styles.translateBg = `translate(${(this.VIEW_BOX_SIZE / 2) - this.translateXValue}, ${(this.VIEW_BOX_SIZE / 2) - this.translateYValue })`;
		// subline text

		this.thickness = parseInt(this.data_arcThickness) / this.scaleFactor;
		this.pinRadius = parseInt(this.data_thumbRadius) / this.scaleFactor;
	}

	private calculateClipPathSettings(): Object{
		const halfAngle: number = this.bottomAngleRad / 2;
		const innerRadius: number = this.radius - this.thickness;
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
				start: { x: xStartMultiplier * innerRadius + this.thickness, y: yMultiplier * innerRadius + this.thickness },
				end: { x: xEndMultiplier * innerRadius + this.thickness, y: yMultiplier * innerRadius + this.thickness },
				radius: innerRadius,
			},
			thickness: this.thickness,
			big: this.bottomAngleRad < Math.PI ? '1' : '0',
		};
	}

	private invalidateClipPathStr(): void{
		const s: any = this.calculateClipPathSettings();

		let path = `M ${s.outer.start.x},${s.outer.start.y}`; // Start at startangle top

		// Outer arc
		path += ` A ${s.outer.radius},${s.outer.radius} 0 ${s.big} 1 ${s.outer.end.x},${s.outer.end.y}`;

		// Outer to inner connector
		path += ` A ${s.thickness / 2},${s.thickness / 2} 0 1 1 ${s.inner.end.x},${s.inner.end.y}`;

		// Inner arc
		path += ` A ${s.inner.radius},${s.inner.radius} 1 ${s.big} 0 ${s.inner.start.x},${s.inner.start.y}`;

		// Outer to inner connector
		path += ` A ${s.thickness / 2},${s.thickness / 2} 0 1 1 ${s.outer.start.x},${s.outer.start.y}`;

		// Close path
		path += ' Z';
		this.styles.clipPathStr = path;
	}

	private invalidatePinPosition(customNumber?: number): void{
		const radiusOffset: number = this.thickness / 2;
		const curveRadius: number = this.radius - radiusOffset;
		const actualAngle: number = (2 * Math.PI - this.bottomAngleRad) * this.getValuePercentage(customNumber) + this.bottomAngleRad / 2;
		this.styles.thumbPosition = {
			x: curveRadius * (1 - Math.sin(actualAngle)) + radiusOffset,
			y: curveRadius * (1 + Math.cos(actualAngle)) + radiusOffset,
		};
		this.invalidateNonSelectedArc(customNumber);
	}

	private invalidateNonSelectedArc(customNumber?: number): void{
		const angle: number = this.bottomAngleRad / 2 + (1 - this.getValuePercentage(customNumber)) * (2 * Math.PI - this.bottomAngleRad);
		this.styles.nonSelectedArc = {
			color: this.style_backgroundColor,
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

		const getArc = (des: any): string =>{
			return `M ${radius},${radius} L ${des.start.x},${des.start.y} A ${2 * radius},${2 * radius} 0 ${des.big} 1 ${des.end.x},${des.end.y} Z`;
		}

		const angleStep: number = (2 * Math.PI - this.bottomAngleRad) / this.arr_style_fillColors.length;
		const s: Array<any> = this.calculateGradientConePaths(angleStep);

		this.styles.gradArcs = [];
		for (let i = 0; i < s.length; i++) {
			const si: any = s[i];
			const arcValue = getArc(si);
			this.styles.gradArcs.push({ color: this.arr_style_fillColors[i], d: arcValue });
		}
		this.styles.blurRadius = 2 * radius * Math.sin(angleStep / 6);
	}

	private calculateGradientConePaths(angleStep: number): Array<any>{
		const radius: number = this.radius;
		const calcX = (angle: number): number =>{ return radius * (1 - 2 * Math.sin(angle)); }
		const calcY = (angle: number): number =>{ return radius * (1 + 2 * Math.cos(angle)); }

		const gradArray: Array<any> = [];
		for (let i = 0, currentAngle = this.bottomAngleRad / 2; i < this.arr_style_fillColors.length; i++, currentAngle += angleStep) {
			gradArray.push({
				start: { x: calcX(currentAngle), y: calcY(currentAngle) },
				end: { x: calcX(currentAngle + angleStep), y: calcY(currentAngle + angleStep) },
				big: Math.PI <= angleStep ? 1 : 0,
			});
		}
		return gradArray;
	}

	private recalculateValue(e: MouseEvent|TouchEvent, rect: ClientRect, center: {x: number, y: number}): void {
		const mouse: {x: number, y: number} = this.structure.getMousePosition(e);

		let actualAngle: number = Math.atan2(center.x - mouse.x, mouse.y - center.y);
		if (actualAngle < 0) actualAngle = actualAngle + 2 * Math.PI;
		
		let relativeValue: number = 0;
		if (actualAngle < this.bottomAngleRad / 2) {
			relativeValue = 0;
		} else if (actualAngle > 2 * Math.PI - this.bottomAngleRad / 2) {
			relativeValue = 1;
		} else {
			relativeValue = (actualAngle - this.bottomAngleRad / 2) / (2 * Math.PI - this.bottomAngleRad);
		}

		const value: number = this.toValueNumber(relativeValue);
		this.value = parseFloat(value.toFixed(1));
		this.invalidatePinPosition();
		if (this.bool_data_updateOnMove) {
			this.waitForThreshold += 1;
			if (this.waitForThreshold === parseInt(this.data_threshold)) {
				this.sendValue(this.value);
				this.waitForThreshold = 0;
			}
		}
	}

	private animateMove(from: number){
		let to: number, pos: number = 0;
		let id: any;
		const orginalValue = this.value;

		let frame = ()=>{
			let count = (pos > to) ? - 1 : 1;
			
			id = setInterval(()=>{
				if ( Math.round(pos) === Math.round(to)  ) {
					this.invalidatePinPosition();
					this.value = orginalValue;
					clearInterval(id);
				}else{
					pos = pos + count;
					this.invalidatePinPosition(pos);
					this.value = pos;
				}
			}, 5);
		}
		to = this.value;
		pos = from;
		frame();
	}

	private getValuePercentage(customNumber?: number): number{
		const val = customNumber || this.value;
		return (val - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min));
	}

	private toValueNumber(factor: number): number {
		return Math.round(factor * (parseInt(this.data_max) - parseInt(this.data_min)) / parseFloat(this.data_step)) * parseFloat(this.data_step) + parseInt(this.data_min);
	}

	private sendValue(val: number): void {
		if(this.fhemDevice){
			if (this.data_setReading !== '') {
				this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
			} else {
				this.fhem.set(this.fhemDevice.device, val);
			}
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.eventHandler.removeHandle(this.ID);
		this.selectComponent.removeHandle(this.ID, 'resize');
	}

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		private cdr: ChangeDetectorRef,
		private structure: StructureService,
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Circle Slider',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_threshold', default: '20'},
				{variable: 'data_textSize', default: '40'},
				{variable: 'data_label', default: ''},
				{variable: 'data_labelExtension', default: ''},
				{variable: 'data_bottomAngle', default: '90'},
				{variable: 'data_arcThickness', default: '18'},
				{variable: 'data_thumbRadius', default: '16'},
				{variable: 'data_thumbBorder', default: '3'},
				{variable: 'data_step', default: '0.1'},
				{variable: 'data_min', default: '0'},
				{variable: 'data_max', default: '100'},
				{variable: 'data_labelTopPos', default: '50%'},
				{variable: 'data_labelLeftPos', default: '50%'},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'bool_data_customLabelPosition', default: false},
				{variable: 'style_backgroundColor', default: '#272727'},
				{variable: 'style_circleBackgroundColor', default: '#272727'},
				{variable: 'style_thumbColor', default: '#fbfbfb'},
				{variable: 'arr_style_fillColors', default: '#2ec6ff,#272727'}
			],
			dependencies: {
				data_threshold: { dependOn: 'bool_data_updateOnMove', value: true },
				data_labelTopPos: { dependOn: 'bool_data_customLabelPosition', value: true },
				data_labelLeftPos: { dependOn: 'bool_data_customLabelPosition', value: true }
			},
			dimensions: {minX: 200, minY: 200}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule],
	declarations: [FhemCircleSliderComponent]
})
class FhemCircleSliderComponentModule {}