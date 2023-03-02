import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';

// Components
import { FhemComponentModule } from '../fhem-component.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { EventHandlerService } from '../../../services/event-handler.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';
import { SelectComponentService } from '../../../services/select-component.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-thermostat',
	templateUrl: './fhem-thermostat.component.html',
	styleUrls: ['./fhem-thermostat.component.scss']
})
export class FhemThermostatComponent implements OnInit, OnDestroy {
	// relevant dimensions
	private dims: {width: number, height: number} = {width: 0, height: 0};
	// element container
	private container!: HTMLElement;

	// change min width/height based on style
	minimumWidth: number = 120;
	minimumHeight: number = 170;

	// Component ID
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_setReading!: string;
	// (desired/current differentiation) --> thermostat displays desired temp, but indicates current temp (heating/cooling process)
	@Input() data_displayReading!: string;

	@Input() data_min!: string;
	@Input() data_max!: string;
	@Input() data_steps!: string;

	@Input() bool_data_updateOnMove!: boolean;
	@Input() bool_data_enableAnimation!: boolean;

	@Input() data_threshold!: string;
	@Input() data_labelExtension!: string;

	@Input() arr_data_style!: string[];

	// Styling
	// All
	@Input() style_labelColor!: string;
	// Thermostat Style
	@Input() style_gradientColor1!: string;
	@Input() style_gradientColor2!: string;
	@Input() style_gradientColor3!: string;
	@Input() style_gradientColor4!: string;
	// circular
	@Input() style_backgroundColorOne!: string;
	@Input() style_tickColor!: string;
	@Input() style_thumbColor!: string;
	// tick
	@Input() style_heatingColor!: string;
	@Input() style_coolingColor!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	// unique ids
	UID_1: string = this.settings.getUID();
	UID_2: string = this.settings.getUID();

	fhemDevice!: FhemDevice|null;
	private waitForThreshold = 0;

	// desired temp
	value: number = 0;
	// current temp
	current: number = 0;

