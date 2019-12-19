import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { HelperService } from '../../services/helper.service';
import { TasksService } from '../../services/tasks.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'fhem-container',
	template: `
		
		<ng-template [ngIf]="(task.hideList.components.indexOf(specs.ID)) > -1" [ngIfElse]="AVAILABLE_CONTAINER">
			<!-- Hide Component -->
		</ng-template>


		<ng-template #AVAILABLE_CONTAINER>
			<ng-template [ngIf]="specs.available" [ngIfElse]="CONNECTED_CONTAINER">
				<!-- Template to render fhem device if device and reading are present -->
				<ng-container *ngIf="deviceState.connected && deviceState.devicePresent && deviceState.readingPresent; else CONNECTED_CONTAINER">
					<ng-container *ngTemplateOutlet="RENDER_CONTAINER"></ng-container>
				</ng-container>
			</ng-template>
		</ng-template>

		<ng-template #CONNECTED_CONTAINER>
			<!-- Fallback to fhem connection for Components where only a fhem connection is needed (define by specs.connected) -->

			<ng-template [ngIf]="specs.connected" [ngIfElse]="OFFLINE_CONTAINER">
				<ng-container *ngIf="deviceState.connected; else OFFLINE_CONTAINER">
					<ng-container *ngTemplateOutlet="RENDER_CONTAINER"></ng-container>
				</ng-container>
			</ng-template>
		</ng-template>

		<ng-template #OFFLINE_CONTAINER>
			<!-- Fallback to offline for Components noconnection is needed (define by specs.offline) -->

			<ng-template [ngIf]="specs.offline" [ngIfElse]="LOADING">
				<ng-container *ngTemplateOutlet="RENDER_CONTAINER"></ng-container>
			</ng-template>
		</ng-template>

		<ng-template #LOADING>
			<ng-template [ngIf]="showLoader" [ngIfElse]="UNAVAILABLE">
				<div class="unavailable">
					<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
				</div>
			</ng-template>
		</ng-template>

		<ng-template #UNAVAILABLE>
			<div class="unavailable" [ngClass]="settings.app.theme">
				<p class="error"
					*ngIf="!deviceState.connected">
						{{ 'GENERAL.ERRORS.CONNECTION.NO_CONNECTION' | translate }}
						{{ 'GENERAL.ERRORS.CONNECTION.CONNECTION_HELPER' | translate }}
				</p>
				<p class="error"
					*ngIf="deviceState.connected &&
					!deviceState.deviceList">
						{{ 'GENERAL.ERRORS.CONNECTION.NO_DEVICELIST' | translate }}
						{{ 'GENERAL.ERRORS.CONNECTION.CONNECTION_HELPER' | translate }}
				</p>
				<p class="error"
					*ngIf="deviceState.connected &&
					deviceState.deviceList &&
					!deviceState.devicePresent">
						{{ 'GENERAL.ERRORS.NOT_FOUND.DEVICE_NOT_FOUND' | translate }}
						{{ 'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate }}
				</p>
				<p class="error"
					*ngIf="deviceState.connected &&
					deviceState.deviceList &&
					deviceState.devicePresent &&
					!deviceState.readingPresent">
						{{ 'GENERAL.ERRORS.NOT_FOUND.READING_NOT_FOUND' | translate }}
						{{ 'GENERAL.ERRORS.NOT_FOUND.COMPONENT_HELPER' | translate }}
				</p>
			</div>
		</ng-template>

		<ng-template #RENDER_CONTAINER>
			<ng-content></ng-content>
		</ng-template>
	`,
	styles: [`
		.unavailable{
			position: absolute;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			border: 1px solid var(--dark-border);
			border-radius: 5px;
			overflow-y: scroll;
		}
		.error{
			margin: 8px;
			animation: show 0.3s ease forwards;
		}
		.dark .error{
			color: var(--dark-p);
		}
		@keyframes show{
			0%{
				opacity: 0;
			}
			100%{
				opacity: 1;
			}
		}
		.lds-ellipsis {
		  display: block;
		  position: absolute;
		  width: 64px;
		  height: 11px;
		  top: 50%;
		  left: 50%;
		  transform: translate3d(-50%,-50%,0);
		}
		.lds-ellipsis div {
		  position: absolute;
		  top: 0px;
		  width: 11px;
		  height: 11px;
		  border-radius: 50%;
		  background: var(--btn-blue);
		  animation-timing-function: cubic-bezier(0, 1, 1, 0);
		}
		.lds-ellipsis div:nth-child(1) {
		  left: 6px;
		  animation: lds-ellipsis1 0.6s infinite;
		}
		.lds-ellipsis div:nth-child(2) {
		  left: 6px;
		  animation: lds-ellipsis2 0.6s infinite;
		}
		.lds-ellipsis div:nth-child(3) {
		  left: 26px;
		  animation: lds-ellipsis2 0.6s infinite;
		}
		.lds-ellipsis div:nth-child(4) {
		  left: 45px;
		  animation: lds-ellipsis3 0.6s infinite;
		}
		@keyframes lds-ellipsis1 {
		  0% {
		    transform: scale3d(0,0,0);
		  }
		  100% {
		    transform: scale3d(1,1,1);
		  }
		}
		@keyframes lds-ellipsis3 {
		  0% {
		    transform: scale3d(1,1,1);
		  }
		  100% {
		    transform: scale3d(0,0,0);
		  }
		}
		@keyframes lds-ellipsis2 {
		  0% {
		    transform: translate3d(0, 0, 0);
		  }
		  100% {
		    transform: translate3d(19px, 0, 0);
		  }
		}
	`]
})
export class FhemContainerComponent implements OnInit, OnDestroy {
	// input of fhem device specs {
		// device: fhemDevice or list of devices,
		// reading: reading,
		// offline: true or false --> component is available in offline mode
		// connected: true or false --> component is available in connected mode
		// available true or false --> component is only available if device and reading was found
	// }
	@Input() specs: any;

