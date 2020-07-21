import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { TaskService } from '../../../services/task.service';

@Component({
	selector: 'fhem-component-container',
	templateUrl: './fhem-component-container.component.html',
  	styleUrls: ['./fhem-component-container.component.scss']
})
export class FhemComponentContainerComponent implements OnInit, OnChanges, OnDestroy{
	// input of fhem device specs {
		// ID: id in FhemNative
		// device: fhemDevice or list of devices,
		// reading: reading,
		// offline: true or false --> component is available in offline mode
		// connected: true or false --> component is available in connected mode
		// available true or false --> component is only available if device and reading was found
	// }
	@Input() specs: any;
	// fhemDevice input
	@Input() fhemDevice: any;
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
			available: this.specs.available || false
		};

		// connection sub
		this.connectedSub = this.fhem.connectedSub.subscribe((state: boolean)=>{
			if(!state){
				this.fhemDevice = null;
			}
			this.testDevice();
		});
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
		// initial test
		this.testDevice();
		// set timer for testDone after 5 secs
		setTimeout(()=>{
			this.deviceState.testDone = true;
		}, 5000);
	}

	ngOnChanges(changes: SimpleChanges){
		if(changes.fhemDevice){
			this.testDevice();
		}
	}

	// test device and reading config
	private testDevice(){
		// check connection
		this.deviceState.connected = this.fhem.connected;
		// device check
		this.deviceState.devicePresent = this.fhemDevice ? true : false;
		// available check
		if(this.specs.available){
			if(this.fhemDevice && this.fhemDevice.readings[this.specs.reading]){
				this.deviceState.readingPresent = true;
			}else{
				this.deviceState.readingPresent = false;
			}
		}
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