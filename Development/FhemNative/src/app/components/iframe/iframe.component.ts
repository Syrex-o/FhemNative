import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'fhem-iframe',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="i-frame" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="40"
			minimumHeight="40"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true, 'offline': true}">
				<div class="frame">
					<iframe *ngIf="src && fhemDevice" [src]="src"></iframe>
					<iframe *ngIf="src && !fhemDevice" [src]="src"></iframe>
					<p *ngIf="src === '' || !src" class="error">
						{{'COMPONENTS.IFrame.TRANSLATOR.NO_URL' | translate}}
						{{'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate}}
					</p>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.i-frame{
			position: absolute;
		    width: 100px;
		    height: 100px;
		}
		iframe, .frame{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		.frame{
			overflow-y: scroll;
		}
		.error{
			margin: 8px;
		}
		.dark .error{
			color: var(--dark-p);
		}
	`]
})
export class IframeComponent implements OnInit {

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		public sanitizer: DomSanitizer,
		private ref: ElementRef,
		private http: HttpClient) {
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

	public src: SafeResourceUrl;

	static getSettings() {
		return {
			name: 'IFrame',
			component: 'IframeComponent',
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
				this.src = (this.data_url !== '') ? this.sanitizer.bypassSecurityTrustResourceUrl(this.data_url) : '';
			} else {
				this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.fhemDevice.readings[this.data_reading].Value);
			}
		});
	}
}
