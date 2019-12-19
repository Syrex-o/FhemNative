import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { TimeService } from '../../services/time.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-clock',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="clock"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="60"
			minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{ID: ID, device: null, reading: null, offline: true}">
				<ng-container *ngIf="arr_data_style[0] === 'digital'">
					<svg class="date" viewBox="0 0 62 18">
						<text [attr.fill]="style_hourColor" [attr.x]="displayValue('ss') ? 0 : 10" y="15" *ngIfOnce="displayValue('HH')" class="hour">{{digitalClock.HH}}</text>
						<text [attr.fill]="style_color" [attr.x]="displayValue('ss') ? 16 : 27" y="15" *ngIfOnce="displayValue('mm')">:</text>
						<text [attr.fill]="style_minuteColor" [attr.x]="displayValue('ss') ? 21 : 32" y="15" y="15" *ngIfOnce="displayValue('mm')" class="min">{{digitalClock.mm}}</text>
						<text [attr.fill]="style_color" x="39" y="15" *ngIfOnce="displayValue('ss')">:</text>
						<text [attr.fill]="style_secondColor" x="44" y="15" *ngIfOnce="displayValue('ss')" class="sec">{{digitalClock.ss}}</text>
					</svg>
				</ng-container>
				<ng-container *ngIf="arr_data_style[0] === 'analog'">
					<svg class="date" viewBox="0 0 100 100">
						<circle [attr.stroke]="style_color" class="outer" cx="50" cy="50" r="48" stroke-width="1"></circle>
						<g *ngIfOnce="bool_data_showTicks">
							<g class="tick" *ngFor=" let i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
								[attr.fill]="style_color"
								[ngStyle]="{'transform': 'rotate('+ i * 30 +'deg)'}">
								<rect class="tick-rect" height="3" width="1" x="49.5" y="2"></rect>
								<text [attr.x]="i > 9 ? 46.5 : 48.5" y="12" class="hour-text">{{i}}</text>
							</g>
						</g>
						<g>
							<rect [attr.fill]="style_hourColor" *ngIfOnce="displayValue('HH')" class="pointer h" height="30" width="1" x="49.5" y="20" [ngStyle]="{'transform': 'rotate('+ analogClock.HH +'deg)'}"></rect>
							<rect [attr.fill]="style_minuteColor" *ngIfOnce="displayValue('mm')" class="pointer m" height="40" width="1" x="49.5" y="10" [ngStyle]="{'transform': 'rotate('+ analogClock.mm +'deg)'}"></rect>
							<rect [attr.fill]="style_secondColor" *ngIfOnce="displayValue('ss')" class="pointer s" height="45" width="1" x="49.5" y="5" [ngStyle]="{'transform': 'rotate('+ analogClock.ss +'deg)'}"></rect>
						</g>
						<circle [attr.fill]="style_color" class="middle" cx="50" cy="50" r="3"></circle>
					</svg>
				</ng-container>
			</fhem-container>
		</div>
	`,
	styles: [`
		.clock{
			position: absolute;
			width: 60px;
			height: 40px;
		}
		.date{
			width: 100%;
			height: 100%;
		}

		.date .tick,
		.date .pointer{
			transform-origin: center;
		}
		.date .hour-text{
			font-size: 7px;
		}

		.date .outer{
			fill: transparent;
		}
	`]
})
export class ClockComponent implements OnInit, OnDestroy {

	private interval:any;

	constructor(
		public settings: SettingsService,
		private time: TimeService) {}
	// Component ID
	@Input() ID: number;

	@Input() arr_data_style: Array<string>;
	@Input() arr_data_format: Array<string>;
	@Input() bool_data_showTicks: boolean;

	@Input() style_color: string;
	@Input() style_hourColor: string;
	@Input() style_minuteColor: string;
	@Input() style_secondColor: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public digitalClock: any = {
		HH: '00',
		mm: '00',
		ss: '00'
	};

	public analogClock: any = {
		HH: 0,
		mm: 0,
		ss: 0
	};

	static getSettings() {
		return {
			name: 'Clock',
			component: 'ClockComponent',
			type: 'style',
			inputs: [
				{variable: 'arr_data_style', default: 'digital,analog'},
				{variable: 'arr_data_format', default: 'HH:mm:ss,HH:mm'},
				{variable: 'bool_data_showTicks', default: true},
				{variable: 'style_color', default: '#14a9d5'},
				{variable: 'style_hourColor', default: '#14a9d5'},
				{variable: 'style_minuteColor', default: '#14a9d5'},
				{variable: 'style_secondColor', default: '#d62121'}
			],
			dimensions: {minX: 60, minY: 40}
		};
	}

	public displayValue(str){
		const re = new RegExp(str, 'g');
		return this.arr_data_format[0].match(re);
	}

	ngOnInit() {
		const update = 'update'+this.arr_data_style[0];
		this[update]();
		this.interval = setInterval(()=>{
			this[update]();
		}, 1000);
	}

	private updatedigital(){
		const t = this.time.local();
		this.digitalClock = {
			HH: t.hour,
			mm: t.minute,
			ss: t.second
		}
	}

	private updateanalog(){
		const t:any = this.time.local();
		this.analogClock = {
			HH: parseInt(t.hour) * 30 + parseInt(t.minute) * (360/720),
			mm: parseInt(t.minute) * 6 + parseInt(t.second) * (360/3600),
			ss: (360 / 60) * parseInt(t.second)
		};
	}

	ngOnDestroy(){
		clearInterval(this.interval);
	}
}
