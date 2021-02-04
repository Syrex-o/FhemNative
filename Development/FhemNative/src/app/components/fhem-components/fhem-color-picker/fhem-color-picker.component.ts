import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components.module';
// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StorageService } from '../../../services/storage.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';
import { SelectComponentService } from '../../../services/select-component.service';

@Component({
	selector: 'fhem-color-picker',
	templateUrl: './fhem-color-picker.component.html',
	styleUrls: ['./fhem-color-picker.component.scss']
})
export class FhemColorPickerComponent implements OnInit, OnDestroy {
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

	@Input() bool_data_showFavMenu: boolean;
	@Input() bool_data_usePopup: boolean;
	@Input() bool_data_customBorder: boolean;
	@Input() bool_data_updateOnMove: boolean;
	@Input() bool_data_customAnimation: boolean;
	@Input() bool_data_invertAnimation: boolean;

	@Input() arr_data_animationStyle: string|string[];

	@Input() arr_data_style: string[];

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	private waitForThreshold: number = 0;
	// popup settings
	popupState: boolean = false;
	showFavs: boolean = false;
	colorFavs: string[] = [];

	color: string;
	// container max dimension
	dimension: number = 0;

	styles: any = {
		outerRotation: 90,
		outerGradient: 'rgb(155, 134, 100)',
		innerTranslate: 'translate(0,0)',
		animateInner: true,
		animateOuter: true
	};

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (target.className.match(/(outer|inner)/)) {
			// get relevant move function
			let moveFunc: string = target.className.match(/outer/) ? 'rotateOuter' : 'moveInner';
			// update on movement, based on move function
			const whileMove = (e) => {
				e.stopPropagation();
				if(this.fhemDevice){
					this[moveFunc](e);
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
				// enable animating again
				this.styles.animateOuter = true;
				this.styles.animateInner = true;
			}

			// start move animation blocker
			if(target.className.match(/outer/)){
				this.styles.animateInner = false;
				this.styles.animateOuter = false;
			}else{
				this.styles.animateInner = false;
			}

			window.addEventListener('mousemove', whileMove);
			window.addEventListener('mouseup', endMove);

			window.addEventListener('touchmove', whileMove);
			window.addEventListener('touchend', endMove);
		}
	}

