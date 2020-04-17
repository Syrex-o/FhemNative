import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

// Components
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StorageService } from '../../../services/storage.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-color-picker',
	templateUrl: './fhem-color-picker.component.html',
  	styleUrls: ['./fhem-color-picker.component.scss']
})
export default class FhemColorPickerComponent implements OnInit, OnDestroy {
	private canvas: any;
	@ViewChild('Container', { static: false, read: ElementRef }) container: ElementRef;

	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;

	@Input() arr_data_colorInput: string[];
	@Input() arr_data_colorOutput: string[];

	@Input() data_headline: string;
	@Input() data_popupWidth: string;
	@Input() data_popupHeight: string;
	@Input() data_threshold: string;

	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;

	@Input() bool_data_customBorder: boolean;
	@Input() bool_data_updateOnMove: boolean;
	@Input() bool_data_customAnimation: boolean;
	@Input() bool_data_invertAnimation: boolean;

	@Input() arr_data_animationStyle: string|string[];

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	private fhemDevice: any;
	private waitForThreshold: number = 0;
	// popup settings
	popupState: boolean = false;
	showFavs: boolean = false;
	colorFavs: string[] = [];
	// block outside color update
	private blockOuterUpdate: boolean = false;

	color: string;
	// container max dimension
	dimension: number = 0;

	styles: any = {
		outerRotation: 90,
		outerGradient: 'rgb(155, 134, 100)',
		innerTranslate: 'translate(0,0)'
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (target.className.match(/(outer|inner)/)) {
			// start move
			if(target.className.match(/inner/)){
				this.styles.outerRotation = 90;
			}else{
				this.blockOuterUpdate = true;
			}
			const whileMove = (e) => {
				e.stopPropagation();
	        	if (this.fhemDevice) {
	        		if(target.className.match(/outer/)){
	        			this.rotateOuter(e);
	        		}else{
	        			this.moveInner(e);
	        		}
	        	}
	        }
	        const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);
	   			// send value update
	   			const color = this.colorSelector('hex', this.arr_data_colorOutput[0], this.color);
	   			if (this.fhemDevice.readings[this.data_reading].Value !== color) {
	   				this.sendValue(color);
	   			}
	   			this.waitForThreshold = 0;
	   			this.blockOuterUpdate = false;
	   		}

	        window.addEventListener('mousemove', whileMove);
	  		window.addEventListener('mouseup', endMove);

