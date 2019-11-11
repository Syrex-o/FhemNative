import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { TimeService } from '../../services/time.service';

@Component({
	selector: 'media-list',
	template: `
		<div
			*ngIf="!customMode"
			[ngClass]="settings.app.theme"
			class="media-list"
			resize
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			minimumWidth="200" minimumHeight="80"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true}">
				<ng-container *ngTemplateOutlet="MediaList"></ng-container>
			</fhem-container>
		</div>
		<div *ngIf="customMode" class="customMode" [ngClass]="settings.app.theme">
			<ng-container *ngTemplateOutlet="MediaList"></ng-container>
		</div>

		<ng-template #MediaList>
			<div class="playlist-container">
				<table class="playlist">
					<thead colspan="2">
						<tr *ngIf="!customMode" class="header">
							<th class="text">
								<p>{{'COMPONENTS.MediaList.DICTIONARY.TOTAL_DURATION' | translate}}</p>
								<p *ngIf="fhemDevice?.readings.currentdir_playlistduration" class="length">{{time.secToTime(fhemDevice.readings.currentdir_playlistduration.Value)}}</p>
							</th>
							<th class="icon">
								<button matRipple [matRippleColor]="'#d4d4d480'" (click)="toggleAll()">
									<ion-icon name="play"></ion-icon>
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr class="playlist-item" *ngFor="let item of list; let i = index">
							<button class="item-btn" matRipple [matRippleColor]="'#d4d4d480'" (click)="toggle(i)">
								<td class="item index">
									<p>{{i+1}}</p>
								</td>
								<td class="item image">
									<img [src]="item.Cover">
								</td>
								<td class="item info">
									<p class="song">{{item.Title}}</p>
									<p class="artist">{{item.Artist}}</p>
								</td>
								<td class="item time">
									<p>{{time.secToTime(item.Time)}}</p>
								</td>
							</button>
							<td class="item icon">
								<button class="btn" matRipple [matRippleColor]="'#d4d4d480'" (click)="showDetails(i)">
									<ion-icon name="more"></ion-icon>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</ng-template>

		<picker
			*ngIf="displayDetails.show"
			[height]="'65%'"
			[(ngModel)]="displayDetails.show"
			[showCancelBtn]="false"
			[confirmBtn]="'GENERAL.BUTTONS.CLOSE' | translate"
			[ngClass]="settings.app.theme">
			<div class="page">
				<div class="image-container">
					<img [src]="list[displayDetails.index].Cover">
				</div>
				<div class="song-info-container">
					<p class="song" *ngIf="list[displayDetails.index].Title">{{list[displayDetails.index].Title}}</p>
					<p class="album" *ngIf="list[displayDetails.index].Album">{{list[displayDetails.index].Album}}</p>
					<p class="artist" *ngIf="list[displayDetails.index].Artist">{{list[displayDetails.index].Artist}}</p>
					<p class="time" *ngIf="list[displayDetails.index].Time">{{time.secToTime(list[displayDetails.index].Time)}}</p>
				</div>
			</div>
		</picker>
	`,
	styles: [`
		.media-list{
			position: absolute;
			width: 100px;
			height: 80px;
		}
		.playlist-container{
			position: absolute;
			width: 100%;
			height: 100%;
			overflow: auto;
		}
		.playlist{
			width: 100%;
			height: 50px;
			table-layout: fixed;
			border-collapse: collapse;
		}
		tbody tr{
			border-bottom: 1px solid #e8eae9;
		}
		td{
			height: 50px;
			font-size: 1.1em;
		}
		.item-btn{
			height: 50px;
		    margin: 0;
		    padding: 0;
		    width: 100%;
		    display: flex;
		}
		.item.index{
			width: 20px;
			line-height: 50px;
			min-width: 20px;
		}
		.item.image{
			width: 50px;
			text-align: center;
		}
		.image img{
			max-width: 45px;
			height: auto;
			margin-top: 2.5px;
		}
		.item.info .song,
		.item.info .artist{
			text-align: left;
		}
		.item.info .song{
			margin-top: 10px;
    		margin-bottom: 5px;
		}
		.item.time{
			width: 50px;
			text-align: right;
			font-size: 0.8em;
			line-height: 50px;
			padding-right: 5px;
			margin-left: 10px;
		}
		.item.icon .btn{
			width: 40px;
			height: 50px;
		    margin: 0;
		    padding: 0;
		    font-size: 1.5em;
		}
		.artist,
		.page .song-info-container{
			font-size: 0.8em;
			color: var(--p-small);
		}
		p{
			margin: 0;
		}
		.item.info{
  			padding-left: 10px;
  			overflow: hidden;
  			width: 80%;
		}
		.item.info .song,
		.item.info .artist{
			overflow: hidden;
  			white-space: nowrap;
  			text-overflow: ellipsis;
		}
		button{
			background: transparent;
		}
		button:focus{
			outline: 0px;
		}
		.page{
			padding: 18px;
		}
		.page .image-container{
			max-width: 200px;
			margin: auto;
		}
		.page .song-info-container{
			text-align: center;
			margin: 15px;
			line-height: 20px;
		}
		.header,
		.header .icon button{
			height: 45px;
		}
		th{
			position: sticky;
		    top: 0;
		    z-index: 5;
		    background: #fff;
		    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.4);
		}
		.header td{
			width: 50%;
			text-align: center;
		}

		.header .text{
			font-size: 0.8em;
		}
		.header .text .length{
			font-weight: 400;
		}
		.header .icon{
			width: 40px;
		}
		.header .icon button ion-icon{
			font-size: 2em;
		}

		.dark .index p,
		.dark .time p,
		.dark .song,
		.dark .album,
		.dark .item.icon button,
		.header .text,
		.header .icon button ion-icon{
			color: var(--dark-p);
		}
		.dark th{
			background: var(--dark-bg);
		}
	`],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: MediaListComponent, multi: true}]
})

