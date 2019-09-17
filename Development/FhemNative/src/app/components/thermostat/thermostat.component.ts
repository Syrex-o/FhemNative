import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-thermostat',
	template: `
		<ng-container>
			<div
				[ngClass]="settings.app.theme"
				class="thermostat" double-click
				[editingEnabled]="settings.modes.roomEdit"
				resize
				minimumWidth="100"
				minimumHeight="40"
				id="{{ID}}"
				[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
				<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true}">
					<ng-container
						available
						*ngIf="fhemDevice">
						<svg #Thermostat xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 20 250 470">
							<defs>
						    	<linearGradient [attr.id]="LIQUIDGRAD_UID" x1="57" y1="150" x2="57" y2="546" gradientUnits="userSpaceOnUse">
						      		<stop [attr.stop-color]="style_gradientColor1" offset="0"/>
						      		<stop [attr.stop-color]="style_gradientColor2" offset="0.2"/>
						      		<stop [attr.stop-color]="style_gradientColor3" offset="0.5"/>
						      		<stop [attr.stop-color]="style_gradientColor4" offset="1"/>
						    	</linearGradient>
								<rect id="tube" x="110" y="150" width="86" height="400" rx="43" ry="43"/>
						    		<clipPath id="liquidMask">
						        		<use xlink:href="#tube" class="liquidMask" />
						    		</clipPath>
						   			<clipPath id="tubeMask">
						        		<use xlink:href="#tube" class="liquidMask" />
						    		</clipPath>
						   			<path id="liquid" d="M757,552v490H357V552c50,0,50,20,100,20s50-20,100-20,50,20,100,20S707,552,757,552Z" />
								<mask [attr.id]="GRADMASK_UID">
						      		<use xlink:href="#liquid" class="liquid" x="0" fill="#FCEFD6" />
						      		<use xlink:href="#liquid" class="liquid" x="0" fill="#EEE" opacity="0.7"/>
						    	</mask>
						  	</defs>
						  	<g class="whole" transform="translate(0, -100)">
						  		<use xlink:href="#tube" class="tubeBg" fill="#C8D9D3" opacity="0.61"/>
						  		<g class="dragger">
						  			<circle class="drag" cx="50" cy="160" r="36"/>
				        			<path class="dragTip drag" d="M315.5,556.76,299.24,540.5l16.26-16.26,36.26,16.26Z"/>
				        			<text class="label drag" x="50" y="170">{{fhemDevice.readings[data_reading].Value}}&#8451;</text>
				        			<text class="labelReplace drag" x="50" y="170">{{fhemDevice.readings[data_reading].Value}}&#8451;</text>
						  		</g>
						  		<g [attr.mask]="'url(#'+GRADMASK_UID+')'">
						        	<use xlink:href="#tube" [attr.fill]="'url(#'+LIQUIDGRAD_UID+')'" />
						  		</g>
						  		<line class="tubeShine" x1="130" y1="200" x2="130" y2="443" fill="none" stroke="#FFF" stroke-linecap="round" stroke-miterlimit="10" stroke-width="8" opacity="0.21" stroke-dasharray="153 30" stroke-dashoffset="-20"/>
						  		<g class="measurements" fill="none" stroke-width="3" stroke-linecap="round" opacity="1">
						  			<line x1="112" y1="196" x2="130" y2="196" />
					        		<line x1="112" y1="234" x2="130" y2="234" />
					        		<line x1="112" y1="273" x2="130" y2="273" />
							        <line x1="112" y1="311" x2="130" y2="311" />
							        <line x1="112" y1="350" x2="130" y2="350" />
							        <line x1="112" y1="388" x2="130" y2="388" />
							        <line x1="112" y1="426" x2="130" y2="426" />
							        <line x1="112" y1="465" x2="130" y2="465" />
							        <line x1="112" y1="503" x2="130" y2="503" />
						  		</g>
						  	</g>
						</svg>
					</ng-container>
				</fhem-container>
			</div>
		</ng-container>
	`,
	styles: [`
		.dark .dragger circle,
		.dark .dragger path{
			fill: var(--dark-p);
		}
		.thermostat{
			position: absolute;
			width: 120px;
			height: 170px;
		}
		svg{
			width: 100%;
			height: 100%;
		}
		line{
			stroke: #fff;
		}
		.dragger{
			cursor: pointer;
		}
		.dragger circle,
		.dragger path{
			fill: #ddd;
		}
		.dragger text{
			font-size: 1.7em;
			position: absolute;
			transform: translate3d(-25px,0,0);
		}
		.dragTip{
			transform: translate3d(-245px, -380px,0);
			transformOrigin:'20% 50%';
		}
		#liquid{
			position: absolute;
			animation: mover 1s linear infinite;
		}
		@keyframes mover{
			0%{
				transform: translate3d(-100%, -80%,0);
			}
			100%{
				transform: translate3d(-180%, -80%,0);
			}
		}
		.labelReplace{
			opacity: 0;
		}
		.label{
			opacity: 1;
		}
		.label,
		.labelReplace{
			transition: opacity .2s ease;
		}
		.labelReplace.show{
			opacity: 1;
		}
		.label.hide{
			opacity: 0;
		}
	`]
})
export class ThermostatComponent implements OnInit, OnDestroy {
	@ViewChild('Thermostat', {static: true, read: ElementRef}) set content(content: ElementRef) {
		if (content) {
			this.Thermostat = content;
			this.updateThermostat(83);
		}
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService) {
	}
	private Thermostat: ElementRef;
	// Component ID
	@Input() ID: number;

