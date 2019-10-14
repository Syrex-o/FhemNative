import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'kodi-remote',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="kodi-remote"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="200"
			minimumHeight="250"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': null, 'reading': null, 'offline': true}">
				<div class="remote-container">
					<div class="header-container">
						<div class="row">
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-off"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
							<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
						</div>
					</div>
					<div class="button-container">
						<div class="top-buttons">
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-off"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-off"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
							</div>
						</div>
						<div class="control-buttons">
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-off"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-high"></ion-icon></button>
							</div>
							<div class="row">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="volume-low"></ion-icon></button>
							</div>
						</div>
						<div class="footer-container">
							<div class="container left">

							</div>
							<div class="container middle">
							
							</div>
							<div class="container right">
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="square"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="square"></ion-icon></button>
								<button matRipple [matRippleColor]="'#d4d4d480'" class="menu-btn"><ion-icon name="square"></ion-icon></button>
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
			width: 200px;
			height: 250px;
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
		.header-container{
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
			border-top-left-radius: 5px;
			border-top-right-radius: 5px;
			position: absolute;
			height: 100%;
			top: calc(100% - 50px);
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
		.control-buttons .menu-btn{
			width: 70px;
			height: 70px;
		}
		.header-container .menu-btn,
		.footer-container .menu-btn{
			margin-top: 0px;
			margin-bottom: 0px;
			margin-left: 4px;
			margin-right: 4px;
			border-radius: 50%;
		}
		.footer-container .menu-btn{
			font-size: 25px;
			width: 30px;
			height: 30px;
			margin-left: 0px;
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
		.container.middle{
			left: 50px;
			width: 50%;
		}
		.container.right{
			left: calc(50% + 50px);
			width: calc(50% - 50px);
		}

		button:focus{
			outline: none;
		}

		.dark .remote-container{
			background: var(--dark-bg);
		}
		.dark .footer-container,
		.dark .header-container{
			background: var(--dark-bg-dark);
		}
		.dark .menu-btn ion-icon{
			color: var(--dark-p);
		}
	`]
})
export class KodiComponent implements OnInit, OnDestroy {
	constructor(
		private fhem: FhemService,
		public settings: SettingsService) {
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
			dimensions: {minX: 200, minY: 250}
		};
	}

	// connection state
	public connected = false;
	// websocket
	private socket: any;

	ngOnInit(){
		this.socket = new WebSocket('ws://' + this.data_ip + ':' + this.data_port + '/jsonrpc');
		this.socket.onopen = (e) => {
			console.log(e);
			this.connected = true;
		}
		this.socket.onerror = (e) =>{
			console.log(e);
			this.connected = false;
		}
	}

	private events(e){

	}

	private sendMessage(method, params){

	}

	ngOnDestroy(){
		this.socket.close();
	}
}