	ngOnInit(){
		// show canvas, when used outside of pupup
		if(!this.bool_data_usePopup){
			this.popupOpened();
		}
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getState(device);
		}).then(device=>{
			this.getState(device);
			if(device && device.readings[this.data_reading]){
				this.getOuterGradientColor();
			}
		});

		// resize handle
		this.selectComponent.addHandle(this.ID, 'resize', (dimensions: {[key: string]: number})=>{
			if(!this.bool_data_usePopup || (this.bool_data_usePopup && this.popupState)){
				this.width = dimensions.width + 'px';
				this.height = dimensions.height + 'px';
				this.drawCanvas();
			}
		});
	}

	private getState(device): void{
		this.fhemDevice = device;
		if(device){
			if(device.readings[this.data_reading]){
				this.color = this.colorSelector(this.arr_data_colorInput[0], 'hex', device.readings[this.data_reading].Value.toString());
				// get outer roation angle
				this.getOuterRotation();
				// get inner position
				this.getInnerPosition();
			}
		}
	}

	togglePopup(): void{
		this.popupState = !this.popupState;
	}

	// get size for canvas
	private getCanvasSize(): number{
		const container: HTMLElement = this.container.nativeElement;
		let dim: number = 0;

		if(this.bool_data_showFavMenu){
			dim = Math.min(
				container.clientWidth || parseFloat(this.width) * 0.95,
				container.clientHeight || parseFloat(this.height) * 0.9
			) -20;
		}else{
			dim = Math.min(
				container.clientWidth || parseFloat(this.width),
				container.clientHeight || parseFloat(this.height)
			) -20;
		}

		return dim;
	}

	private drawCanvas(): void{
		if(this.canvas){
			this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.dimension = this.getCanvasSize();
		// draw canvas content
		this.canvas.width = this.dimension * 0.82;
		this.canvas.height = this.dimension * 0.82;

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
	}

	popupOpened(): void{
		// assign values
		setTimeout(()=>{
			// get canvas
			this.canvas = this.container.nativeElement.querySelector('.canvas');
			this.drawCanvas();
		});
	}

	popupClosed(): void{
		if(this.canvas){
			this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	}

	// get rotation angle of outer value based on color
	private getOuterRotation(): void{
		// get hsl
		let hsl: number[] = this.colorSelector('hex', 'hsl', this.color);
		let deg = (hsl[2] / 100) * 180;
		this.styles.outerRotation = deg;
	}

	// get inner position of pointer
	private getInnerPosition(): void{
		const hsl: number[] = this.colorSelector('hex', 'hsl', this.color),
		angle: number = hsl[0] - 135,
		a: number = angle * 0.0174532925,
		x: number = Math.round(200 * -Math.sin(a)),
		y: number = Math.round(200 * -Math.cos(a));

		this.styles.innerTranslate = `translate(${x}%, ${y}%)`;
	}

	private rotateOuter(e): void{
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
		const container: DOMRect = this.canvas.getBoundingClientRect();
		const x: number = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		const y: number = e.pageY || (e.touches ? e.touches[0].clientY : 0);

		const center: {[key: string]: number} = {
			x: container.left + (container.width) / 2,
			y: container.top + (container.height) / 2,
		};

		let moveX: number = x - center.x, moveY = y - center.y;
		
		if (Math.sqrt(Math.pow(Math.abs(x - center.x), 2) + Math.pow(Math.abs(y - center.y), 2)) > container.width / 2) {
			const ratio: number = ( (x - container.left) - (container.width / 2))/( (y - container.top) - (container.height / 2));
			let sign: number = 1;
			if( (x - container.left) - (container.width / 2) < 0){
				sign = -1;
			}
			moveX = Math.sqrt(Math.pow(ratio,2)*Math.pow(container.width,2)/4/(1+Math.pow(ratio,2))) * sign;
			moveY = (moveX/ratio);
		}
		if(this.canvas.getContext('2d') && !isNaN(moveX) && !isNaN(moveY)){
			const ctx = this.canvas.getContext('2d');
			const pixel = ctx.getImageData(moveX + (container.width / 2), moveY + (container.height / 2), 1, 1).data || null;
			const dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
			const hex: string = ('0000' + dColor.toString(16)).substr(-6);
			// move inner dot
			this.styles.innerTranslate = `translate(${ moveX }px, ${ moveY }px)`;
			// validate hex
			if(/([0-9A-F]{3}){1,2}$/i.test(hex) && hex !== '00000'){
				// get hex color based on current brightness
				const currentHSL: number[] = this.colorSelector('hex', 'hsl', this.color);
				let moveHSL: number[] = this.colorSelector('hex', 'hsl', hex);
				// update moving color based on luminance of current color
				moveHSL[2] = currentHSL[2];
				// get rgb
				const rgb: number[] = this.HSLToRGB(moveHSL);
				const hexMod: string = this.RGBToHex(rgb);
				// update color
				this.color = hexMod;
				// update outer gradient
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
	}

	// get the outer gradient color
	private getOuterGradientColor(): void{
		let hsl: number[] = this.colorSelector('hex', 'hsl', this.color);
		hsl[2] = 50;
		const rgb: number[] = this.colorSelector('hsl', 'rgb', hsl);
		this.styles.outerGradient = 'rgb('+rgb[0]+', '+rgb[1]+', '+rgb[2]+')';
	}

	// calc lighter/darket color based on percentage
	private getAdjustedOuterColor(ratio: number): number[]{
		let rgb: number[] = this.styles.outerGradient.substring(4, this.styles.outerGradient.length-1).replace(/ /g, '').split(',').map(Number);
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
			if (to === 'hsl'){
				return this.hexToHSL(value);
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
		if (from === 'hsl'){
			if (to === 'rgb'){
				return this.HSLToRGB(value);
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

	private hexToHSL(hex): number[]{
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

		let r = parseInt(result[1], 16);
		let g = parseInt(result[2], 16);
		let b = parseInt(result[3], 16);

		r /= 255, g /= 255, b /= 255;
		let max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;
		if(max == min){
			h = s = 0;
		}else{
			let d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		s = Math.round(s*100), l = Math.round(l*100), h = Math.round(h*360);
		return [h,s,l];
	}

	private HSLToRGB(hsl): number[]{
		let r, g, b;
		let h = hsl[0], s = hsl[1] / 100, l = hsl[2] / 100;

		let a = s * Math.min(l,1-l);
		let f = (n,k=(n+h/30)%12) => l - a * Math.max(Math.min(k-3,9-k,1),-1); 
		return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]; 
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
		this.selectComponent.removeHandle(this.ID, 'resize');
		if(!this.bool_data_usePopup){
			this.popupClosed();
		}
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private storage: StorageService,
		private ref: ElementRef,
		private native: NativeFunctionsService,
		private selectComponent: SelectComponentService) {
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
				{variable: 'arr_data_style', default: 'standard,NM'},
				{variable: 'arr_data_animationStyle', default: 'scale,from-top,from-bottom,from-left,from-right,jump-in,flip-in-x,flip-in-y,scale-x,scale-y'},
				{variable: 'arr_data_colorInput', default: 'hex,#hex,rgb'},
				{variable: 'arr_data_colorOutput', default: 'hex,#hex,rgb'},
				{variable: 'bool_data_showFavMenu', default: true},
				{variable: 'bool_data_usePopup', default: true},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'bool_data_customAnimation', default: false},
				{variable: 'bool_data_invertAnimation', default: false}
			],
			dependencies:{
				data_threshold: { dependOn: 'bool_data_updateOnMove', value: true },
				data_borderRadius: { dependOn: ['bool_data_customBorder', 'bool_data_usePopup'], value: [false, true] },
				data_borderRadiusTopLeft: { dependOn: ['bool_data_customBorder', 'bool_data_usePopup'], value: [true, true] },
				data_borderRadiusTopRight: { dependOn: ['bool_data_customBorder', 'bool_data_usePopup'], value: [true, true] },
				data_borderRadiusBottomLeft: { dependOn: ['bool_data_customBorder', 'bool_data_usePopup'], value: [true, true] },
				data_borderRadiusBottomRight: { dependOn: ['bool_data_customBorder', 'bool_data_usePopup'], value: [true, true] },
				bool_data_invertAnimation: { dependOn: ['bool_data_customAnimation', 'bool_data_usePopup'], value: [true, true] },
				arr_data_animationStyle: { dependOn: ['bool_data_customAnimation', 'bool_data_usePopup'], value: [true, true] },
				// Dependencies for Colorpicker out of popup
				data_popupWidth: {dependOn: 'bool_data_usePopup', value: true},
				data_popupHeight: {dependOn: 'bool_data_usePopup', value: true},
				data_headline: {dependOn: 'bool_data_usePopup', value: true},
				bool_data_customBorder: {dependOn: 'bool_data_usePopup', value: true},
				bool_data_customAnimation: {dependOn: 'bool_data_usePopup', value: true}
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}

@NgModule({
	imports: [ComponentsModule, IonicModule, TranslateModule],
	declarations: [FhemColorPickerComponent]
})
class FhemColorPickerComponentModule {}