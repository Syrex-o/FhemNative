import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// services
import { FhemService } from '../../../services/fhem.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-thermostat',
	templateUrl: './fhem-thermostat.component.html',
  	styleUrls: ['./fhem-thermostat.component.scss']
})
export default class FhemThermostatComponent implements OnInit, OnDestroy {
	private container: HTMLElement;

	// change min width/height based on style
	minimumWidth: number = 120;
	minimumHeight: number = 170;

	// Component ID
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;

	@Input() data_min: string;
	@Input() data_max: string;
	@Input() data_steps: string;

	@Input() bool_data_updateOnMove: boolean;
	@Input() bool_data_enableAnimation: boolean;

	@Input() data_threshold: string;
	@Input() data_labelExtension: string;

	@Input() arr_data_style: string[];

	// Styling
	// All
	@Input() style_labelColor: string;
	// Thermostat Style
	@Input() style_gradientColor1: string;
	@Input() style_gradientColor2: string;
	@Input() style_gradientColor3: string;
	@Input() style_gradientColor4: string;
	// circular
	@Input() style_backgroundColorOne: string;
	@Input() style_tickColor: string;
	@Input() style_thumbColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	// unique ids
	UID_1 = '_' + Math.random().toString(36).substr(2, 9);
	UID_2 = '_' + Math.random().toString(36).substr(2, 9);

	private fhemDevice: any;
	private waitForThreshold = 0;

	value: number;
	private blockUpdate: boolean = false;

	styles: any = {
		// percentage movement
		move: 0,
		// rotation in deg
		rotation: 0,
		// multiply factor for movement
		factor: 100
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if( (target.className.baseVal && target.className.baseVal.match(/drag-item/)) || (!target.className.baseVal && target.className.match(/drag-item/)) ){
			// block slider update while movement
			this.blockUpdate = true;
			// get the item container
			this.container = this.ref.nativeElement.querySelector('.thermostat');
			let bounding: ClientRect = this.container.getBoundingClientRect();

			const moveStyle = this.arr_data_style[0] === 'thermostat' ? 'Linear' : 'Radial';

			if (this.arr_data_style[0] === 'thermostat') {
				bounding = this.container.querySelector('.tubeBg').getBoundingClientRect();
			}
			if(this.arr_data_style[0] === 'circular'){
				bounding = this.container.querySelector('.control').getBoundingClientRect();
			}

			const whileMove = (e) => {
				e.stopPropagation();
	        	if (this.fhemDevice) {
	        		// get the mouse movement
	        		const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
					const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);
					// pass the values
					this['move'+ moveStyle]( {x: x, y: y}, bounding );
	        	}
	        }

	        const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);

	   			// send value update
	   			const value = this.value;
	   			if (this.fhemDevice.readings[this.data_reading].Value !== value) {
	   				this.sendValue(value);
	   			}
	   			// reset values
	   			this.waitForThreshold = 0;
	   			this.blockUpdate = false;
	   		}

			window.addEventListener('mousemove', whileMove);
	  		window.addEventListener('mouseup', endMove);

	  		window.addEventListener('touchmove', whileMove);
	  		window.addEventListener('touchend', endMove);
		}
	}

	ngOnInit(){
		this.initThermostatValues();
		// get fhem device
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device, false);
		}).then(device=>{
			this.getState(device, true);
		});
	}

	private getState(device, init: boolean){
		this.fhemDevice = device;
		if(device && this.fhemDevice.readings[this.data_reading]){
			const oldValue = this.value || 0;
			this.value = this.fhemDevice.readings[this.data_reading].Value;
			if(!this.blockUpdate){
				if(init){
					this.animateMove(oldValue);
				}else{
					if(this.arr_data_style[0] === 'thermostat'){
						this.updateLinearValues();
					}
					if(this.arr_data_style[0] === 'circular'){
						this.updateRadialValues(this.value, true);
					}
				}
			}
		}
	}

	private initThermostatValues(){
		// get multiply factor
		if(this.arr_data_style[0] === 'thermostat'){
			this.styles.factor = 83;
		}else{
			this.minimumWidth = this.minimumHeight = 200;
		}
	}

	private moveLinear(mouse:{x: number, y: number}, baseElem: ClientRect){
		let value = this.toValueNumber( (mouse.y - baseElem.top) / baseElem.height );
		value = parseInt(this.data_max) - (value - parseInt(this.data_min));

		// min max
		if (value <= parseInt(this.data_min)) value = parseInt(this.data_min);
		if (value >= parseInt(this.data_max)) value = parseInt(this.data_max);

		this.styles.move = this.getValuePercentage(value) * this.styles.factor;

		this.onMoveUpdate(value);
	}

	private moveRadial(mouse:{x: number, y: number}, baseElem: ClientRect){
		const center = {
			x: baseElem.left + (baseElem.width) / 2,
			y: baseElem.top + (baseElem.height) / 2,
		};

		const actualAngle =  Math.atan2(mouse.x - center.x, mouse.y - center.y );
		// const deg = (actualAngle * (180 / Math.PI) * -1 ) - 90;
		const deg = ((180 + actualAngle * 180 / Math.PI) * -1) + 90;

		this.styles.rotation = deg;

		const pFull = ((360 + (deg - 90)) % 360) / 360;

		this.onMoveUpdate(this.toValueNumber(pFull));
	}

	private onMoveUpdate(val: number){
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
	private animateMove(from: number) {
		let to, pos = 0;

		let id;

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
		if(this.arr_data_style[0] === 'circular'){
			to = Math.round(this.updateRadialValues(this.value, false));
			pos = Math.round(this.updateRadialValues(from, false));
			
			frame('rotation');
		}
	}

	// update linear values
	private updateLinearValues(){
		this.styles.move = Math.round(this.getValuePercentage(this.value) * this.styles.factor);
	}

	private updateRadialValues(val: number, set: boolean){
		const deg = (360 * this.getValuePercentage(val)) + 90;

		if(this.arr_data_style[0] === 'circular'){
			if(set){
				this.styles.rotation = deg;
			}else{
				return deg;
			}
		}
	}

	private getValuePercentage(value: number) {
		let val: number = (value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min));
		// just to ensure, that changes in min and max don´t put slider out of range

		if(val >= 1) val = 1;
		if(val <= 0) val = 0;
		return val;
	}

	private toValueNumber(factor) {
		return Math.round(factor * (parseInt(this.data_max) - parseInt(this.data_min)) / parseFloat(this.data_steps)) * parseFloat(this.data_steps) + parseInt(this.data_min);
	}

	private sendValue(val) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
		} else {
			this.fhem.set(this.fhemDevice.device, val);
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		private ref: ElementRef,
		private native: NativeFunctionsService) {
	}

	static getSettings() {
		return {
			name: 'Thermostat',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_min', default: '0'},
				{variable: 'data_max', default: '100'},
				{variable: 'data_steps', default: '1'},
				{variable: 'data_threshold', default: '10'},
				{variable: 'data_labelExtension', default: '\xB0C'},
				{variable: 'arr_data_style', default: 'thermostat,circular'},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'bool_data_enableAnimation', default: true},
				// all styles
				{variable: 'style_labelColor', default: '#29273e'},
				// circular
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
				style_backgroundColorOne: { dependOn: 'arr_data_style', value: 'circular' },
				style_tickColor: { dependOn: 'arr_data_style', value: 'circular' },
				style_thumbColor: { dependOn: 'arr_data_style', value: 'circular' }
			},
			dimensions: {minX: 120, minY: 170}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemThermostatComponent]
})
class FhemThermostatComponentModule {}