	@Input() data_device = '';
	@Input() data_reading = '';
	@Input() data_setReading = '';

	@Input() data_min = '0';
	@Input() data_max = '100';

	@Input() bool_data_updateOnMove = false;
	@Input() data_threshold = '10';

	// Styling
	@Input() style_gradientColor1 = '#FF0909';
	@Input() style_gradientColor2 = '#F3481A';
	@Input() style_gradientColor3 = '#FABA2C';
	@Input() style_gradientColor4 = '#00BCF2';

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;
	// fhem event subscribtions
    private deviceChange: Subscription;

    private waitForThreshold = 0;
	// current value for updates
	private value = 0;

	public LIQUIDGRAD_UID = '_' + Math.random().toString(36).substr(2, 9);
	public GRADMASK_UID = '_' + Math.random().toString(36).substr(2, 9);

	static getSettings() {
		return {
			name: 'Thermostat',
			component: 'ThermostatComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_min', default: '0'},
				{variable: 'data_max', default: '100'},
				{variable: 'data_threshold', default: '10'},
				{variable: 'bool_data_updateOnMove', default: false},
				{variable: 'style_gradientColor1', default: '#FF0909'},
				{variable: 'style_gradientColor2', default: '#F3481A'},
				{variable: 'style_gradientColor3', default: '#FABA2C'},
				{variable: 'style_gradientColor4', default: '#00BCF2'},
			],
			dimensions: {minX: 120, minY: 170}
		};
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

	   if (parseInt(this.fhemDevice.readings[this.data_reading].Value) !== this.value) {
					this.sendValue(this.value);
					const dragger = this.Thermostat.nativeElement.querySelector('.dragger');
					this.pseudoLabel(dragger, false);
				}
	        };
	  const whileMove = (e) => {
				this.mover(e, target);
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
				this.value = parseInt(this.fhemDevice.readings[this.data_reading].Value);
				this.deviceChange = this.fhem.devicesSub.subscribe(next => {
				 		this.listen(next);
				});
			}
		});
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				const oldValue = 83 - Math.round(((this.value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min))) * 83);
				const updateValue = parseInt(update.change.changed[this.data_reading]);
				if (updateValue !== this.value) {
					this.value = updateValue;
					this.updateThermostat(oldValue);
				}
			}
		}
	}

	private updateThermostat(from) {
		const thermostat = this.Thermostat.nativeElement;
		const liquid = thermostat.querySelectorAll('.liquid');
		const dragger = thermostat.querySelector('.dragger');
		const value: any = 83 - Math.round(((this.value - parseInt(this.data_min)) / (parseInt(this.data_max) - parseInt(this.data_min))) * 83);
		this.animateY(dragger, from, value);
		for (let i = 0; i < liquid.length; i++) {this.animateY(liquid[i], from, Math.round(parseInt(value) - 5)); }
	}

	private mover(e, target) {
		if (e.target.className.baseVal && e.target.className.baseVal.indexOf('drag') !== -1) {
			const thermostat = this.Thermostat.nativeElement;
			const liquid = thermostat.querySelectorAll('.liquid');
			const dragger = thermostat.querySelector('.dragger');
			this.pseudoLabel(dragger, true);
			const tube = thermostat.querySelector('.tubeBg');
			const y = e.pageY || (e.touches ? e.touches[0].clientY : 0);
			let move = ((y - tube.getBoundingClientRect().top) / (tube.getBoundingClientRect().height + ((thermostat.getBoundingClientRect().height - tube.getBoundingClientRect().height)) - (dragger.getBoundingClientRect().height / 4))) * 100;
			if (move <= 0) {move = 0; }
			if (move >= 83) {move = 83; }
			let value = ((Math.round(parseInt(this.data_max) - ( y -  tube.getBoundingClientRect().top) / tube.getBoundingClientRect().height * (parseInt(this.data_max) - parseInt(this.data_min)))) * (parseInt(this.data_max) - parseInt(this.data_min))) / (parseInt(this.data_max) - parseInt(this.data_min));
			if (value <= parseInt(this.data_min)) {value = parseInt(this.data_min); }
			if (value >= parseInt(this.data_max)) {value = parseInt(this.data_max); }
			this.value = value;
			dragger.style.transform = `translate3d(0,${move}%,0)`;
			dragger.querySelector('.labelReplace').innerHTML = value + '&#8451;';
			for (let i = 0; i < liquid.length; i++) {
  				liquid[i].style.transform = 'translate3d(0,' + (move - 5) + '%,0)';
  			}
  	if (this.bool_data_updateOnMove) {
				this.waitForThreshold += 1;
				if (this.waitForThreshold === parseInt(this.data_threshold)) {
					this.sendValue(this.value);
					this.waitForThreshold = 0;
				}
			}
		}
	}

	private animateY(elem, from, to) {
  		let pos = from;
  		const id = setInterval(frame, 5);
  		const count = (from > to) ? -1 : 1;
  		function frame() {
  			if (pos === to) {
  				clearInterval(id);
  			} else {
  				pos = pos + count;
  				elem.style.transform = 'translate3d(0,' + pos + '%,0)';
  			}
  		}
  	}

	private pseudoLabel(elem, show) {
  		if (show) {
  			elem.querySelector('.labelReplace').classList.add('show');
  			elem.querySelector('.label').classList.add('hide');
  		} else {
  			elem.querySelector('.labelReplace').classList.remove('show');
  			elem.querySelector('.label').classList.remove('hide');
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