	styles: any = {
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

	ngOnInit(){
		// init dimensions
		this.dims.width = parseFloat(this.width);
		this.dims.height = parseFloat(this.height);

		this.initThermostatValues();
		// get fhem device
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
			if(this.arr_data_style[0] === 'tick'){
				this.updateTicks();
			}
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
			this.initAdditional();
		});
		// create event event handler
		this.buildEventHandler();
	}

	// relevant class touched
	private relevantClassTouched(target: any): boolean {
		if( (target.className.baseVal && target.className.baseVal.match(/drag-item/)) || (!target.className.baseVal && 'className' in target && target.className.match(/drag-item/)) ){
			return true;
		}
		return false;
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.ID);
		// start event
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: any) =>{
			if(this.relevantClassTouched(target)){
				// get the item container
				this.container = this.ref.nativeElement.querySelector('.thermostat');
				const container = this.ref.nativeElement.parentElement;
				if(this.container){
					if(container) container.style.overflowY = 'auto';

					let bounding: ClientRect = this.container.getBoundingClientRect();
					let moveStyle: string = this.arr_data_style[0] === 'thermostat' ? 'Linear' : 'Radial';
					if (this.arr_data_style[0] === 'thermostat') {
						bounding = (this.container.querySelector('.tubeBg') as any).getBoundingClientRect();
					}
					else if(this.arr_data_style[0] === 'circular'){
						bounding = (this.container.querySelector('.control') as any).getBoundingClientRect();
					}
					else if(this.arr_data_style[0] === 'heater'){
						bounding = (this.container.querySelector('.rotator-container') as any).getBoundingClientRect();
					}
					else if(this.arr_data_style[0] === 'tick'){
						moveStyle = 'Ticks';
					}

					// get center to reduce calculation in move
					const center: {x: number, y: number} = {
						x: bounding.left + (bounding.width) / 2,
						y: bounding.top + (bounding.height) / 2,
					};

					const endMove = (): void => {
					if(container) container.style.overflowY = 'auto';
						// remove listeners
						document.removeEventListener('mousemove', whileMove);
						document.removeEventListener('touchmove', whileMove);
						document.removeEventListener('mouseup', endMove);
						document.removeEventListener('touchend', endMove);
						this.end();
					};

					const whileMove = (e: MouseEvent|TouchEvent): void => {
						const mouse: {x: number, y: number} = this.structure.getMousePosition(e);
						(this as any)['move'+ moveStyle]( mouse, bounding, center );
						this.cdr.detectChanges();
					}

					document.addEventListener('mousemove', whileMove, {passive: true});
					document.addEventListener('touchmove', whileMove, {passive: true});
					document.addEventListener('mouseup', endMove, {passive: true});
					document.addEventListener('touchend', endMove, {passive: true});
				}
			}
		};
		this.eventHandler.handle(this.ID, this.ref.nativeElement, startMove, true);
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			const oldValue = this.value || parseInt(this.data_min);
			const updateValue = parseFloat(this.fhemDevice.readings[this.data_reading].Value);

			// desired update
			if (updateValue !== this.value) {
				this.value = updateValue;
				this.animateMove(oldValue);
			}

			// current update
			if(this.fhemDevice.readings[this.data_displayReading]){
				this.current = parseFloat(this.fhemDevice.readings[this.data_displayReading].Value);
			}else{
				this.current = this.value;
			}
		}
	}

	private end(): void{
		if(this.fhemDevice){
			// send value update
			const value = this.value;
			if (this.fhemDevice.readings[this.data_reading].Value !== value) {
				this.sendValue(value);
			}
		}
		// reset values
		this.waitForThreshold = 0;
	}

	private initThermostatValues(): void{
		// get multiply factor
		if(this.arr_data_style[0] === 'thermostat'){
			this.styles.factor = 83;
		}else{
			this.minimumWidth = this.minimumHeight = 180;
		}
		if(this.arr_data_style[0] === 'circular'){
			this.styles.rotationSub = 90;
		}
		// heater attr
		if(this.arr_data_style[0] === 'heater'){
			this.styles.heaterTicks = Array(24).fill(24).map((x,i)=>i);
			this.styles.rotationSub = -10;
		}
	}

	private initAdditional(): void{
		setTimeout(()=>{
			// tick thermostat
			if(this.arr_data_style[0] === 'tick'){
				if(this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
					const container = this.ref.nativeElement.querySelector('.thermostat-four');
					if(container){
						this.getSVGforTick();
					}
				}
			}
		});
		// init resize handle
		this.selectComponent.addHandle(this.ID, 'resize', (dimensions: any)=>{ this.getSVGforTick(dimensions); });
	}

	private getViewbox(): number{
		return Math.max(this.dims.width, this.dims.height);
	}

	private getSVGforTick(dims?: any): void{
		// init dims after rescale
		if(dims){
			this.dims.width = dims.width;
			this.dims.height = dims.height;
		}
		if(this.dims.width === 0){
			this.dims.width = parseFloat(this.width);
			this.dims.height = parseFloat(this.height);
		}
		if(this.fhemDevice){
			const viewBox: number = this.getViewbox();
			this.styles.viewBox = `0 0 ${viewBox} ${viewBox}`;
			this.styles.radius = viewBox / 2;

			// get number of ticks
			let ticks: number = Math.round(Math.min(this.dims.width, this.dims.height) / 2);
			ticks = ticks % 2 === 0 ? ticks : ticks -1;
			this.styles.tickAmount = ticks;
			this.drawTicks();
		}
	}

	private drawTicks(): void{
		const viewBox: number = this.getViewbox();
		const ticksOuterRadius: number = viewBox / 8;
		const ticksInnerRadius: number = viewBox / 5;
		this.styles.offsetDegrees = 180 - ( 360 - this.styles.tickDeg ) / 2;

		const theta: number = this.styles.tickDeg / this.styles.tickAmount;
		const rangeValue: number = parseInt(this.data_max) - parseInt(this.data_min);

		this.styles.ticks = [];
		this.styles.tickPoints = [
			[this.styles.radius-1, ticksOuterRadius], [this.styles.radius+1, ticksOuterRadius],
			[this.styles.radius+1, ticksInnerRadius], [this.styles.radius-1, ticksInnerRadius]
		];
		this.styles.tickPointsLarge = [
			[this.styles.radius-1.5, ticksOuterRadius], [this.styles.radius+1.5, ticksOuterRadius],
			[this.styles.radius+1.5, ticksInnerRadius + 10], [this.styles.radius-1.5, ticksInnerRadius + 10]
		];

		this.styles.currentPos = [
			this.styles.radius, 
			ticksOuterRadius - (ticksOuterRadius - ticksInnerRadius)/2
		];

		const vMin: number = Math.min(this.current, this.value);
		const vMax: number = Math.max(this.current, this.value);
		const min: number = this.restrictToRange(Math.round(( vMin - parseInt(this.data_min)) / rangeValue * this.styles.tickAmount),0, this.styles.tickAmount -1);
		const max: number = this.restrictToRange(Math.round(( vMax - parseInt(this.data_min)) / rangeValue * this.styles.tickAmount), 0, this.styles.tickAmount - 1);

		for(let i = 0; i < this.styles.tickAmount; i++){
			const isLarge: boolean = i == min || i == max;
			const isActive: boolean = i >= min && i <= max;
			const t: number = i * theta - this.styles.offsetDegrees;

			this.styles.ticks.push({
				t: t,
				d: this.pointsToPath( this.rotatePoints(isLarge ? this.styles.tickPointsLarge : this.styles.tickPoints, t, [this.styles.radius, this.styles.radius]) ),
				class: isActive
			});
		}
		this.createCurrentTickTemp(rangeValue);
	}

	private updateTicks(): void{
		if(this.styles.ticks.length > 0){
			const rangeValue: number = parseInt(this.data_max) - parseInt(this.data_min);

			const vMin: number = Math.min(this.current, this.value);
			const vMax: number = Math.max(this.current, this.value);
			const min: number = this.restrictToRange(Math.round(( vMin - parseInt(this.data_min)) / rangeValue * this.styles.tickAmount),0, this.styles.tickAmount -1);
			const max: number = this.restrictToRange(Math.round(( vMax - parseInt(this.data_min)) / rangeValue * this.styles.tickAmount), 0, this.styles.tickAmount - 1);

			this.styles.ticks.forEach((tick: any, i: number)=>{
				const isLarge: boolean = i == min || i == max;
				const isActive: boolean = i >= min && i <= max;

				// update
				tick.d = this.pointsToPath( this.rotatePoints(isLarge ? this.styles.tickPointsLarge : this.styles.tickPoints, tick.t, [this.styles.radius, this.styles.radius]) );
				tick.class = isActive
			});
			this.createCurrentTickTemp(rangeValue);
		}
	}

	private createCurrentTickTemp(rangeValue: number): void{
		const padded: number = this.restrictToRange(this.current, parseInt(this.data_min), parseInt(this.data_max));
		let degs: number = this.styles.tickDeg * (padded - parseInt(this.data_min)) / rangeValue - this.styles.offsetDegrees;

		if (padded > this.value) {
			degs += 15;
		}else{
			degs -= 15;
		}

		this.styles.tickDrawPos = this.rotatePoint(this.styles.currentPos ,degs, [this.styles.radius, this.styles.radius]);
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

	private restrictToRange(val: number, min: number, max: number): number{
		if (val < min) return min;
		if (val > max) return max;
		return val;
	}

	private pointsToPath(points: Array<any>): string{
		return points.map((point, iPoint)=>{
			return (iPoint > 0?'L':'M') + point[0] + ' ' + point[1];
		}).join(' ')+'Z';
	}

	private moveLinear(mouse: {x: number, y: number}, baseElem: ClientRect, center: {x: number, y: number}){
		let value = this.toValueNumber( (mouse.y - baseElem.top) / baseElem.height );
		value = parseInt(this.data_max) - (value - parseInt(this.data_min));

		// min max
		if (value <= parseInt(this.data_min)) value = parseInt(this.data_min);
		if (value >= parseInt(this.data_max)) value = parseInt(this.data_max);

		this.styles.move = this.getValuePercentage(value) * this.styles.factor;

		this.onMoveUpdate(value);
	}

	private moveRadial(mouse: {x: number, y: number}, baseElem: ClientRect, center: {x: number, y: number}){
		const actualAngle =  Math.atan2(mouse.x - center.x, mouse.y - center.y );
		const deg = ((180 + actualAngle * 180 / Math.PI) * -1) + this.styles.rotationSub;

		this.styles.rotation = deg;

		const pFull = ((360 + (deg - this.styles.rotationSub)) % 360) / 360;

		this.onMoveUpdate(this.toValueNumber(pFull));
	}

	private moveTicks(mouse: {x: number, y: number}, baseElem: ClientRect, center: {x: number, y: number}){
		let actualAngle: number = Math.atan2(center.x - mouse.x, mouse.y - center.y);
		if (actualAngle < 0) actualAngle = actualAngle + 2 * Math.PI;

		const openRad: number = Math.PI * 60 / 180;

		let relativeValue: number = 0;
		if (actualAngle < openRad / 2) {
			relativeValue = 0;
		} else if (actualAngle > 2 * Math.PI - openRad / 2) {
			relativeValue = 1;
		} else {
			relativeValue = (actualAngle - openRad / 2) / (2 * Math.PI - openRad);
		}

		let value: number = this.toValueNumber(relativeValue);
		this.value = parseFloat(value.toFixed(1));
		this.updateTicks();
	}

	private onMoveUpdate(val: number): void{
		let value = val;
		if (value <= parseInt(this.data_min)) value = parseInt(this.data_min);
		if (value >= parseInt(this.data_max)) value = parseInt(this.data_max);

		this.value = Math.round(value * 10) / 10;

		if (this.bool_data_updateOnMove) {
			this.waitForThreshold += 1;
			if (this.waitForThreshold === parseInt(this.data_threshold)) {
				this.sendValue(this.value);
				this.waitForThreshold = 0;
			}
		}
	}

	// animate update movement
	private animateMove(from: number): void {
		let to: number, pos: number = 0;
		let id: any;

		let frame = (attr: string)=>{
			const count = (pos > to) ? -1 : 1;
			id = setInterval(()=>{
				if (pos === to) {
					clearInterval(id);
				}else{
					pos = pos + count;
					this.styles[attr] = pos;
				}
			}, 5);
		}

		if(this.arr_data_style[0] === 'thermostat'){
			to = Math.round(this.getValuePercentage(this.value) * this.styles.factor);
			pos = Math.round(this.getValuePercentage(from) * this.styles.factor);
			frame('move');
		}
		if(this.arr_data_style[0] === 'circular' || this.arr_data_style[0] === 'heater'){
			to = Math.round(this.updateRadialValues(this.value, false));
			pos = Math.round(this.updateRadialValues(from, false));
			frame('rotation');
		}
	}

	// update linear values
	private updateLinearValues(): void{
		this.styles.move = Math.round(this.getValuePercentage(this.value) * this.styles.factor);
	}

	// update radial values
	private updateRadialValues(val: number, set: boolean): number{
		const deg = (360 * this.getValuePercentage(val)) + this.styles.rotationSub;

		if(this.arr_data_style[0] === 'circular' || this.arr_data_style[0] === 'heater'){
			if(set){
				this.styles.rotation = deg;
				return deg;
			}else{
				return deg;
			}
		}
		return 0;
	}

	private getValuePercentage(value: number): number {
		let val: number = (value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min));
		// just to ensure, that changes in min and max don´t put slider out of range
		if(val >= 1) val = 1;
		if(val <= 0) val = 0;
		return val;
	}

	private toValueNumber(factor: number): number {
		return Math.round(factor * (parseInt(this.data_max) - parseInt(this.data_min)) / parseFloat(this.data_steps)) * parseFloat(this.data_steps) + parseInt(this.data_min);
	}

	private sendValue(val: any): void {
		if(this.fhemDevice){
			if (this.data_setReading !== '') {
				this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
			} else {
				this.fhem.set(this.fhemDevice.device, val);
			}
		}
		this.native.nativeClickTrigger();
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
		public settings: SettingsService,
		private structure: StructureService,
		private native: NativeFunctionsService,
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService) {
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Thermostat',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_displayReading', default: ''},
				{variable: 'data_min', default: '0'},
				{variable: 'data_max', default: '100'},
				{variable: 'data_steps', default: '1'},
				{variable: 'data_threshold', default: '10'},
				{variable: 'data_labelExtension', default: '\xB0C'},
				{variable: 'arr_data_style', default: 'thermostat,tick,circular,heater'},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'bool_data_enableAnimation', default: true},
				{variable: 'style_heatingColor', default: '#ef6805'},
				{variable: 'style_coolingColor', default: '#0047bb'},
				// all styles
				{variable: 'style_labelColor', default: '#29273e'},
				// circular/tick
				{variable: 'style_backgroundColorOne', default: '#fff'},
				{variable: 'style_tickColor', default: '#fff'},
				{variable: 'style_thumbColor', default: '#29273e'},
				// thermostat
				{variable: 'style_gradientColor1', default: '#FF0909'},
				{variable: 'style_gradientColor2', default: '#F3481A'},
				{variable: 'style_gradientColor3', default: '#FABA2C'},
				{variable: 'style_gradientColor4', default: '#00BCF2'}
			],
			dependencies:{
				data_threshold: { dependOn: 'bool_data_updateOnMove', value: true },
				// Thermostat
				bool_data_enableAnimation: { dependOn: 'arr_data_style', value: 'thermostat' },
				style_gradientColor1: { dependOn: 'arr_data_style', value: 'thermostat' },
				style_gradientColor2: { dependOn: 'arr_data_style', value: 'thermostat' },
				style_gradientColor3: { dependOn: 'arr_data_style', value: 'thermostat' },
				style_gradientColor4: { dependOn: 'arr_data_style', value: 'thermostat' },
				// circular
				style_backgroundColorOne: { dependOn: 'arr_data_style', value: ['circular', 'tick'] },
				style_tickColor: { dependOn: 'arr_data_style', value: ['circular', 'tick'] },
				style_thumbColor: { dependOn: 'arr_data_style', value: 'circular' }
			},
			dimensions: {minX: 120, minY: 170}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule],
	declarations: [FhemThermostatComponent]
})
class FhemThermostatComponentModule {}