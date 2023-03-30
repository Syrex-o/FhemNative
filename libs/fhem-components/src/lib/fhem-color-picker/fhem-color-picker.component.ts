import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MoverModule, WhileMoveEvent } from '@fhem-native/directives';
import { FhemComponent, FhemComponentModule } from '../_fhem-component';
import { PickerComponent, PopupComponent, TextBlockModule, UI_BoxComponent } from '@fhem-native/components';

import { FhemService, StorageService } from '@fhem-native/services';

import { colorSelector, ColorStyle, HSLToRGB, RGBToHex } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [
		IonicModule,
		FhemComponentModule, 
		MoverModule, 
		PopupComponent, 
		PickerComponent, 
		UI_BoxComponent,
		TextBlockModule
	],
	selector: 'fhem-native-component-color-picker',
	templateUrl: './fhem-color-picker.component.html',
	styleUrls: ['../fhem-button/fhem-button.component.scss', './fhem-color-picker.component.scss'],
})
export class FhemColorPickerComponent {
	private ctx: CanvasRenderingContext2D|null = null;
	@ViewChild('KNOB', { read: ElementRef, static: false }) knob: ElementRef|undefined;
	@ViewChild('CANVAS', { read: ElementRef, static: false }) canvas: ElementRef|undefined;
	@ViewChild('COLOR_SELECTOR', { read: ElementRef, static: false }) colorSelector: ElementRef|undefined;
	@ViewChild('COMPONENT', { read: FhemComponent, static: false }) component: FhemComponent|undefined;

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;

	// Data
	@Input() device!: string;
	@Input() reading!: string;
	@Input() setReading!: string;

	@Input() threshold!: number;

	@Input() headline!: string;
	@Input() popupWidth!: number;
	@Input() popupHeight!: number;

	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

	// Selections
	@Input() colorInput!: ColorStyle;
	@Input() colorOutput!: ColorStyle;

	// Bool
	@Input() usePopup!: boolean;
	@Input() showFavMenu!: boolean;
	@Input() customBorder!: boolean;
	@Input() updateOnMove!: boolean;

	dimSize = 0;
	popupState = false;
	favMenuState = false;
	colorFavs: string[] = [];
	styles: Record<string, any> = {
		outerRotation: 90,
		outerGradient: 'rgb(155, 134, 100)',
		innerTranslate: 'translate(0,0)',
		animateInner: true,
		animateOuter: true,
	};

	// movement
	private centerInner = { x: 0, y: 0 };
	private centerOuter = { x: 0, y: 0 };

	color: string | undefined;
	fhemDevice: FhemDevice | undefined;

	constructor(private fhem: FhemService, private storage: StorageService) {}

	onInitComponent(): void {
		this.getDimSize();
	}

	setFhemDevice(device: FhemDevice): void {
		this.getDeviceState(device);
		if (!this.usePopup) this.drawColorWheel();
	}

	updateFhemDevice(device: FhemDevice): void {
		this.getDeviceState(device);
	}

	updateScales(): void {
		if (!this.usePopup || (this.usePopup && this.popupState)) this.drawColorWheel();
	}

	private getDimSize(): void {
		const relDimensions = this.usePopup ?
			{w: window.innerWidth * (this.popupWidth / 100), h: (window.innerHeight - 100) * (this.popupHeight/ 100)} :
			{w: this.component?.elem?.nativeElement.clientWidth, h: this.component?.elem?.nativeElement.clientHeight};

		this.dimSize = (this.showFavMenu ? 
			Math.min( (relDimensions.w || 0) * 0.95, (relDimensions.h || 0) * 0.8) : 
			Math.min( relDimensions.w || 0, relDimensions.h || 0)
		) - 20;
	}

