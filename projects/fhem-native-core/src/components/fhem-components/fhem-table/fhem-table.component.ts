import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { IonicModule } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';
import { PickerComponentModule } from '../../picker/picker.component';
import { SelectComponentModule } from '../../select/select.component';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-table',
	templateUrl: './fhem-table.component.html',
  	styleUrls: ['./fhem-table.component.scss']
})
export class FhemTableComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;

	// custom inputs
	@Input() displayHeader!: string[];
	@Input() displayReadings!: string[];

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	fhemDevice!: FhemDevice|null;
	// custom input properties
	private customInputs: any;

	// custom input properties
	readings: string[] = [];
	headerValues: string[] = ['Reading', 'Value', 'Time'];

	// edit table properties
	showEditButton: boolean = false;
	showTableConfig: boolean = false;

	ngOnInit(){
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
			this.loadCustomInputs();
		});
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(device){
			this.readings = Object.keys(device.readings);
		}
	}

	// load the additional component information
	private loadCustomInputs(): void{
		// load the additional information
		this.componentLoader.assignCustomInputData(this.ID, 'Table').then((customInputs: any)=>{
			this.customInputs = customInputs;
			if(customInputs.displayHeader.length === 0){
				this.customInputs.displayHeader = this.headerValues;
				this.displayHeader = this.headerValues;
			}
			if(customInputs.displayReadings.length === 0){
				this.customInputs.displayReadings = this.readings;
				this.displayReadings = this.readings;
			}
		});
	}

	// edit table properties
	editTable(): void{
		this.showTableConfig = !this.showTableConfig;
	}

	saveTableConfig(): void{
		let component = this.structure.getComponent(this.ID);
		if(component && this.customInputs){
			// write to component
			component['customInputs'] = this.customInputs;
			// assign as change
			this.undoManager.addChange();
			// reload attributes
			this.loadCustomInputs();
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Table',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''}
			],
			customInputs:{
				displayHeader: [],
				displayReadings: []
			},
			dimensions: {minX: 100, minY: 50}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule, IonicModule, SelectComponentModule, PickerComponentModule],
  	declarations: [FhemTableComponent]
})
class FhemTableComponentModule {}