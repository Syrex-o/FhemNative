// credts to: https://github.com/akveo/ngx-admin (Temperature dragger)
import { Component, HostListener, ViewChild, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';

@Component({
	selector: 'fhem-circular-slider',
	template: `
		<div class="circular-slider"
			[ngClass]="settings.app.theme"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="100"
			minimumHeight="100"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}"
			(onResize)="resize()">
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<div class="svg-container">
					<svg #svgRoot xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
						 [attr.viewBox]="styles.viewBox" preserveAspectRatio="xMinYMin meet">
						<defs>
							<filter [attr.id]="'blurFilter' + svgControlId" x="0" y="0" width="100%" height="100%">
								<feGaussianBlur in="SourceGraphic" [attr.stdDeviation]="styles.blurRadius" />
								<feComponentTransfer>
								<feFuncA type="discrete" tableValues="1 1"/>
									</feComponentTransfer>
							</filter>
							<clipPath [attr.id]="'sliderClip' + svgControlId">
								<path [attr.d]="styles.clipPathStr" stroke="black"></path>
							</clipPath>
						</defs>
						<g [attr.transform]="styles.arcTranslateStr" class="container">
							<circle cx="0" cy="0" [attr.r]="radius - (data_arcThickness / 2)" [attr.fill]="style_backgroundColor" class="circle-bg" [attr.transform]="styles.translateBg"/>
							<g class="toClip" [attr.clip-path]="'url(#sliderClip' + svgControlId +')'">
								<g class="toFilter" [attr.filter]="'url(#blurFilter' + svgControlId +')'">
									<path [attr.d]="arc.d" [attr.fill]="arc.color" *ngFor="let arc of styles.gradArcs"></path>
								</g>
								<!-- ngFor is a quirk fix for webkit rendering issues -->
								<path [attr.d]="styles.nonSelectedArc.d" [attr.fill]="styles.nonSelectedArc.color" *ngFor="let number of [0,1,2,3,4,5]"></path>
							</g>
							<circle [attr.cx]="styles.thumbPosition.x" [attr.cy]="styles.thumbPosition.y" [attr.r]="pinRadius" [attr.fill]="style_thumbColor" [attr.stroke-width]="data_thumbBorder / scaleFactor" class="circle"></circle>
						</g>
					</svg>
					<div class="labels">
						<p class="text" [ngStyle]="{'font-size.px': data_textSize, 'color': style_thumbColor}">{{value + data_labelExtension}}</p>
						<p class="subline" [ngStyle]="{'color': style_thumbColor}">{{data_label}}</p>
					</div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.circular-slider{
			position: absolute;
			width: 200px;
			height: 200px;
		}
		.svg-container{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		svg{
			width: 100%;
			height: 100%;
		}
		.circle-bg{
			opacity: 0.5;
		}
		.circle{
			cursor: pointer;
		}
		.labels{
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
		}
		.text{
			font-weight: 500;
			margin-bottom: 0;
		}
		.subline{
			font-weight: 300;
			opacity: 0.3;
			margin-top: 0;
		}
	`],
})
export class CircleSliderComponent implements AfterViewInit, OnDestroy {
	@ViewChild('svgRoot', {static: true, read: ElementRef}) set content(content: ElementRef) {
		if (content) {
			// 0 width / height fix
			setTimeout(() => {
				if (content.nativeElement.lastChild) {
					this.svgRoot = content;
					if (!this.init) {
						setTimeout(() => {
						    this.invalidate();
						    this.init = true;
						}, 0);
					}
				}
			}, 0);
		}
	}

	constructor(
		public settings: SettingsService,
		private fhem: FhemService) {
		this.oldValue = this.value;
	}
	private svgRoot: ElementRef;

	// Component ID
	@Input() ID: number;

	@Input() data_device = '';
	@Input() data_reading = '';
	@Input() data_setReading = '';

	@Input() bool_data_updateOnMove = false;
	@Input() data_threshold = '20';

	@Input() data_textSize = '40';