	private getDeviceState(device: FhemDevice): void {
		this.fhemDevice = device;
		if (device.readings[this.reading]){
			this.color = colorSelector(this.colorInput, 'hex', device.readings[this.reading].Value.toString());
			// get relevant gradient for outer circle
			this.getOuterGradientColor();
			// get outer roation angle
			this.getOuterRotation();
			// get inner position
			this.getInnerPosition();
		}
	}

	private drawColorWheel(): void {
		if (!this.canvas) return;
		const canvas: HTMLCanvasElement = this.canvas.nativeElement;
	
		this.ctx = canvas.getContext('2d', { willReadFrequently: true });
		if(!this.ctx) return;

		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.getDimSize();
		canvas.width = this.dimSize * 0.82;
		canvas.height = this.dimSize * 0.82;

		const x = canvas.width / 2;
		const y = canvas.height / 2;
		for (let i = 0; i < 360; i += 0.2) {
			const rad = ((i - 45) * Math.PI) / 180;
			this.ctx.strokeStyle = 'hsla(' + i + ', 100%, 50%, 1.0)';
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
			this.ctx.lineTo(x + x * Math.cos(-rad), y + y * Math.sin(-rad));
			this.ctx.stroke();
		}
	}

	startOuterMove(): void {
		const rect = this.colorSelector?.nativeElement.getBoundingClientRect();
		if (!rect) return;

		// block color animations
		this.styles['animateInner'] = false;
		this.styles['animateOuter'] = false;
		// get relevant center position
		this.centerOuter.x = rect.left + rect.width / 2;
		this.centerOuter.y = rect.top + rect.height / 2;
	}

	whileOuterMove(event: WhileMoveEvent): void {
		const actualAngle = Math.atan2(this.centerOuter.x - event.current.x, event.current.y - this.centerOuter.y);
		const deg = actualAngle * (180 / Math.PI) + 180;
		this.styles['outerRotation'] = deg;

		// color darken/lighten percentage
		let percentage = 0;
		// lighten
		if(deg >= 90 && deg <= 180) percentage = (deg - 90) / 90;
		if(deg > 180 && deg <= 270) percentage = 1 - (( deg - 180) / 90);
		// darken
		if(deg > 270 && deg <= 360) percentage = ((deg - 270) / 90) * -1;
		if(deg > 0 && deg < 90) percentage = (1 - (deg / 90)) * -1;
		
		const outerColor: number[] = this.getAdjustedOuterColor(percentage);
		this.color = colorSelector('rgb', 'hex', outerColor);

		// check for trigger
		if(event.triggerEvent && this.color) this.sendValue(this.color);
	}

	endOuterMove(): void {
		this.styles['animateInner'] = true;
		this.styles['animateOuter'] = true;

		if(this.color) this.sendValue(this.color);
	}

	startInnerMove(): void {
		const rect = this.canvas?.nativeElement.getBoundingClientRect();
		if (!rect) return;

		// block color animations
		this.styles['animateInner'] = false;
		// get relevant center position
		this.centerInner.x = rect.left + rect.width / 2;
		this.centerInner.y = rect.top + rect.height / 2;
	}

