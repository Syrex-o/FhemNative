import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';

@Component({
	selector: 'fhem-colorpicker',
	template: `
		<ng-container>
			<div
				[ngClass]="settings.app.theme"
				class="colorpicker" double-click
				[editingEnabled]="settings.modes.roomEdit"
				resize
				minimumWidth="30"
				minimumHeight="30"
				id="{{ID}}"
				[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
				<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true}">
					<button
						class="color-preview"
						[style.background]="'#'+color" (click)="togglePopup()">
					</button>
				</fhem-container>
		  	</div>
		  	<popup #Popup
		  		[customMode]="true"
				[(ngModel)]="popupOpen"
				[headLine]="data_headline"
				(onClose)="clearCanvas()"
				[fixPosition]="true"
				[ngClass]="settings.app.theme">
				<div class="favs">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn right-btn" (click)="addToColorFavs()"><ion-icon name="star"></ion-icon></button>
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn left-btn" (click)="toggleFavs()"><ion-icon name="color-palette"></ion-icon></button>
				</div>
				<div class="color-selector">
					<canvas class="canvas" width="280" height="280"></canvas>
					<div class="indicator-container">
						<div class="indicator" [style.background]="'#'+color"></div>
					</div>
				</div>
				<div *ngIf="bool_data_showSlider && showSlider && fhemDevice.readings[data_sliderReading]" class="slider-elem">
					<ion-icon class="small-sun" name="sunny"></ion-icon>
					<slider [customMode]="true" [data_device]="fhemDevice.device" [data_reading]="data_sliderReading"
						[data_setReading]="data_setSliderReading" [width]="'100%'" [height]="'10px'" [top]="'5px'">
					</slider>
					<ion-icon class="big-sun" name="sunny"></ion-icon>
				</div>
		  	</popup>
		  	<picker
		  		[height]="'40%'"
				[showConfirmBtn]="false"
				[cancelBtn]="'GENERAL.BUTTONS.CLOSE' | translate"
				[(ngModel)]="showFavs"
				[ngClass]="settings.app.theme">
				<div class="list-container" *ngIf="colorFavs.length > 0">
					<div class="list-item" *ngFor="let color of colorFavs; let i = index">
						<button class="list-btn-two" matRipple [matRippleColor]="'#d4d4d480'" (click)="setFavColor(color)">
							<span class="color" [ngStyle]="{'background-color': color}"></span>
							<span class="color-label">{{color}}</span>
						</button>
						<button class="list-btn-one" matRipple [matRippleColor]="'#d4d4d480'" (click)="removeFavColor(i)">
							<ion-icon name="trash"></ion-icon>
						</button>
					</div>
				</div>
				<div class="list-container" *ngIf="colorFavs.length === 0">
					<p class="no-favs">{{ 'COMPONENTS.Color Picker.TRANSLATOR.NO_FAVOURITES' | translate }} </p>
				</div>
		  	</picker>
		</ng-container>
	`,
	styles: [`
		.colorpicker{
			position: absolute;
			width: 30px;
			height: 30px;
		}
		.color-preview{
			position: absolute;
			width: 100%;
			height: 100%;
			border-radius: 5px;
		  	box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		  	transition: all .1s ease;
		}
		button:focus{
			outline: 0px;
		}
		.favs{
			width: 100%;
			height: 40px;
		}
		.btn{
			width: 40px;
			height: 40px;
			border-radius: 50%;
			position: relative;
		}
		button{
			background: transparent;
		}
		.left-btn{
			float: left;
		}
		.right-btn{
			float: right;
		}
		.btn ion-icon{
			width: 100%;
			height: 100%;
		}
		.canvas{
			position: relative;
			left: 50%;
			top: 0;
			transform: translate3d(-50%,0,0);
		}
		.indicator-container{
			position: absolute;
			width: 25px;
			height: 25px;
			left: 50%;
			border-radius: 50%;
			top: 127px;
			transform: translate3d(-50%,0,0);
		}
		.indicator{
			position: absolute;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			border: 2px solid #fff;
		}
		.slider-elem{
			position: relative;
			margin-top: 30px;
			left: 50%;
			min-width: 280px;
			max-width: 400px;
			transform: translateX(-50%);
			height: 30px;
		}
		slider{
			position: absolute;
			left: 50%;
			width: calc(100% - 80px);
			transform: translate3d(-50%,0,0);
			top: 5px;
		}
		.small-sun,
		.big-sun{
			transform: translate3d(0,20%,0);
		}
		.small-sun{
			float: left;
			padding-left: 5px;
			padding-top: 2px;
		}
		.big-sun{
			float: right;
			font-size: 20px;
			padding-right: 5px;
		}
		.color-selector{
			overflow: hidden;
			position: relative;
		}
		.dark .btn{
			background: var(--dark-bg-dark);
		}
		.dark .no-favs,
		.dark ion-icon{
			color: var(--dark-p);
		}
		.list-container{
			position: relative;
			width: 60%;
			left: 20%;
		}
		.list-item{
			width: 100%;
			height: 35px;
			border-bottom: var(--dark-border-full);
			position: relative;
			margin-top: 5px;
		}
		.list-btn-two{
			width: 66%;
			height: 100%;
		}
		.list-btn-one{
			width: 33%;
			height: 100%;
			text-align: right;
			font-size: 30px;
			float: right;
		}
		.color{
			width: 30px;
			height: 30px;
			border-radius: 50%;
			position: relative;
			top: 50%;
			margin-left: 10px;
			float: left;
		}
		.color-label{
			font-size: 16px;
			position: absolute;
			top: 50%;
			left: 55px;
			transform: translate3d(0,-50%,0);
		}
		.no-favs{
			text-align: center;
		}
	`]
})
export class ColorpickerComponent implements OnInit, OnDestroy {
	@ViewChild('Popup', {static: true, read: ElementRef}) set content(content: ElementRef) {
		if (content) {
			this.Popup = content;
		}
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private toast: ToastService,
		private storage: StorageService) {
	}
	private Popup: ElementRef;
	private canvas: any;
	// Component ID
	@Input() ID: number;

