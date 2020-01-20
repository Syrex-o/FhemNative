import { Component, Input, OnInit, HostListener } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

@Component({
	selector: 'fhem-select',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="select"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="100"
			minimumHeight="20"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true}">
				<div
					class="select-container">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="select-btn" (click)="showDropdown = !showDropdown;">
						<p *ngIf="selected.name" class="select-current">{{selected.name}}</p>
	          			<p *ngIf="!selected.name" class="select-current">{{data_placehoder}}</p>
	          			<div class="select-arrow-container">
			            	<div class="select-arrow" [ngClass]="showDropdown ? 'show' : 'hide'"></div>
			          	</div>
					</button>
					<div class="select-dropdown" [ngClass]="showDropdown ? 'show' : 'hide'">
						<div class="items" *ngIf="alias.length === 0">
							<p matRipple [matRippleColor]="'#d4d4d480'"
			          			class="select-item"
			          			*ngFor="let item of items; let i = index"
			          			(click)="setOption(item, i)"
			          			[ngClass]="selected.id == i ? 'selected' : 'not-selected'">{{item}}
			          		</p>
						</div>
			          	<div class="items" *ngIf="alias.length > 0">
							<p matRipple [matRippleColor]="'#d4d4d480'"
			          			class="select-item"
			          			*ngFor="let item of alias; let i = index"
			          			(click)="setOption(item, i)"
			          			[ngClass]="selected.id == i ? 'selected' : 'not-selected'">{{item}}
			          		</p>
						</div>
			        </div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.dark .select-container,
		.dark .select-arrow-container,
		.dark .select-dropdown{
			background: var(--dark-bg);
		}
		.dark .select-arrow-container{
			box-shadow: -10px 0px 10px 1px var(--dark-bg);
		}
		.dark p{
			color: var(--dark-p);
		}
		.dark .select-arrow{
			border-top: 5px solid var(--dark-p);
		}
		.select{
			position: absolute;
		    width: 80px;
		    height: 30px;
		}
		.select-container{
      		position: absolute;
      		width: 100%;
      		height: 100%;
      		border: 1px solid rgb(221, 221, 221);
      		border-radius: 5px;
    		left: 0px;
      		top: 0px;
      		background: #fff;
    	}
    	button:focus{
	      outline: 0px;
	    }
	    .select-btn{
	      position: absolute;
	      top: 0;
	      left: 0;
	      height: inherit;
	      width: inherit;
	      background: transparent;
	      overflow: hidden;
	    }
	    .select-dropdown{
	      top: 0;
	      position: absolute;
	      left: 50%;
	      width: auto;
	      min-width: 100%;
	      opacity: 0;
	      background: #fff;
	      transform: scaleY(0) translate3d(-50%,0,0);
	      transition: all .3s ease;
	      border: 1px solid rgb(221, 221, 221);
	      border-radius: 5px;
	      box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
	      transform-origin: top left;
	      max-height: 250px;
	      overflow-x: hidden;
	      overflow-y: scroll;
	    }
	    .select-dropdown.show{
	      opacity: 1;
	      transform: scaleY(1) translate3d(-50%,0,0);
	    }
	    .select-item{
	      white-space: nowrap;
	      height: 48px;
	      padding-left: 8px;
	      line-height: 40px;
	      position: relative;
	      margin: 0;
	      border-bottom: 1px solid rgb(221, 221, 221);
	    }
	    .select-arrow-container{
	      position: absolute;
	      right: 0;
	      top: 0;
	      width: 20px;
	      height: 100%;
	      border-top-right-radius: 5px;
	      border-bottom-right-radius: 5px;
	      background: #fff;
	      box-shadow: -10px 0px 10px 1px #fff;
	    }
	    .select-arrow{
	      position: absolute;
	      width: 0;
	      height: 0;
	      border-left: 5px solid transparent;
	      border-right: 5px solid transparent;
	      border-top: 5px solid;
	      margin: 0 4px;
	      left: 30%;
	      top: 50%;
	      transform: translate3d(-50%, -50%,0);
	    }
	    .select-current{
	      position: absolute;
	      margin: 0;
	      top: 50%;
	      transform: translate3d(0,-50%,0);
	      font-size: 1.1em;
	      white-space: nowrap;
	    }
	`]
})
export class SelectComponent implements OnInit {


	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private native: NativeFunctionsService) {
	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_currentState: string;
	@Input() data_setReading: string;

	@Input() data_seperator: string;
	@Input() data_items: string;
    @Input() data_alias: string;

    @Input() data_placehoder: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;

    // Select information
    public selected: any = {id: '', name: ''};
    public showDropdown = false;
    public items: Array<any> = [];
    public alias: Array<any> = [];

	static getSettings() {
		return {
			name: 'Select',
			component: 'SelectComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_currentState', default: ''},
				{variable: 'data_seperator', default: ','},
				{variable: 'data_items', default: ''},
				{variable: 'data_alias', default: ''},
				{variable: 'data_placehoder', default: ''}
			],
			dimensions: {minX: 80, minY: 30}
		};
	}

    @HostListener('document:click', ['$event.target'])onClick(target) {
    	if (target.className.indexOf('select') === -1 && this.showDropdown) {
      		this.showDropdown = false;
    	}
  	}
	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (device) {
				this.initSelect();
			}
		});
	}

	private initSelect() {
		if (this.data_currentState !== '') {
			this.data_placehoder = this.fhemDevice.readings[this.data_currentState] ? this.fhemDevice.readings[this.data_currentState].Value : '';
		} else {
			this.data_placehoder = (this.data_placehoder === '') ? this.data_device : this.data_placehoder;
		}
		if (this.data_items !== '') {
			this.items = this.data_items.replace(/\s/g, '').split(this.data_seperator);
			if (this.data_alias !== '') {
				this.alias = this.data_alias.replace(/\s/g, '').split(this.data_seperator);
			}
		} else {
			this.items = this.fhemDevice.readings[this.data_reading].Value.replace(/\s/g, '').split(this.data_seperator);
			if (this.data_alias !== '') {
				this.alias = this.data_alias.replace(/\s/g, '').split(this.data_seperator);
			}
		}
	}

	public setOption(elem, index) {
    	this.selected.id = index;
    	this.selected.name = elem;
    	this.showDropdown = !this.showDropdown;
    	this.sendValue(this.items[index]);
  	}

  	private sendValue(val) {
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, val);
		} else {
			this.fhem.set(this.fhemDevice.device, val);
		}
		this.native.nativeClickTrigger();
	}
}
