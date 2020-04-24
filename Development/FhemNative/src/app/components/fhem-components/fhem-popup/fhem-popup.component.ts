import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-popup',
	templateUrl: './fhem-popup.component.html',
  	styleUrls: ['./fhem-popup.component.scss']
})
export class FhemPopupComponent implements OnInit, OnDestroy {
	// popup container
	@ViewChild('container', { static: false, read: ViewContainerRef }) container: ViewContainerRef;
	// edit change
	private editSub: Subscription;

	@Input() ID: string;
	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_headline: string;
	@Input() data_width: string;
	@Input() data_height: string;

	@Input() bool_data_openOnReading: boolean;
	@Input() bool_data_customAnimation: boolean;
	@Input() bool_data_invertAnimation: boolean;

	@Input() arr_data_animationStyle: string|string[];
	@Input() arr_data_style: string[];

	// Icons
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;
	// Style
	@Input() style_iconColorOn: string
	@Input() style_iconColorOff: string;
	@Input() style_backgroundColorOn: string;
	@Input() style_backgroundColorOff: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	// state of fhem device
	popupState: boolean = false;
	// popup properties
	allowBackdrop: boolean = true;
	allowCloseButton: boolean = true;
	showEditButton: boolean = false;

	ngOnInit(){
		if(this.data_device){
			this.fhem.getDevice(this.ID, this.data_device, (device)=>{
				this.getState(device);
			}).then(device=>{
				this.getState(device);
			});
		}
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
	}

	private getState(device){
		this.fhemDevice = device;
		if(this.bool_data_openOnReading && this.allowBackdrop && this.allowCloseButton){
			this.popupState = this.fhem.deviceReadingActive(device, this.data_reading, this.data_getOn);
		}
	}

	togglePopup(){
		this.popupState = !this.popupState;
		this.native.nativeClickTrigger();
	}

	popupOpened(){
		// subscribe to room edit Changes
	  	this.editSub = this.settings.modeSub.subscribe(next =>{
	  		if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
				if(this.settings.modes.roomEdit){
					this.createGrid();
					// disable closing
					this.allowBackdrop = false;
					this.allowCloseButton = false;
				}else{
					this.removeGrid();
					// disable closing
					this.allowBackdrop = true;
					this.allowCloseButton = true;
				}
			}
		});
		// assign new current container
		this.componentLoader.currentContainerSub.next({ID: this.ID,action: 'add',container: this.container});
		// load popup components
		const popupComponents = this.structure.getComponentContainer(this.container);
		if(popupComponents){
			this.componentLoader.loadRoomComponents(popupComponents, this.container, false);
		}
	}

	popupClosed(){
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		// revert back to last container
		this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
		// remove popup components
		const popupComponents: Array<any> = this.structure.getComponentContainer(this.container);
		if(popupComponents){
			popupComponents.forEach((component)=>{
				this.componentLoader.removeDynamicComponent(component.ID);
			});
		}
	}

	private createGrid(){
		if(this.structure.canEditContainer(this.ID)){
			this.componentLoader.createSingleComponent('GridComponent', this.container, {
				container: this.container
			});
		}
	}

	private removeGrid(){
		this.componentLoader.removeDynamicComponent('GridComponent');

	}

	// edit button insige popup
	editPopup(){
		// assign edit properties
		this.settings.modeSub.next({
			roomEdit: true,
			roomEditFrom: this.ID
		});
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.popupClosed();
	}

	constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService,
		private native: NativeFunctionsService){
	}

	static getSettings() {
		return {
			name: 'Popup',
			type: 'fhem',
			container: 'single',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_headline', default: 'Popup'},
				{variable: 'data_width', default: '80'},
				{variable: 'data_height', default: '80'},
				{variable: 'bool_data_openOnReading', default: false},
				{variable: 'bool_data_customAnimation', default: false},
				{variable: 'bool_data_invertAnimation', default: false},
				{variable: 'arr_data_animationStyle', default: 'scale,from-top,from-bottom,from-left,from-right,jump-in,flip-in-x,flip-in-y,scale-x,scale-y'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_backgroundColorOn', default: '#303030'},
				{variable: 'style_backgroundColorOff', default: '#303030'}
			],
			dependencies: {
				bool_data_invertAnimation: { dependOn: 'bool_data_customAnimation', value: true },
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
	imports: [ComponentsModule, IonicModule],
  	declarations: [FhemPopupComponent]
})
class FhemPopupComponentModule {}