	@Input() data_device = '';
	@Input() data_reading = '';
	@Input() data_setReading = '';

	@Input() arr_data_colorInput: string|string[] = '';
	@Input() arr_data_colorOutput: string|string[] = '';

	@Input() bool_data_showSlider = true;
	@Input() data_sliderReading = '';
	@Input() data_setSliderReading = '';


	public showSlider = false;

	@Input('') data_headline = '';

	@Input('false') bool_data_updateOnMove = false;
	@Input('10') data_threshold = '10';

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;
	// fhem event subscribtions
    private deviceChange: Subscription;

    public popupOpen = false;

    private waitForThreshold = 0;
	// current color for updates
	public color = '';

	// Color Fav Options
	public showFavs = false;
	public colorFavs: Array<any> = [];

	static getSettings() {
		return {
			name: 'Color Picker',
			component: 'ColorpickerComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_sliderReading', default: ''},
				{variable: 'data_setSliderReading', default: ''},
				{variable: 'data_headline', default: ''},
				{variable: 'data_threshold', default: '10'},
				{variable: 'arr_data_colorInput', default: 'hex,#hex,rgb'},
				{variable: 'arr_data_colorOutput', default: 'hex,#hex,rgb'},
				{variable: 'bool_data_showSlider', default: false},
				{variable: 'bool_data_updateOnMove', default: false}
			],
			dimensions: {minX: 30, minY: 30}
		};
	}
	public toggleFavs() {
		this.showFavs = !this.showFavs;
		if (this.showFavs) {
			this.storage.setAndGetSetting({name: 'colorFavs', default: []}).then((val: any) => {
				this.colorFavs = val;
			});
		}
	}
	public addToColorFavs() {
		this.colorFavs.push('#' + this.color);
		this.storage.changeSetting({name: 'colorFavs', change: this.colorFavs});
		this.toast.addNotify('Farbe gespeichert.', '', false);
	}

	public setFavColor(color) {
		this.sendValue(this.colorSelector('#hex', this.arr_data_colorOutput[0], color));
	}

	public removeFavColor(index) {
		this.colorFavs.splice(index, 1);
		this.storage.changeSetting({name: 'colorFavs', change: this.colorFavs});
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (this.fhemDevice) {
			const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   window.removeEventListener('mouseup', endMove);
	   window.removeEventListener('touchend', endMove);
	   if (this.fhemDevice.readings[this.data_reading].Value !== this.color) {
					this.sendValue(this.color);
				}
	        };

	  const whileMove = (e) => {
	        	if (this.fhemDevice) {
					this.touch(e, target);
				}
	        };
			window.addEventListener('mousemove', whileMove);
	  window.addEventListener('mouseup', endMove);

	  window.addEventListener('touchmove', whileMove);
	  window.addEventListener('touchend', endMove);
		}
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.color = this.colorSelector(this.arr_data_colorInput[0], 'hex', this.fhemDevice.readings[this.data_reading].Value);
				if (this.data_headline === '') {this.data_headline = this.data_device; }
				this.deviceChange = this.fhem.devicesSub.subscribe(next => {
			  		this.listen(next);
			  	});
			}
		});
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				if (update.change.changed[this.data_reading] !== this.color) {
					this.color = this.colorSelector(this.arr_data_colorInput[0], 'hex', update.change.changed[this.data_reading]);
				}
			}
		}
	}

	public togglePopup() {
		this.popupOpen = (!this.popupOpen && this.settings.modes.roomEdit) ? this.popupOpen : !this.popupOpen;
		if (this.popupOpen) {
			this.initCanvas();
		} else {
			this.clearCanvas();
		}
	}

	private initCanvas() {
		this.canvas = this.Popup.nativeElement.querySelector('.canvas');
		const x = this.canvas.width / 2;
  		const y = this.canvas.height / 2;
  		const sx = x;
  		const sy = y;
		const ctx = this.canvas.getContext('2d');
  		for (let i = 0; i < 360; i += 0.2) {
            const rad = (i - 45) * (Math.PI) / 180;
            ctx.strokeStyle = 'hsla(' + i + ', 100%, 50%, 1.0)';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + sx * Math.cos(-rad), y + sy * Math.sin(-rad));
            ctx.stroke();
        }
  		if (this.bool_data_showSlider) {
        	this.showSlider = true;
        }
	}

	public clearCanvas() {
		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.showSlider = false;
	}

	private touch(e, target) {
		if (target.className === 'canvas' || target.className === 'indicator') {
			const rect = this.Popup.nativeElement.querySelector('.canvas').getBoundingClientRect();
			const indicator = this.Popup.nativeElement.querySelector('.indicator');

			const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
			const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);

			const posX = (x - rect.x);
   			const posY = (y - rect.y);

   			const pixel = this.canvas.getContext('2d').getImageData(posX, posY, 1, 1).data;
		   	const dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
		   	const hex = ('0000' + dColor.toString(16)).substr(-6);
		   	this.color = this.getDimColor(hex);

		   	indicator.style.transform = `translate3d(${posX - rect.width / 2}px, ${(posY - rect.height / 2)}px, 0)`;
		   	if (this.bool_data_updateOnMove) {
				this.waitForThreshold += 1;
				if (this.waitForThreshold === parseInt(this.data_threshold)) {
					this.sendValue(this.colorSelector('hex', this.arr_data_colorOutput[0], this.color));
					this.waitForThreshold = 0;
				}
			}
		}
	}

	// calculate the color based on the current brightness
	private getDimColor(hex){
		if(this.fhemDevice && this.fhemDevice.readings[this.data_sliderReading]){
			const lum = (this.fhemDevice.readings[this.data_sliderReading].Value - 100) / 100;
			let tHex = '', c, i;
			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i*2,2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
				tHex += ("00"+c).substr(c.length);
			}
			return tHex;
		}else{
			return hex;
		}
	}

	private colorSelector(from, to, value) {
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
	}


	ngOnDestroy() {
		if (this.deviceChange !== undefined) {
			this.deviceChange.unsubscribe();
		}
	}
}
