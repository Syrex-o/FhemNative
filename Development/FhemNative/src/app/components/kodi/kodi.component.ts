import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { TimeService } from '../../services/time.service';
import { Subject } from 'rxjs';

@Component({
	selector: 'kodi-remote',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="kodi-remote"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="290"
			minimumHeight="490"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': null, 'reading': null, 'offline': true}">
				<div class="remote-container">
					<div class="header-container">
						<div class="row">
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="home"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="videocam"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="tv"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="musical-notes"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="photos"></ion-icon></button>
						</div>
					</div>
					<div class="button-container">
						<div class="top-buttons">
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low" (click)="setKodi.changeVolume(false)"></ion-icon></button>
								<button [class.active]="kodi.muted" matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn" (click)="setKodi.mute()"><ion-icon name="volume-off"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high" (click)="setKodi.changeVolume(true)"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="expand"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="information-circle"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="text"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="list"></ion-icon></button>
							</div>
						</div>
						<div class="control-buttons">
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="arrow-dropup"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="arrow-dropleft"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="radio-button-on"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="arrow-dropright"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn left"><ion-icon name="arrow-back"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn center"><ion-icon name="arrow-dropdown"></ion-icon></button>
							</div>
						</div>
						<div class="footer-container" 
							[class.show]="kodi.current?.item?.paused !== 'stop' && kodi.current?.item"
							[class.details]="showDetails">
							<span class="duration-indicator" [ngStyle]="{'width': (kodi.current?.item?.percentage ? kodi.current.item.percentage : 0) + '%'}"></span>
							<div class="container left" (click)="showDetails = !showDetails">
								<img *ngIf="kodi.current?.item?.thumbnail" [src]="kodi.current.item.thumbnail">
							</div>
							<div class="container middle" (click)="showDetails = !showDetails">
								<p *ngIf="kodi.current?.item?.label">{{kodi.current.item.label}}</p>
							</div>
							<div class="container right">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn" (click)="setKodi.stop()"><ion-icon name="square"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn" (click)="setKodi.playPause()">
									<ion-icon *ngIf="!kodi.current?.item?.paused" name="pause"></ion-icon>
									<ion-icon *ngIf="kodi.current?.item?.paused" name="play"></ion-icon>
								</button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn" (click)="setKodi.changeItem('next')"><ion-icon name="skip-forward"></ion-icon></button>
							</div>
							<div class="details">
								<div class="details-header">
									<div class="container left" (click)="showDetails = !showDetails">
										<button class="menu-btn neutral">
											<ion-icon name="arrow-dropdown"></ion-icon>
										</button>
									</div>
									<div class="container middle" (click)="showDetails = !showDetails">
										<p *ngIf="kodi.current?.item?.label">{{kodi.current.item.label}}</p>
									</div>
									<div class="container right">
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn no-bg" (click)="setKodi.changeItem('next')"><ion-icon name="skip-forward"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn no-bg" (click)="setKodi.changeItem('next')"><ion-icon name="skip-forward"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn no-bg" (click)="setKodi.changeItem('next')"><ion-icon name="skip-forward"></ion-icon></button>
									</div>
								</div>
								<div class="details-body">
									<div class="details-body-background" matRipple [matRippleColor]="'#d4d4d480'">
										<img *ngIf="kodi.current?.item?.thumbnail" [src]="kodi.current.item.thumbnail">
									</div>
									<div class="row bottom no-transform">
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg"><ion-icon name="repeat"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg"><ion-icon name="headset"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg" (click)="setKodi.stop()"><ion-icon name="square"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg"><ion-icon name="resize"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg"><ion-icon name="shuffle"></ion-icon></button>
									</div>
								</div>
								<div class="details-footer">
									<div class="row top set-height">
										<p class="left" *ngIf="kodi.current?.item?.formattedTime">{{kodi.current.item.formattedTime}}</p>
										<p class="right" *ngIf="kodi.current?.item?.totaltime">{{kodi.current.item.totaltime}}</p>
									</div>
									<slider *ngIf="kodi.current?.item?.totaltime" 
										[customMode]="true" 
										[(ngModel)]="kodi.current.item.time"
										[data_min]="'00:00:00'"
										[data_max]="kodi.current.item.totaltime"
										[width]="'100%'"
										[data_sliderHeight]="'2'"
										[data_thumbWidth]="'15'"
										(onSlideEnd)="setKodi.setTime($event); blockUpdate = false;"
										(onSlide)="blockUpdate = true;"
										[top]="'-13px'">
									</slider>
									<div class="row bottom set-height">
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg color" (click)="setKodi.changeItem('previous')"><ion-icon name="skip-backward"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg color" (click)="setKodi.changeSpeed(false)"><ion-icon name="rewind"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn no-bg color" (click)="setKodi.playPause()">
											<ion-icon *ngIf="!kodi.current?.item?.paused" name="pause"></ion-icon>
											<ion-icon *ngIf="kodi.current?.item?.paused" name="play"></ion-icon>
										</button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg color" (click)="setKodi.changeSpeed(true)"><ion-icon name="fastforward"></ion-icon></button>
										<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn margin no-bg color" (click)="setKodi.changeItem('next')"><ion-icon name="skip-forward"></ion-icon></button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.kodi-remote{
			position: absolute;
			width: 290px;
			height: 490px;
		}
		.remote-container{
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			background: white;
			overflow: hidden;
		}
		.footer-container,
		.header-container,
		.details{
			width: 100%;
			background: #eeeeee;
		}
		.header-container{
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			position: relative;
			height: 50px;
		}
		.footer-container{
			position: absolute;
			height: calc(100% + 50px * 2);
			top: 100%;
			transition: all .2s ease;
			cursor: pointer;
		}
		.footer-container.show{
			top: calc(100% - 50px);
		}
		.footer-container.show.details{
			top: -100px;
		}
		.button-container{
			position: relative;
			width: 100%;
			height: calc(100% - 50px);
		}
		.top-buttons{
			position: relative;
			width: 100%;
		}
		.row{
			text-align: center;
		}

		.menu-btn{
			width: 50px;
			height: 50px;
			position: relative;
			border-top-left-radius: 5px;
			border-top-right-radius: 5px;
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
			background: rgba(10, 15, 18, 0.3);
			font-size: 30px;
			margin: 8px;
		}
		.menu-btn.left,
		.menu-btn.center{
			transform: translateX(-60%);
		}
		.menu-btn.left{
			background: transparent;
		}
		.control-buttons .menu-btn{
			width: 70px;
			height: 70px;
		}
		.header-container .menu-btn,
		.footer-container .menu-btn{
			margin-top: 0px;
			margin-bottom: 0px;
			margin-left: 4px;
			margin-right: 0px;
			border-radius: 50%;
		}
		.footer-container .menu-btn{
			font-size: 20px;
			width: 30px;
			height: 30px;
			margin-left: 0;
    		margin-right: 0;
    		padding: 0;
		    top: 50%;
		    transform: translateY(-50%);
		}
		.menu-btn.neutral{
			border-radius: 0px !important;
			width: inherit !important;
			height: inherit !important;
		}
		.menu-btn.no-bg{
			background: transparent !important;
		}
		.footer-container .container{
			height: 50px;
			top: 0;
			position: absolute;
		}
		.container.left{
			width: 50px;
			left: 0;
		}
		.container.left img{
			width: 100%;
			height: auto;
			top: 50%;
			transform: translateY(-50%);
			position: absolute;
		}
		.container.middle{
			left: 50px;
			width: 50%;
		}
		.container.middle p{
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			margin-left: 10px;
			margin-right: 10px;
			font-size: 14px;
			line-height: 25px;
		}
		.container.right{
			right: 0;
			width: 100px;
			text-align: center;
		}
		.duration-indicator{
			height: 2px;
			position: absolute;
			top: 0;
			background: var(--btn-blue);
		}

		button:focus{
			outline: none;
		}
		.footer-container .details{
			position: absolute;
			width: 100%;
			height: calc(100% - 50px);
			top: 50px;
		}
		.details .details-header,
		.details .details-footer{
			position: relative;
			height: 50px;
			width: 100%;
			background: #fff;
		}
		.details .details-footer{
			height: 80px;
		}
		.details .details-body{
			position: relative;
			height: calc(100% - 50px - 80px);
			width: 100%;
		}
		.details .details-body-background{
			width: 100%;
			height: 100%;
			opacity: 0.5;
		}
		.details .details-body img{
			max-width: fit-content;
			height: 100%;
			transform: translateX(-50%);
		    left: 50%;
		    position: relative;
		}
		.row.bottom{
			width: 100%;
			position: absolute;
			bottom: 10px;
		}
		.row.top{
			position: absolute;
			top: 0;
			width: 100%;
		}
		.row p.left,
		.row p.right{
			line-height: 10px;
			font-size: 12px;
		}
		.row p.left{
			float: left;
			margin-left: 10px;
		}
		.row p.right{
			float: right;
			margin-right: 10px;
		}
		.row.no-transform .menu-btn{
			transform: translateY(0px);
		}
		.row.set-height{
			height: 40px;
		}
		.menu-btn.margin{
			margin-left: 4% !important;
			margin-right: 4% !important;
		}
		.menu-btn.color ion-icon{
			color: var(--btn-blue) !important;
		}

		.menu-btn.active ion-icon{
			color: var(--btn-blue) !important;
		}

		.dark .remote-container,
		.dark .details .details-header,
		.dark .details .details-footer{
			background: var(--dark-bg);
		}
		.dark .footer-container,
		.dark .header-container,
		.dark .details{
			background: var(--dark-bg-dark);
		}
		.dark .container.middle p,
		.dark .menu-btn ion-icon,
		.dark .row p.left,
		.dark .row p.right{
			color: var(--dark-p);
		}
	`]
})
export class KodiComponent implements OnInit, OnDestroy {
	constructor(
		public settings: SettingsService,
		private time: TimeService,
		private ref: ElementRef) {
	}
	// Component ID
	@Input() ID: number;

	@Input() data_ip: string;
	@Input() data_port: string;
	@Input() data_username: string;
	@Input() data_password: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	static getSettings() {
		return {
			name: 'Kodi',
			component: 'KodiComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_ip', default: ''},
				{variable: 'data_port', default: '8080'},
				{variable: 'data_username', default: ''},
				{variable: 'data_password', default: ''}
			],
			dimensions: {minX: 290, minY: 490}
		};
	}

	// connection state
	private connected = false;
	// websocket
	private socket: any;
	// events catch
	public kodi: any = {};
	// event listener
	private onMessage = new Subject<any>();
	// timer
	private timer: any;
	public blockUpdate: boolean = true;
	// display details
	public showDetails: boolean = false;

	ngOnInit(){
		if(this.data_ip !== ''){
			this.socket = new WebSocket('ws://' + 
				(this.data_username !== '' ? this.data_username + ':' + this.data_password + '@' : '') +
				this.data_ip + ':' + this.data_port + '/jsonrpc');

			this.socket.onopen = (e) => {
				this.connected = true;
				this.socket.onmessage = (ev) =>{
					this.events(ev);
				}
				// send initial message and get player
				this.getInfo.getPlayer();
			}
			this.socket.onerror = (e) =>{
				console.log(e);
				this.connected = false;
			}
			this.socket.onclose = (e) =>{
				console.log(e);
				this.connected = false;
			}
		}
	}

	private events(e){
		const response = JSON.parse(e.data);

		console.log(response);

		if('result' in response){
			this.onMessage.next({id: response.id, data: response.result});
		}
		if(response.method){
			// detect internal command for callback
			if(response.id){
				this.onMessage.next({id: response.id, data: response.result});
			}
			// analyse commands
			this.getInfo.getPlayer();

			if(response.method.match(/Player\.OnResume|Player\.OnPause/)){
				this.getInfo.evalData('playerid', response.params.data.player.playerid, 'current');
				this.getInfo.evalData('speed', response.params.data.player.speed, 'current.item');
				this.getInfo.evalData('paused', (response.params.data.player.speed === 0 ? true : false), 'current.item');
				this.getInfo.evalData('year', response.params.data.item.year, 'current.item');
			}
			if(response.method.match(/Player\.OnStop/)){
				this.getInfo.evalData('speed', 0, 'current.item');
				this.getInfo.evalData('paused', 'stop', 'current.item');
			}
			if(response.method.match(/Player\.OnResume|Player\.OnPause|Player\.OnStop|Player\.OnPlay/)){
				this.getInfo.getTimer();
			}
			if(response.method.match(/Player\.OnSpeedChanged/)){
				this.getInfo.evalData('speed', response.params.data.player.speed, 'current.item');
			}
			if(response.method.match(/Player\.OnVolumeChanged/)){
				this.getInfo.evalData('muted', response.params.data.muted, false);
				this.getInfo.evalData('volume', response.params.data.volume, false);
			}
		}
	}

	private sendMessage(method, params, callback){
		const id = Math.floor((Math.random() * 100) + 1);
		const data = {
			id: id,
			jsonrpc: '2.0',
		    method: method,
		    params: params
		};
		// handle callback
		if(callback){
			let gotReply: boolean = false;
			const listen = this.onMessage.subscribe(e=>{
				if(e.id === id){
					gotReply = true;
					callback(e);
					listen.unsubscribe();
				}
			});
			setTimeout(()=>{
				if(!gotReply){
					listen.unsubscribe();
					callback({data:[]});
				}
			}, 500);
		}
		// send command
		this.socket.send(JSON.stringify(data));
	}

	private getInfo = {
		// eval the message and push to desired storage
		evalData: (key:string, value:any, storage:any)=>{
			if(storage){
				if(storage.match(/\./)){
					const split = storage.split('.');
					if(!this.kodi[split[0]]){
						this.kodi[split[0]] = {};
					}
					this.kodi[split[0]][split[1]][key] = value;
				}else{
					if(!this.kodi[storage]){
						this.kodi[storage] = {};
					}
					this.kodi[storage][key] = value;
				}
			}else{
				this.kodi[key] = value;
			}
		},
		// get player info
		getPlayer: ()=>{
			this.sendMessage('Player.GetActivePlayers',{}, e=>{
				if (e.data === null || e.data === undefined) {
					return;
				}
				let result = null;
				e.data.forEach((data)=>{
					if (data.type !== 'picture') {
						result = data;
					}
				});
				// eval result
				if(result){
					for( const [key, value] of Object.entries(result)){
						this.getInfo.evalData(key, value, 'current');
					}
					if('playerid' in this.kodi['current']){
						this.getInfo.getItem(this.kodi['current'].playerid);
					}
				}
				this.getInfo.getVolume();
			});
		},
		// get item playing information
		getItem: (playerid)=>{
			let askFor = ['title', 'artist', 'album', 'thumbnail', 'year'];
			if(playerid === 1){
				// video playing
				askFor = askFor.concat(['streamdetails', 'season', 'episode', 'showtitle']);
			}
			this.sendMessage('Player.GetItem', {
				"properties": askFor,
				"playerid": playerid
			}, e=>{
				if (e.data === null || e.data === undefined || e.data.item === undefined) {
					return;
				}
				let item = {
					label: e.data.item.label,
					time: null,
					formattedTime: null,
		            totaltime: null,
		            percentage: null,
		            paused: false,
		            speed: 0,
		            thumbnail: null,
		            year: 1900
				};
				if (e.data.item.type === 'song') {
					item.label = e.data.item.title + ' - ' + e.data.item.artist[0];
					item['albumid'] = e.data.item.albumid;
				}
				if(e.data.item.thumbnail){
					item.thumbnail = this.getThumbnail(e.data.item.thumbnail);
				}
				this.getInfo.evalData('item', item, 'current');
				// get details
				if(e.data.item.streamdetails){
					this.getInfo.evalData('streamdetails', e.data.item.streamdetails, 'current.item');
				}
				if('season' in e.data.item){
					this.getInfo.evalData('season', e.data.item.season, 'current.item');
				}
				if('episode' in e.data.item){
					this.getInfo.evalData('episode', e.data.item.season, 'current.item');
				}
				console.log(this.kodi);

				this.getInfo.getItemProps(playerid);
			});
		},
		// get time information
		getItemProps: (playerid)=>{
			this.sendMessage('Player.getProperties', {
				"properties": ['time', 'totaltime', 'percentage', 'speed'],
				"playerid": playerid
			}, e=>{
				if (e.data === undefined || e.data.length === 0) {
					return;
				}
				this.getInfo.evalData('speed', e.data.speed, 'current.item');
				this.getInfo.evalData('paused', (e.data.speed === 0 ? true : false), 'current.item');
				this.getInfo.evalData('percentage', Math.ceil(e.data.percentage), 'current.item');
				if('totaltime' in e.data){
					this.getInfo.evalData('totaltime', this.transformTime(e.data.totaltime.hours, e.data.totaltime.minutes, e.data.totaltime.seconds), 'current.item');
				}
				this.getInfo.evalData('time', this.transformTime(e.data.time.hours, e.data.time.minutes, e.data.time.seconds), 'current.item');
				this.getInfo.evalData('formattedTime', this.transformTime(e.data.time.hours, e.data.time.minutes, e.data.time.seconds), 'current.item');

				this.getInfo.getTimer();
			});
		},
		getVolume: ()=>{
			this.sendMessage('Application.GetProperties',{"properties": [
				"volume", "muted"
			]}, e=>{
				if(e.data === undefined || e.data.length === 0){
					return;
				}
				this.getInfo.evalData('muted', e.data.muted, false);
				this.getInfo.evalData('volume', e.data.volume, false);
			});
		},
		getTimer: ()=>{
			if(this.timer){
				clearInterval(this.timer);
			}
			if(this.kodi.current && !this.kodi.current.item.paused && this.kodi.current.item.paused !== 'stop'){
				// play
				this.timer = setInterval(()=>{

					const currentTime = this.timeTo(this.kodi.current.item.formattedTime);

					const addSec = this.kodi.current.item.speed === 0 ? 1 : this.kodi.current.item.speed;

					this.kodi.current.item.formattedTime = this.transformTime(currentTime.parts.h, currentTime.parts.m, currentTime.parts.s + addSec);
					if(!this.blockUpdate){
						this.kodi.current.item.time = currentTime.sec + addSec;
					}

					const totalSecs = this.timeTo(this.kodi.current.item.totaltime).sec;

					this.kodi.current.item.percentage = Math.ceil(((currentTime.sec + addSec) / totalSecs) * 100);
				}, 1000);
			}
		}
	}

	// send kodi commands
	public setKodi = {
		playPause: ()=>{
			this.sendMessage('Player.PlayPause', {"playerid": this.kodi['current'].playerid}, false);
		},
		stop: ()=>{
			this.sendMessage('Player.Stop', {"playerid": this.kodi['current'].playerid}, false);
		},
		// 'previous' or 'next'
		changeItem: (direction)=>{
			this.sendMessage('Player.GoTo', {"playerid": this.kodi['current'].playerid, "to": direction}, false);
		},
		setTime: (e)=>{
			this.sendMessage('Player.Seek', {
				"playerid": this.kodi['current'].playerid, 
				"value": { "seconds": e - this.timeTo(this.kodi.current.item.formattedTime).sec }
			}, false);
		},
		mute: ()=>{
			this.sendMessage('Application.SetMute', {
				"mute": "toggle" 
			}, e=>{
				this.kodi.muted = e.data.length !== 0 ? !e.data : this.kodi.muted;
			});
		},
		shuffle: ()=>{
			this.sendMessage('Application.SetShuffle', {
				"shuffle": "toggle" 
			}, e=>{
				// this.kodi.muted = e.data.length !== 0 ? !e.data : this.kodi.muted;
			});
		},
		changeSpeed: (forward)=>{
			const speeds = [-32, -16, -8, -4, -2, -1, 1, 2, 4, 8, 16, 32];
			let speed = this.kodi.current.item.speed;
			if(speed === 0){
				speed = 1;
				this.kodi.current.item.speed = speed;
				this.kodi.current.item.paused = true;
			}
			const i = speeds.indexOf(speed);
			if (i > 0 && !forward) {
				this.sendMessage('Player.SetSpeed', {
					"playerid": this.kodi['current'].playerid,
					"speed": speeds[i - 1]
				}, false);
			}
			else if (i + 1 < speeds.length && forward) {
				this.sendMessage('Player.SetSpeed', {
					"playerid": this.kodi['current'].playerid,
					"speed": speeds[i + 1]
				}, false);
			}
		},
		changeVolume: (up)=>{
			this.sendMessage('Application.GetProperties', {"properties": ["volume"]}, e=>{
				if('volume' in e.data){
					if (e.data.volume < 100 && up) {
						this.sendMessage('Application.SetVolume', {
							"volume": e.data.volume + 5
						}, false);
					}
					if (e.data.volume > 0 && !up) {
						this.sendMessage('Application.SetVolume', {
							"volume": e.data.volume - 5
						}, false);
					}
				}
			});
		}
	}

	private timeTo(str){
		const h = parseInt(str.substr(0,2));
		const m = parseInt(str.substr(3,2));
		const s = parseInt(str.substr(6,2));

		return {
			sec: (h * 60 * 60) + (m * 60) + s,
			parts: {
				h: h, m: m, s: s
			}
		}
	}

	private transformTime(h,m,s){
		const secs = (h * 60 * 60) + (m * 60) + s;
		return h === 0 ? '00:'+ this.time.secToTime(secs) : this.time.secToTime(secs);
	}

	// resolves thumbnail
	private getThumbnail(thumbUrl){
		if (!thumbUrl) {
            return thumbUrl;
        }
        thumbUrl = decodeURIComponent(thumbUrl.replace('image://', ''));
        if (thumbUrl.charAt(thumbUrl.length - 1) === '/') {
            thumbUrl = thumbUrl.substring(0, thumbUrl.length - 1);
        }
        if (thumbUrl.charAt(0) === '/') {
            thumbUrl = thumbUrl.substring(1);
        }
        if (thumbUrl.indexOf('http://') === 0 || thumbUrl.indexOf('https://') === 0) {
            return thumbUrl;
        }
        return 'http://' + this.data_ip + ':' + this.data_port + '/image/' + encodeURIComponent(thumbUrl);
	}

	ngOnDestroy(){
		if(this.socket){
			this.socket.close();
		}
	}
}