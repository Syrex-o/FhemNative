import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { TaskService } from '../../../services/task.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

@Component({
	selector: 'fhem-component-container',
	templateUrl: './fhem-component-container.component.html',
  	styleUrls: ['./fhem-component-container.component.scss']
})
export class FhemComponentContainerComponent implements OnInit, OnDestroy{
	// input of fhem device specs {
		// ID: id in FhemNative
		// device: fhemDevice or list of devices,
		// reading: reading,
		// offline: true or false --> component is available in offline mode
		// connected: true or false --> component is available in connected mode
		// available true or false --> component is only available if device and reading was found
	// }
	@Input() specs: any;
	// position information
	@Input() position:any;
	// minimal properties
	@Input() minimumWidth: string|number = 100;
	@Input() minimumHeight: string|number = 50;

	// indicate if fhem device is available and fall devices are loaded
	deviceState: any = {connected: false, devicePresent: false, readingPresent: false, testDone: false};

	// determine if component is editable
	editable: boolean = false;
	// mode sub 
	private editSub: Subscription;
	private connectedSub: Subscription;
	// init state
	private initial: boolean = true;

	constructor(
		public settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService,
		private fhem: FhemService,
		public task: TaskService) {
	}

	ngOnInit() {
		// initialize specs
		this.specs = {
			ID: this.specs.ID || 0,
			device: this.specs.device ? (Array.isArray(this.specs.device) ? this.specs.device : this.fhem.seperateDevices(this.specs.device)) : [],
			reading: this.specs.reading,
			offline: this.specs.offline || false,
			connected: this.specs.connected || false,
			available: this.specs.available || false,
			forceReload: this.specs.forceReload || false
		};
		// test devices
		this.connectedSub = this.fhem.connectedSub.subscribe((state: boolean)=>{
			this.deviceState.connected = state;
			if(state){
				this.reloadHandler();
				this.looper();
			}else{
				this.testForReading(null);
			}
		});
		if(this.fhem.connected){
			this.deviceState.connected = true;
			this.reloadHandler();
			this.looper();
		}
		// subscribe to mode changes
		this.editSub = this.settings.modeSub.subscribe(next =>{
			if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
				if(this.settings.modes.roomEdit){
					this.editable = this.specs.ID === 'TEST_COMPONENT' ? false : this.structure.canEditComponent(this.specs.ID);
				}else{
					this.editable = false;
				}
			}
		});
		// initial check for editing
		if(this.settings.modes.roomEdit){
			this.editable = this.specs.ID === 'TEST_COMPONENT' ? false : this.structure.canEditComponent(this.specs.ID);
		}
	}

	// component reload handler
	private reloadHandler(){
		if(this.initial){
			this.initial = false;
		}else{
			// detect if component needs reload
			if(this.specs.forceReload){
				this.componentLoader.rerenderFhemComponent(this.specs.ID);
			}
		}
	}

	// device looper
	private looper(){
		this.specs.device.forEach((deviceName: string)=>{
			this.testForDevice(deviceName);
		});
		// check if no device is available
		if(this.specs.device.length === 0){
			this.testForReading(null);
		}
	}

	// test component device configuration
	private testForDevice(deviceName: string){
		// find device in fhem device list
		const foundDevice = this.fhem.devices.find(x=> x.device === deviceName);
		if(foundDevice){
			this.testForReading(foundDevice);
		}else{
			if(deviceName && deviceName !== ''){
				// send request
				let gotReply: boolean = false;
				const sub: Subscription = this.fhem.deviceListSub.subscribe(next=>{
					gotReply = true;
					sub.unsubscribe();
					if(next){
						this.testForReading(next.find(x=> x.device === deviceName));
					}
				});
				setTimeout(()=>{
					if(!gotReply){
						sub.unsubscribe();
						this.testForReading(foundDevice);
					}
				}, 1000);
			}else{
				this.testForReading(foundDevice);
			}
		}
	}

	// test component reading configuration
	private testForReading(device:any){
		if(device){
			// device found
			this.deviceState.devicePresent = true;
			if(this.specs.reading){
				this.deviceState.readingPresent = this.fhem.deviceReadingFinder(device.device, this.specs.reading);
			}else{
				// no defined reading
				this.deviceState.readingPresent = false;
			}
		}else{
			this.deviceState.devicePresent = false;
		}
		this.deviceState.testDone = true;
	}

	ngOnDestroy(){
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		if(this.connectedSub){
			this.connectedSub.unsubscribe();
		}
	}
}