	whileInnerMove(event: WhileMoveEvent): void {
		const knobWidth = this.knob?.nativeElement.clientWidth || 0;
		const container = this.canvas?.nativeElement.getBoundingClientRect();
		if(!container) return;

		let moveX = event.current.x - this.centerInner.x, moveY = event.current.y - this.centerInner.y;
		const limit = Math.sqrt(Math.pow(Math.abs(event.current.x - this.centerInner.x), 2) + Math.pow(Math.abs(event.current.y - this.centerInner.y), 2));
		if (limit > (container.width - knobWidth) / 2) {
			let sign = 1;
			const ratio = ( (event.current.x - container.left) - ((container.width - knobWidth) / 2))/( (event.current.y - container.top) - (container.height / 2));
			if( (event.current.x - container.left) - (container.width / 2) < 0) sign = -1;
			moveX = Math.sqrt(Math.pow(ratio,2)*Math.pow(container.width - knobWidth,2)/4/(1+Math.pow(ratio,2))) * sign;
			moveY = moveX / ratio;
		}
		if(!this.ctx || isNaN(moveX) || isNaN(moveY)) return;

		const pixel = this.ctx.getImageData(moveX + (container.width / 2), moveY + (container.height / 2), 1, 1).data || null;
		const dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
		const hexV = '0000' + dColor.toString(16);
		const hex = hexV.substring(hexV.length -6, hexV.length);
		
		// validate hex
		if(!(/([0-9A-F]{3}){1,2}$/i.test(hex)) || hex === '00000') return;

		// move inner dot
		this.styles['innerTranslate'] = `translate(${ moveX }px, ${ moveY }px)`;

		// get hex color based on current brightness
		const currentHSL: number[] = colorSelector('hex', 'hsl', this.color);
		const moveHSL: number[] = colorSelector('hex', 'hsl', hex);
		// update moving color based on luminance of current color
		moveHSL[2] = currentHSL[2];
		// get rgb
		const rgb: number[] = HSLToRGB(moveHSL);
		const hexMod: string = RGBToHex(rgb);
		// update color
		this.color = hexMod;
		// update outer gradient
		this.getOuterGradientColor();
		// check for trigger
		if(event.triggerEvent) this.sendValue(this.color);
	}

	endInnerMove(): void {
		this.styles['animateInner'] = true;

		if(this.color) this.sendValue(this.color);
	}

	private getOuterGradientColor(): void{
		const hsl: number[] = colorSelector('hex', 'hsl', this.color);
		hsl[2] = 50;
		const rgb: number[] = colorSelector('hsl', 'rgb', hsl);
		this.styles['outerGradient'] = 'rgb('+rgb[0]+', '+rgb[1]+', '+rgb[2]+')';
	}

	// calc lighter/darket color based on percentage
	private getAdjustedOuterColor(ratio: number): number[]{
		const rgb: number[] = this.styles['outerGradient'].substring(4, this.styles['outerGradient'].length-1).replace(/ /g, '').split(',').map(Number);
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

	private getOuterRotation(): void{
		// get hsl
		const hsl: number[] = colorSelector('hex', 'hsl', this.color);
		this.styles['outerRotation'] = (hsl[2] / 100) * 180;
	}

	// get inner position of pointer
	private getInnerPosition(): void{
		const hsl: number[] = colorSelector('hex', 'hsl', this.color),
		angle: number = hsl[0] - 135,
		a: number = angle * 0.0174532925,
		x: number = Math.round(200 * -Math.sin(a)),
		y: number = Math.round(200 * -Math.cos(a));

		this.styles['innerTranslate'] = `translate(${x}%, ${y}%)`;
	}

	private sendValue(color: string): void{
		if(!this.fhemDevice) return;

		const formattedColor = colorSelector('hex', this.colorOutput, color);
		if(this.fhemDevice.readings[this.reading].Value === formattedColor) return;

		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, formattedColor);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, formattedColor);
	}

	togglePopup(): void {
		this.popupState = !this.popupState;
		if(this.popupState) this.drawColorWheel();
	}

	async toggleFavs() {
		this.favMenuState = !this.favMenuState;
		if(this.showFavMenu) this.colorFavs = await this.storage.setAndGetSetting({name: 'colorFavs', default: JSON.stringify([])});
	}

	setFavColor(color: string): void{
		this.sendValue(colorSelector('#hex', this.colorOutput, color));
	}

	removeFavColor(index: number): void{
		this.colorFavs.splice(index, 1);
		this.storage.changeSetting({name: 'colorFavs', change: JSON.stringify(this.colorFavs)});
	}

	addToColorFavs(): void {
		// check for same color
		if(!this.colorFavs.includes('#' + this.color)){
			this.colorFavs.push('#' + this.color);
			this.storage.changeSetting({name: 'colorFavs', change: JSON.stringify(this.colorFavs)});
		}
	}
}
