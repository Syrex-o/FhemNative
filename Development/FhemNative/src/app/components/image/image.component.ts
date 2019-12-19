import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { HelperService } from '../../services/helper.service';
import { CreateComponentService } from '../../services/create-component.service';

import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@Component({
	selector: 'fhem-image',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="image" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="40"
			minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: data_reading, available: true, offline: true}">
				<div
					class="image-container">
					<img *ngIf="src && fhemDevice" [src]="src">
					<img *ngIf="src && src !== '' && !fhemDevice" [src]="src">
					<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="fromPhone" (click)="selectImage()">Bild vom Gerät auswählen</button>
					<p class="error" *ngIf="!src && !fromPhone">
						{{'COMPONENTS.Image.TRANSLATOR.NO_URL' | translate}}
						{{'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate}}
					</p>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.image{
			position: absolute;
		    width: 100px;
		    height: 100px;
		}
		.image-container{
			position: absolute;
			width: 100%;
			height: 100%;
			overflow-y: auto;
		}
		img{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		button{
			position: absolute;
			width: 100%;
			top: 50%;
			min-height: 40px;
			font-size: 1em;
			transform: translateY(-50%);
			background: var(--btn-blue);
			color: #fff;
		}
		button:focus{
			outline: 0px;
		}
		.error{
			margin: 8px;
		}
		.dark .error{
			color: var(--dark-p);
		}
	`]
})
export class ImageComponent implements OnInit {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private imagePicker: ImagePicker,
		private webview: WebView,
		private structure: StructureService,
		private platform: Platform,
		private createComponent: CreateComponentService,
		private helper: HelperService) {
	}
	// Component ID
	@Input() ID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_url: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;
	public src: string;
	// enable phone selection
	public fromPhone: boolean;

	static getSettings() {
		return {
			name: 'Image',
			component: 'ImageComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_url', default: ''}
			],
			dimensions: {minX: 100, minY: 100}
		};
	}

	ngOnInit() {
		this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
			this.fhemDevice = device;
			if (!device) {
				if (!this.data_url) {
					this.fromPhone = this.platform.is('mobile');
				} else {
					this.src = this.data_url;
				}
			} else {
				this.src = this.fhemDevice.readings[this.data_reading] ? this.fhemDevice.readings[this.data_reading].Value : false;
			}
		});
	}

	public selectImage() {
		if (this.platform.is('mobile')) {
			this.imagePicker.getPictures({ quality: 100, maximumImagesCount: 1}).then(results => {
				this.structure.getComponent(this.ID).attributes.data.find((x)=>{
					if (x.attr === 'data_url') {
						x.value = this.webview.convertFileSrc(results[0]);
					}
				});
				this.structure.saveRooms();
			});
		}
	}
}