	@Input() data_labelExtension = '';
	@Input() data_label = '';

	@Input() data_bottomAngle = '90';
	@Input() data_arcThickness: any = '18'; // CSS pixels
	@Input() data_thumbRadius = '16'; // CSS pixels
	@Input() data_thumbBorder: any = '3';

	@Input() style_backgroundColor = '#272727';
	@Input() style_thumbColor = '#fbfbfb';
	@Input() arr_style_fillColors: any = ['#2ec6ff','#272727'];

	@Input() data_min = '0';
	@Input() data_max = '100';
	@Input() data_step = '0.1';

	public value: number = 0;

	private waitForThreshold = 0;

	VIEW_BOX_SIZE: any = 300;

	oldValue: number;

	svgControlId = new Date().getTime();
	scaleFactor = 1;
	bottomAngleRad = 0;
	radius = 100;
	translateXValue = 0;
	translateYValue = 0;
	thickness = 6;
	pinRadius = 10;
	colors: any = [];

	styles: any = {
		viewBox: '0 0 300 300',
		arcTranslateStr: 'translate(0, 0)',
		clipPathStr: '',
		gradArcs: [],
		nonSelectedArc: {},
		thumbPosition: { x: 0, y: 0 },
		blurRadius: 15,
		translateBg: 'translate(0, 0)',
	};

	private init = false;

	// position information
	@Input() width: any;
	@Input() height: any;
	@Input() top: any;
	@Input() left: any;
	@Input() zIndex: any;

	public fhemDevice: any;
	// fhem event subscribtions
    private deviceChange: Subscription;

	private static toRad(angle) {
		return Math.PI * angle / 180;
	}