	  		window.addEventListener('touchmove', whileMove);
	  		window.addEventListener('touchend', endMove);
		}
	}

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then(device=>{
			this.getState(device);
		});
	}

	private getState(device){
		this.fhemDevice = device;
		if(device){
			if(device.readings[this.data_reading]){
				this.color = this.colorSelector(this.arr_data_colorInput[0], 'hex', device.readings[this.data_reading].Value.toString());
				if(!this.blockOuterUpdate){
					this.getOuterGradientColor();
				}
			}
		}
	}

	togglePopup(){
		this.popupState = !this.popupState;
	}

	popupOpened(){
		this.canvas = this.container.nativeElement.querySelector('.canvas');
		// assign values
		setTimeout(()=>{
			let container = this.container.nativeElement;
			this.dimension = Math.min( container.clientWidth, container.clientHeight ) - 20;

			// draw canvas content
			this.canvas.width = this.dimension - 100;
			this.canvas.height = this.dimension - 100;

			const x = this.canvas.width / 2;
  			const y = this.canvas.height / 2;
  			const ctx = this.canvas.getContext('2d');

  			for (let i = 0; i < 360; i += 0.2) {
            	const rad = (i - 45) * (Math.PI) / 180;
	            ctx.strokeStyle = 'hsla(' + i + ', 100%, 50%, 1.0)';
	            ctx.beginPath();
	            ctx.moveTo(x, y);
	            ctx.lineTo(x + x * Math.cos(-rad), y + y * Math.sin(-rad));
	            ctx.stroke();
	        }
		});
	}

	popupClosed(){
		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private rotateOuter(e){
		let container = this.container.nativeElement.getBoundingClientRect();

		const center = {
			x: container.left + (container.width) / 2,
			y: container.top + (container.height) / 2,
		};

		const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);

		let actualAngle =  Math.atan2(x - center.x, y - center.y );
		let deg = (actualAngle * (180 / Math.PI) * -1 ) + 180;
		this.styles.outerRotation = deg;

		// color darken/lighten percentage
		let percentage: number = 0;
		// lighten
		if(deg >= 90 && deg <= 180){
			percentage = (deg - 90) / 90;
		}
		if(deg > 180 && deg <= 270){
			percentage = 1 - (( deg - 180) / 90);
		}
		// darken
		if(deg > 270 && deg <= 360){
			percentage = ((deg - 270) / 90) * -1;
		}
		if(deg > 0 && deg < 90){
			percentage = (1 - (deg / 90)) * -1;
		}
		let outerColor = this.getAdjustedOuterColor(percentage);
		this.color = this.colorSelector('rgb', 'hex', outerColor);

		if (this.bool_data_updateOnMove) {
			this.waitForThreshold += 1;
			if (this.waitForThreshold === parseInt(this.data_threshold)) {
				this.sendValue(this.colorSelector('hex', this.arr_data_colorOutput[0], this.color));
				this.waitForThreshold = 0;
			}
		}
	}

	private moveInner(e){
		let container = this.canvas.getBoundingClientRect();

		const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);

   		const center = {
			x: container.left + (container.width) / 2,
			y: container.top + (container.height) / 2,
		};

		let moveX = x - center.x, moveY = y - center.y;
		
		if (Math.sqrt(Math.pow(Math.abs(x - center.x), 2) + Math.pow(Math.abs(y - center.y), 2)) > container.width / 2) {
			let ratio = ( (x - container.left) - (container.width / 2))/( (y - container.top) - (container.height / 2));
			let sign = 1;
			if( (x - container.left) - (container.width / 2) < 0){
				sign = -1;
			}
			moveX = Math.sqrt(Math.pow(ratio,2)*Math.pow(container.width,2)/4/(1+Math.pow(ratio,2))) * sign;
			moveY = (moveX/ratio);
		}
		if(this.canvas.getContext('2d')){
			const pixel = this.canvas.getContext('2d').getImageData(moveX + (container.width / 2), moveY + (container.height / 2), 1, 1).data || null;
			const dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
			const hex = ('0000' + dColor.toString(16)).substr(-6);
			// update 
			this.color = hex;
			this.styles.innerTranslate = `translate(${ moveX }px, ${ moveY }px)`;
			this.getOuterGradientColor();

			if (this.bool_data_updateOnMove) {
				this.waitForThreshold += 1;
				if (this.waitForThreshold === parseInt(this.data_threshold)) {
					this.sendValue(this.colorSelector('hex', this.arr_data_colorOutput[0], this.color));
					this.waitForThreshold = 0;
				}
			}
		}
	}

	// get the outer gradient color
	private getOuterGradientColor(){
		this.styles.outerGradient = this.colorSelector('hex', 'rgb', this.color);
	}

	// calc lighter/darket color based on percentage
	private getAdjustedOuterColor(ratio: number){
		let rgb = this.styles.outerGradient.substring(4, this.styles.outerGradient.length-1).replace(/ /g, '').split(',').map(Number);
		if(ratio > 0){
			// lighten
			for (let i = 0; i < rgb.length; i++) {
			   rgb[i] = Math.ceil(rgb[i] + ratio * (255 - rgb[i]));
			}
		}
		if(ratio < 0){
			// darken
			for (let i = 0; i < rgb.length; i++) {
			   rgb[i] = Math.floor(rgb[i] + ratio * rgb[i]);
			}
		}

		return rgb;
	}

	private colorSelector(from: string, to: string, value: any) {
		if (from === to) {return value; }
		if (from === 'hex') {
			if (to === '#hex') {
				return '#' + value;
			}
			if (to === 'rgb') {
				return this.hexToRGB(value);
			}
		}
		if (from === 'rgb') {
			if (to === 'hex' || to === '#hex') {
				return (to === 'hex') ? this.RGBToHex(value) : '#' + this.RGBToHex(value);
			}
		}
		if (from === '#hex') {
			if (to === 'hex') {
				return value.substr(1);
			}
		}
	}

	private hexToRGB(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	 	return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
	}

	private RGBToHex(rgb) {
		if (Array.isArray(rgb)) {
			return ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
		} else {
			const RGB = (rgb.split('(')[1].split(')')[0]).split(',');
			return ((1 << 24) + (RGB[0] << 16) + (RGB[1] << 8) + RGB[2]).toString(16).slice(1);
		}
	}

	private sendValue(val) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
		} else {
			this.fhem.set(this.fhemDevice.device, val);
		}
		this.native.nativeClickTrigger();
	}

	// color favs
	toggleFavs(){
		this.showFavs = !this.showFavs;
		if(this.showFavs){
			this.storage.setAndGetSetting({name: 'colorFavs', default: JSON.stringify([])}).then((val: any) => {
				this.colorFavs = val;
			});
		}
	}

	setFavColor(color: string){
		this.sendValue(this.colorSelector('#hex', this.arr_data_colorOutput[0], color));
		this.styles.innerTranslate = 'translate(0,0)';
		this.native.nativeClickTrigger();
	}

	removeFavColor(index: number){
		this.colorFavs.splice(index, 1);
		this.storage.changeSetting({name: 'colorFavs', change: this.colorFavs});
		this.native.nativeClickTrigger();
	}

	addToColorFavs(){
		// check for same color
		if(!this.colorFavs.includes('#' + this.color)){
			this.colorFavs.push('#' + this.color);
			this.storage.changeSetting({name: 'colorFavs', change: this.colorFavs});
		}
		this.native.nativeClickTrigger();
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private storage: StorageService,
		private ref: ElementRef,
		private native: NativeFunctionsService) {
	}

	static getSettings() {
		return {
			name: 'Color Picker',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_popupWidth', default: '80'},
				{variable: 'data_popupHeight', default: '80'},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'data_headline', default: ''},
				{variable: 'data_threshold', default: '10'},
				{variable: 'arr_data_animationStyle', default: 'scale,from-top,from-bottom,from-left,from-right,jump-in,flip-in-x,flip-in-y,scale-x,scale-y'},
				{variable: 'arr_data_colorInput', default: 'hex,#hex,rgb'},
				{variable: 'arr_data_colorOutput', default: 'hex,#hex,rgb'},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'bool_data_customAnimation', default: false},
				{variable: 'bool_data_invertAnimation', default: false}
			],
			dependencies:{
				data_threshold: { dependOn: 'bool_data_updateOnMove', value: true },
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },
				bool_data_invertAnimation: { dependOn: 'bool_data_customAnimation', value: true },
				arr_data_animationStyle: { dependOn: 'bool_data_customAnimation', value: true }

			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}

@NgModule({
	imports: [ComponentsModule, IonicModule],
  	declarations: [FhemColorPickerComponent]
})
class FhemColorPickerComponentModule {}