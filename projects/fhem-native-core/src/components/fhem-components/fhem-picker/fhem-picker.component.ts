import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';

// Components
import { IonicModule } from '@ionic/angular';
import { IconModule } from '../../icon/icon.component';
import { FhemComponentModule } from '../fhem-component.module';
import { PickerComponentModule } from '../../picker/picker.component';

// Directives
import { GrouperModule } from '@FhemNative/directives/grouper.directive';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

// Interfaces
import { ComponentSettings, FhemDevice, DynamicComponentDefinition } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-picker',
	templateUrl: './fhem-picker.component.html',
  	styleUrls: ['./fhem-picker.component.scss']
})
export class FhemPickerComponent implements OnInit, OnDestroy {
	// picker container
	@ViewChild('container', { static: false, read: ViewContainerRef }) container!: ViewContainerRef;
	// edit change
	private editSub!: Subscription;

	@Input() ID!: string;
	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_getOn!: string;
	@Input() data_getOff!: string;
	@Input() data_headline!: string;
	@Input() data_cancelText!: string;
	@Input() data_height!: string;

	@Input() bool_data_openOnReading!: boolean;
	@Input() bool_data_customAnimation!: boolean;

	@Input() arr_data_animationStyle!: string[];
	@Input() arr_data_style!: string[];

	// Icons
	@Input() icon_iconOn!: string;
	@Input() icon_iconOff!: string;
	// Style
	@Input() style_iconColorOn!: string
	@Input() style_iconColorOff!: string;
	@Input() style_backgroundColorOn!: string;
	@Input() style_backgroundColorOff!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	// state of fhem device
	pickerState: boolean = false;
	// picker properties
	allowBackdrop: boolean = true;
	allowCancelButton: boolean = true;
	showEditButton: boolean = false;

	ngOnInit(){
		if(this.data_device){
			this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
				this.getState(device);
			}).then((device: FhemDevice|null)=>{
				this.getState(device);
			});
		}
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(this.bool_data_openOnReading && this.allowBackdrop && this.allowCancelButton){
			this.pickerState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
		}
	}

	togglePicker(): void{
		this.pickerState = !this.pickerState;
		this.native.nativeClickTrigger();
	}

	pickerOpened(): void{
		// subscribe to room edit Changes
	  	this.editSub = this.settings.modeSub.subscribe(next =>{
	  		if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
				if(this.settings.modes.roomEdit){
					this.createGrid();
					// disable closing
					this.allowBackdrop = false;
					this.allowCancelButton = false;
				}else{
					this.removeGrid();
					// disable closing
					this.allowBackdrop = true;
					this.allowCancelButton = true;
				}
			}
		});
		// assign new current container
		this.componentLoader.currentContainerSub.next({ID: this.ID,action: 'add',container: this.container});
		// load popup components
		const pickerComponents = this.structure.getComponentContainer(this.container);
		if(pickerComponents){
			this.componentLoader.loadRoomComponents(pickerComponents, this.container, false);
		}

		// initial check on open --> used when popup button is clickable from swiper
		if(this.settings.modes.roomEdit){
			setTimeout(()=>{
				this.editPicker();
			}, 400);
		}
	}

	pickerClosed(): void{
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		// revert back to last container
		this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
		// remove popup components
		const pickerComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(this.container);
		if(pickerComponents){
			pickerComponents.forEach((component: DynamicComponentDefinition)=>{
				if(component.ID) this.componentLoader.removeDynamicComponent(component.ID);
			});
		}
	}

	private createGrid(): void{
		if(this.structure.canEditContainer(this.ID)){
			this.componentLoader.createSingleComponent('GridComponent', this.container, {
				container: this.container
			});
		}
	}

	private removeGrid(): void{
		this.componentLoader.removeDynamicComponent('GridComponent');
	}

	// edit button inside picker
	editPicker(): void{
		// assign edit properties
		this.settings.modeSub.next({ roomEdit: true, roomEditFrom: this.ID });
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.pickerClosed();
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private structure: StructureService,
		private native: NativeFunctionsService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Picker',
			type: 'fhem',
			container: 'single',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_headline', default: 'Picker'},
				{variable: 'data_cancelText', default: 'Close'},
				{variable: 'data_height', default: '80'},
				{variable: 'bool_data_openOnReading', default: false},
				{variable: 'bool_data_customAnimation', default: false},
				{variable: 'arr_data_animationStyle', default: 'from-bottom,from-top'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_backgroundColorOn', default: '#303030'},
				{variable: 'style_backgroundColorOff', default: '#303030'}
			],
			dependencies: {
				arr_data_animationStyle: { dependOn: 'bool_data_customAnimation', value: true },
				// neumorph dependencies
				style_backgroundColorOn: { dependOn: 'arr_data_style', value: 'standard' },
				style_backgroundColorOff: { dependOn: 'arr_data_style', value: 'standard' }
			},
			dimensions: {minX: 40, minY: 40}
		};
	}

}
@NgModule({
	imports: [
		IconModule,
		IonicModule,
		GrouperModule,
		FhemComponentModule, 
		PickerComponentModule
	],
  	declarations: [FhemPickerComponent]
})
class FhemPickerComponentModule {}