	// indicate if fhem device is available and fall devices are loaded
	public deviceState: any = {connected: false, deviceList: false, devicePresent: false, readingPresent: false};

	// loading animation
	public showLoader = true;

	// subscribe to fhem state
	private fhemSub: Subscription;

	constructor(
		public settings: SettingsService,
		private fhem: FhemService,
		private helper: HelperService,
		public task: TasksService) {
	}

	ngOnInit() {
		// give loader 2s time before showing error message
		setTimeout(() => {this.showLoader = false; }, 2000);

		// initialize specs
		this.specs = {
			ID: this.specs.ID || 0,
			device: (typeof this.specs.device === 'string') ? this.specs.device.replace(/\s/g, '').split(',') : this.specs.device,
			reading: this.specs.reading,
			offline: this.specs.offline || false,
			connected: this.specs.connected || false,
			available: this.specs.available || false
		};
		// subscribe to fhem loader
		// evaluate current state
		if (!this.fhem.devicesLoaded) {
			this.fhemSub = this.fhem.loadedDevices.subscribe((state) => {
				this.evaluator(state);
			});
		} else {
			this.evaluator(true);
			// subscribe to fhem loader, to evaluate changes of fhem connection
			this.fhemSub = this.fhem.loadedDevices.subscribe((state) => {
				this.evaluator(state);
			});
		}
	}

	private evaluator(fhemState) {
		this.deviceState.connected = this.fhem.connected;
		if (fhemState) {
			// connection to them is present
			this.deviceState.deviceList = true;
			if (this.specs.device) {
				for (let i = 0; i < this.specs.device.length; i++) {
					const deviceIndex = this.helper.find(this.fhem.devices, 'device', (this.specs.device[i] || null));
					if (deviceIndex) {
						this.deviceState.devicePresent = true;
						const device = this.fhem.devices[deviceIndex.index];
						this.deviceState.readingPresent = this.fhem.deviceReadingFinder(this.specs.device[i], this.specs.reading);
					}
				}
			} else {
				this.deviceState.devicePresent = false;
			}
		} else {
			this.deviceState.deviceList = false;
		}
	}

	ngOnDestroy() {
		if (this.fhemSub !== undefined) {
			this.fhemSub.unsubscribe();
		}
	}
}
