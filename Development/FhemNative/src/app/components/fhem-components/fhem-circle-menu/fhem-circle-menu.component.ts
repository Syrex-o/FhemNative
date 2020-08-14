import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { NativeFunctionsService } from '../../../services/native-functions.service';

@Component({
	selector: 'fhem-circle-menu',
	templateUrl: './fhem-circle-menu.component.html',
  	styleUrls: ['./fhem-circle-menu.component.scss']
})
export class FhemCircleMenuComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_setReading: string;

	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;

	@Input() bool_data_customBorder: boolean;

	@Input() arr_data_style: string[];
	@Input() arr_data_expandStyle: string|string[];


	@Input() data_value1: string;
	@Input() data_value2: string;
	@Input() data_value3: string;
	@Input() data_value4: string;
	@Input() data_value5: string;
	@Input() data_value6: string;

	@Input() icon_icon: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;
	@Input() style_buttonColor: string;
	@Input() style_labelColor: string;
	@Input() style_activeColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: FhemDevice|null;
	// state of fhem device
	buttonState: boolean = false;
	// build items based on user input
	items: Array<any> = [];
	// current item value
	currentValue: string;

	ngOnInit() {
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
			// build item list
			for (let i = 1; i <= 6; i++) {
				if (this['data_value' + i] !== '') {
					this.items.push(this['data_value' + i]);
				}
			}
		});
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		if(device){
			this.currentValue = this.fhemDevice.readings[this.data_reading].Value.toString();
		}
	}

	toggleMenu(): void{
		this.buttonState = !this.buttonState;
	}

	closeMenu(): void{
		this.buttonState = false;
	}

	translator(style: string, index: number): string {
		const max: number = Math.max(parseInt(this.width), parseInt(this.height));
		let translate: string;
		if (style === 'top') {
			translate = 'translate3d(0px,' + ((parseInt(this.height) * (index + 1)) * -1) + 'px, 0px)';
		}
		if (style === 'left') {
			translate = 'translate3d(' + ((parseInt(this.width) * (index + 1)) * -1) + 'px,0px, 0px)';
		}
		if (style === 'bottom') {
			translate = 'translate3d(0px,' + (parseInt(this.height) * (index + 1)) + 'px, 0px)';
		}
		if (style === 'right') {
			translate = 'translate3d(' + (parseInt(this.width) * (index + 1)) + 'px,0px, 0px)';
		}
		if (style === 'circle') {
			translate = 'rotate(' + (360 / this.items.length) * index + 'deg) translate3d('+max+'px,'+max+'px,0px) rotate(' + (-360 / this.items.length) * index + 'deg)';
		}
		return translate;
	}

	select(index: number): void{
		const command: string = this.items[index];
		if (this.data_setReading !== '') {
			this.fhem.setAttr(this.fhemDevice.device, this.data_setReading, command);
		} else {
			this.fhem.set(this.fhemDevice.device, command);
		}
		this.native.nativeClickTrigger();
	}


	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(private fhem: FhemService, public settings: SettingsService, private native: NativeFunctionsService){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Circle Menu',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_setReading', default: ''},
				{variable: 'data_value1', default: ''},
				{variable: 'data_value2', default: ''},
				{variable: 'data_value3', default: ''},
				{variable: 'data_value4', default: ''},
				{variable: 'data_value5', default: ''},
				{variable: 'data_value6', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'arr_data_expandStyle', default: 'top,left,bottom,right,circle'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'},
				{variable: 'icon_icon', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'},
				{variable: 'style_buttonColor', default: '#86d993'},
				{variable: 'style_labelColor', default: '#fff'},
				{variable: 'style_activeColor', default: '#02adea'}
			],
			dependencies: {
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },
				// neumorph dependencies
				style_buttonColor: { dependOn: 'arr_data_style', value: 'standard' },
				style_activeColor: { dependOn: 'arr_data_style', value: 'standard' }
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemCircleMenuComponent]
})
class FhemCircleMenuComponentModule {}