	static getSettings() {
		return {
			name: 'Circle Slider',
			component: 'CircleSliderComponent',
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
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'style_backgroundColor', default: '#272727'},
				{variable: 'style_thumbColor', default: '#fbfbfb'},
				{variable: 'arr_style_fillColors', default: '#2ec6ff,#272727'}
			],
			dimensions: {minX: 200, minY: 200}
		};
	}

	@HostListener('mousedown', ['$event', '$event.target'])
	@HostListener('touchstart', ['$event', '$event.target'])
	onTouchstart(event, target) {
		if (target.className.baseVal === 'circle') {
			const whileMove = (e) => {
	        	e.stopPropagation();
	        	if (this.fhemDevice) {
					this.recalculateValue(e);
				}
	        };
			const endMove = () => {
				window.removeEventListener('mousemove', whileMove);
				window.removeEventListener('touchmove', whileMove);

	   			window.removeEventListener('mouseup', endMove);
	   			window.removeEventListener('touchend', endMove);
	   			if (this.fhemDevice) {
					if (parseFloat(this.fhemDevice.readings[this.data_reading].Value) !== this.value) {
						this.sendValue(this.value);
					}
				}
	        };
			window.addEventListener('mousemove', whileMove);
	  		window.addEventListener('mouseup', endMove);

	  		window.addEventListener('touchmove', whileMove);
	  		window.addEventListener('touchend', endMove);
		}
	}

	public resize() {
		if (this.fhemDevice) {
			this.invalidate();
		}
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
				this.fhemDevice = device;
				if (device) {
					this.value = parseFloat(this.fhemDevice.readings[this.data_reading].Value);
					this.data_label = (this.data_label === '') ? this.fhemDevice.device : this.data_label;
					this.deviceChange = this.fhem.devicesSub.subscribe(next => {
						this.listen(next);
					});
					this.invalidatePinPosition();
				}
			});
		}, 0);
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				const updateValue = parseFloat(update.change.changed[this.data_reading]);
				if (updateValue !== this.value) {
					this.value = updateValue;
					this.invalidate();
				}
			}
		}
	}

	private invalidate(): void {
		this.bottomAngleRad = CircleSliderComponent.toRad(parseInt(this.data_bottomAngle));
		this.calculateVars();

		this.invalidateClipPathStr();
		this.invalidatePinPosition();

		setTimeout(() => {this.invalidateGradientArcs(); });
	}

	private calculateVars() {
		this.colors = (typeof this.arr_style_fillColors === 'string') ? [this.arr_style_fillColors] : this.arr_style_fillColors;
		this.bottomAngleRad = CircleSliderComponent.toRad(parseInt(this.data_bottomAngle));

		const halfAngle = this.bottomAngleRad / 2;

		const svgBoundingRect = this.svgRoot.nativeElement.getBoundingClientRect();

		let w, h;

		if (!this.init) {
			w = this.width === '' ? 100 : parseInt(this.width);
			h = this.height === '' ? 100 : parseInt(this.height);
		} else {
			w = svgBoundingRect.width;
			h = svgBoundingRect.height;
		}

		this.VIEW_BOX_SIZE = Math.max(w, h);

		const svgAreaFactor = h && w / h || 1;
		const svgHeight = this.VIEW_BOX_SIZE / svgAreaFactor;
		const thumbMaxRadius = parseInt(this.data_thumbRadius) + parseInt(this.data_thumbBorder);
		const thumbMargin = 2 * thumbMaxRadius > parseInt(this.data_arcThickness) ? (thumbMaxRadius - parseInt(this.data_arcThickness) / 2) / this.scaleFactor : 0;

		this.scaleFactor = Math.min(w, h) / this.VIEW_BOX_SIZE || 1;
		this.styles.viewBox = `0 0 ${this.VIEW_BOX_SIZE} ${svgHeight}`;


		const circleFactor = this.bottomAngleRad <= Math.PI
			? ( 2 / (1 + Math.cos(halfAngle)) )
			: ( 2 * Math.sin(halfAngle) / (1 + Math.cos(halfAngle)) );
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

	private calculateClipPathSettings() {
		const halfAngle = this.bottomAngleRad / 2;
		const innerRadius = this.radius - this.thickness;

		const xStartMultiplier = 1 - Math.sin(halfAngle);
		const yMultiplier = 1 + Math.cos(halfAngle);
		const xEndMultiplier = 1 + Math.sin(halfAngle);

		return {
			outer: {
				start: {
					x: xStartMultiplier * this.radius,
					y: yMultiplier * this.radius,
				},
				end: {
					x: xEndMultiplier * this.radius,
					y: yMultiplier * this.radius,
				},
				radius: this.radius,
			},
			inner: {
				start: {
					x: xStartMultiplier * innerRadius + this.thickness,
					y: yMultiplier * innerRadius + this.thickness,
				},
				end: {
					x: xEndMultiplier * innerRadius + this.thickness,
					y: yMultiplier * innerRadius + this.thickness,
				},
				radius: innerRadius,
			},
			thickness: this.thickness,
			big: this.bottomAngleRad < Math.PI ? '1' : '0',
		};

	}

	private invalidateClipPathStr() {
		const s = this.calculateClipPathSettings();

		let path = `M ${s.outer.start.x},${s.outer.start.y}`; // Start at startangle top

		// Outer arc
		// Draw an arc of radius 'radius'
		// Arc details...
		path += ` A ${s.outer.radius},${s.outer.radius}
			 0 ${s.big} 1
			 ${s.outer.end.x},${s.outer.end.y}`; // Arc goes to top end angle coordinate

		// Outer to inner connector
		path += ` A ${s.thickness / 2},${s.thickness / 2}
			 0 1 1
			 ${s.inner.end.x},${s.inner.end.y}`;

		// Inner arc
		path += ` A ${s.inner.radius},${s.inner.radius}
			 1 ${s.big} 0
			 ${s.inner.start.x},${s.inner.start.y}`;

		// Outer to inner connector
		path += ` A ${s.thickness / 2},${s.thickness / 2}
			 0 1 1
			 ${s.outer.start.x},${s.outer.start.y}`;

		// Close path
		path += ' Z';
		this.styles.clipPathStr = path;
	}

	private calculateGradientConePaths(angleStep) {
		const radius = this.radius;

		function calcX(angle) {
			return radius * (1 - 2 * Math.sin(angle));
		}

		function calcY(angle) {
			return radius * (1 + 2 * Math.cos(angle));
		}

		const gradArray = [];

		for (let i = 0, currentAngle = this.bottomAngleRad / 2; i < this.colors.length; i++, currentAngle += angleStep) {
			gradArray.push({
				start: { x: calcX(currentAngle), y: calcY(currentAngle) },
				end: { x: calcX(currentAngle + angleStep), y: calcY(currentAngle + angleStep) },
				big: Math.PI <= angleStep ? 1 : 0,
			});
		}
		return gradArray;
	}

	private invalidateGradientArcs() {
		const radius = this.radius;

		function getArc(des) {
			return `M ${radius},${radius}
				 L ${des.start.x},${des.start.y}
				 A ${2 * radius},${2 * radius}
				 0 ${des.big} 1
				 ${des.end.x},${des.end.y}
				 Z`;
		}

		const angleStep = (2 * Math.PI - this.bottomAngleRad) / this.colors.length;
		const s = this.calculateGradientConePaths(angleStep);

		this.styles.gradArcs = [];
		for (let i = 0; i < s.length; i++) {
			const si = s[i];
			const arcValue = getArc(si);
			this.styles.gradArcs.push({
				color: this.colors[i],
				d: arcValue,
			});
		}

		this.styles.blurRadius = 2 * radius * Math.sin(angleStep / 6);
	}

	private invalidateNonSelectedArc() {
		const angle = this.bottomAngleRad / 2 + (1 - this.getValuePercentage()) * (2 * Math.PI - this.bottomAngleRad);
		this.styles.nonSelectedArc = {
			color: this.style_backgroundColor,
			d: `M ${this.radius},${this.radius}
			 L ${this.radius},${3 * this.radius}
			 A ${2 * this.radius},${2 * this.radius}
			 1 ${angle > Math.PI ? '1' : '0'} 0
			 ${this.radius + this.radius * 2 * Math.sin(angle)},${this.radius + this.radius * 2 * Math.cos(angle)}
			 Z`,
		};
	}

	private invalidatePinPosition() {
		const radiusOffset = this.thickness / 2;
		const curveRadius = this.radius - radiusOffset;
		const actualAngle = (2 * Math.PI - this.bottomAngleRad) * this.getValuePercentage() + this.bottomAngleRad / 2;
		this.styles.thumbPosition = {
			x: curveRadius * (1 - Math.sin(actualAngle)) + radiusOffset,
			y: curveRadius * (1 + Math.cos(actualAngle)) + radiusOffset,
		};
		this.invalidateNonSelectedArc();
	}

	private recalculateValue(e) {
		const rect = this.svgRoot.nativeElement.getBoundingClientRect();
		const center = {
			x: rect.left + this.VIEW_BOX_SIZE * this.scaleFactor / 2,
			y: rect.top + (this.translateYValue + this.radius) * this.scaleFactor,
		};
		const x = e.pageX || (e.touches ? e.touches[0].clientX : 0);
		const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);
		let actualAngle = Math.atan2(center.x - x, y - center.y);
		if (actualAngle < 0) {
			actualAngle = actualAngle + 2 * Math.PI;
		}

		const previousRelativeValue = this.getValuePercentage();
		let relativeValue = 0;
		if (actualAngle < this.bottomAngleRad / 2) {
			relativeValue = 0;
		} else if (actualAngle > 2 * Math.PI - this.bottomAngleRad / 2) {
			relativeValue = 1;
		} else {
			relativeValue = (actualAngle - this.bottomAngleRad / 2) / (2 * Math.PI - this.bottomAngleRad);
		}

		const value = this.toValueNumber(relativeValue);
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

	private getValuePercentage() {
		return (this.value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min));
	}

	private toValueNumber(factor) {
		return Math.round(factor * (parseInt(this.data_max) - parseInt(this.data_min)) / parseFloat(this.data_step)) * parseFloat(this.data_step) + parseInt(this.data_min);
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