export class MediaListComponent implements ControlValueAccessor, OnInit, OnDestroy {

	constructor(
		public settings: SettingsService,
		private fhem: FhemService,
		public time: TimeService) {

	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;
	@Input() arr_data_setList: string|string[];

	// Different player options
	// Player Device Name
	@Input() data_playerDevice: string;
	// Player Type (indicates start of 0 or 1) (Sonos = 1, MPD = 0)
	@Input() arr_data_player: string|string[];

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	// Custom Inputs
	@Input() customMode: boolean = false;
	// custom List import
	@Input() list: Array<any> = [];


	@Output() onToggle = new EventEmitter();
	@Output() onInfo = new EventEmitter();

  	public fhemDevice: any;
  	// fhem event subscribtions
    private deviceChange: Subscription;
  	
  	private currentlyPlaying:number;
  	// used for picker
  	public displayDetails: any = {show: false, index: 0};

	static getSettings() {
		return {
			name: 'MediaList',
			component: 'MediaListComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'currentdir_playlist'},
				{variable: 'data_setReading', default: 'Play'},
				{variable: 'data_playerDevice', default: ''},
				{variable: 'arr_data_setList', default: 'currentdir,playlist'},
				{variable: 'arr_data_player', default: 'Sonos,MPD'}
			],
			dimensions: {minX: 200, minY: 80}
		};
	}

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.currentlyPlaying); }
  	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value) {
		this.currentlyPlaying = value;
		this.updateChanges();
	}

	ngOnInit(){
		if (!this.customMode) {
			this.fhem.getDevice(this.data_device, this.data_reading).then((device: any) => {
				this.fhemDevice = device;
				if(device){
					this.list = JSON.parse(this.fhemDevice.readings[this.data_reading].Value);
					this.deviceChange = this.fhem.devicesSub.subscribe(next => {
				  		this.listen(next);
				  	});
				}
			});
		}
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				this.list = JSON.parse(this.fhemDevice.readings[this.data_reading].Value);
			}
		}
	}

	public toggle(index) {
		if(this.customMode){
			this.currentlyPlaying = index;
			this.onToggle.emit(index);
			this.updateChanges();
		}
		else{
			if(this.data_playerDevice !== ''){
				this.fhem.setAttr(this.data_playerDevice, 'play', (this.arr_data_player[0] === 'Sonos' ? index + 1 : index));
			}
		}
	}

	public toggleAll(){
		this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, this.arr_data_setList[0]);
	}

	public showDetails(index) {
		if(!this.customMode){
			this.displayDetails.show = !this.displayDetails.show;
			this.displayDetails.index = index;
		}else{
			this.onInfo.emit(index);
		}
	}

	ngOnDestroy(){
		if (this.deviceChange !== undefined) {
			this.deviceChange.unsubscribe();
		}
	}
}