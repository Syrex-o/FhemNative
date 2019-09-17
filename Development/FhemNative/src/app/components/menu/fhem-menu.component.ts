import { Component, OnInit, OnDestroy } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { StorageService } from '../../services/storage.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'fhem-menu',
	template: `
		<div class="fhem-menu" [ngClass]="settings.app.theme">
			<popup
				*ngIf="settings.modes.fhemMenuMode === 'ip-config'"
				[customMode]="true"
				[(ngModel)]="openPopup"
				[headLine]="currentHeadline"
				[closeButton]="false"
				(onClose)="resetMenuMode()">
				<div class="menu-container">
					<div class="config-container">
						<p class="label">{{ 'GENERAL.FHEM_MENU.CONNECTION.IP.TITLE' | translate }}</p>
						<span class="description">{{ 'GENERAL.FHEM_MENU.CONNECTION.IP.INFO' | translate }}</span>
						<input [(ngModel)]="settings.IPsettings.IP" placeholder="{{settings.IPsettings.IP}}">
		      			<span class="bar"></span>
					</div>
					<div class="config-container">
						<p class="label">{{ 'GENERAL.FHEM_MENU.CONNECTION.PORT.TITLE' | translate }}</p>
						<span class="description">{{ 'GENERAL.FHEM_MENU.CONNECTION.PORT.INFO' | translate }}</span>
						<input [(ngModel)]="settings.IPsettings.PORT" placeholder="{{settings.IPsettings.PORT}}">
		      			<span class="bar"></span>
					</div>
					<div class="config-container">
						<p class="label">{{ 'GENERAL.FHEM_MENU.CONNECTION.TYPE.TITLE' | translate }}</p>
						<span class="description">{{ 'GENERAL.FHEM_MENU.CONNECTION.TYPE.INFO' | translate }}</span>
						<ng-select [items]="['Websocket', 'Fhemweb']"
							[searchable]="false"
					        [placeholder]="settings.IPsettings.type"
					        [(ngModel)]="settings.IPsettings.type">
					        <ng-template ng-option-tmp let-item="item" let-index="index">
				    			<span class="label">{{item}}</span>
					        </ng-template>
					    </ng-select>
					</div>
					<div class="config-container space">
						<switch
							[customMode]="true"
							[(ngModel)]="settings.IPsettings.WSS"
							[label]="'GENERAL.FHEM_MENU.CONNECTION.SECURE.TITLE' | translate"
							[subTitle]="'GENERAL.FHEM_MENU.CONNECTION.SECURE.INFO' | translate">
						</switch>
					</div>
				</div>
				<div class="bottom-buttons">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn confirm single" (click)="confirmIPSettings()">{{ 'GENERAL.BUTTONS.CONFIRM' | translate }}</button>
				</div>
			</popup>
		</div>
	`,
	styles: [`
		.dark input{
			background: var(--dark-bg);
		}
		.dark h2,
		.dark .description{
			color: var(--dark-p);
		}
		ng-select{
			margin-top: 5px;
		}
		input{
			font-size:18px;
			padding:10px 10px 10px 5px;
			display:block;
			width:100%;
			border:none;
			border-bottom:1px solid #757575;
			color: #757575;
		}
		input:focus{ outline:none; }
		.bar{ position:relative; display:block; width:100%; }
		.bar:before, .bar:after{
		  content:'';
		  height:2px;
		  width:0;
		  bottom:1px;
		  position:absolute;
		  background:var(--btn-blue);
		  transition:0.2s ease all;
		}
		.bar:before {
		  left:50%;
		}
		.bar:after {
		  right:50%;
		}
		input:focus ~ .bar:before, input:focus ~ .bar:after {
		  width:50%;
		}
		.label{
			margin-bottom: 2px;
		}
		.description{
			font-size: .8em;
			margin-bottom: 5px;
		}
		.menu-container{
			padding: 10px;
			max-height: calc(100% - 3% - 40px);
		}
		.config-container.space{
			margin-top: 20px;
			padding-bottom: 20px;
			border-bottom: 1px solid #757575;
		}
		.bottom-buttons{
			position: relative;
			bottom: -20px;
			width: 100%;
			height: 35px;
		}
		.bottom-buttons .btn{
			position: absolute;
			height: 100%;
			color: #fff;
			font-size: 1.1em;
		}
		.bottom-buttons .btn:focus{
			outline: 0px;
		}
		.btn.single{
			width: 100% !important;
		}
		.btn.confirm{
			background: var(--btn-green);
		}
	`]
})
export class FhemMenuComponent implements OnInit, OnDestroy {
	public openPopup = false;
	public currentHeadline: string;

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private translate: TranslateService,
		private storage: StorageService) {
	}

	ngOnInit() {
		if (this.settings.modes.fhemMenuMode === 'ip-config') {
			this.currentHeadline = this.translate.instant('GENERAL.FHEM_MENU.CONNECTION.TITLE');
		}
		setTimeout(() => {this.openPopup = true; }, 200);
	}

	public resetMenuMode() {
		setTimeout(() => {
			this.settings.modes.fhemMenuMode = '';
		}, 300);
	}

	public confirmIPSettings() {
		const res = {IP: this.settings.IPsettings.IP, PORT: this.settings.IPsettings.PORT, WSS: this.settings.IPsettings.WSS, type: this.settings.IPsettings.type};
		this.storage.changeSetting({name: 'IPsettings', change: JSON.stringify(res)});

		if (this.fhem.connected) {
			this.fhem.disconnect();
		}
		this.fhem.connectFhem();
		this.openPopup = false;
		this.fhem.noReconnect = false;
		this.resetMenuMode();
	}

	ngOnDestroy() {
		this.resetMenuMode();
	}
}
