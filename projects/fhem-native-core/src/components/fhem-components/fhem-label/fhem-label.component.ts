import { Component, Input, NgModule, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

// Components
import { FhemComponentModule } from '../fhem-component.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';

// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-label',
	templateUrl: './fhem-label.component.html',
	styleUrls: ['./fhem-label.component.scss']
})
export class FhemLabelComponent implements OnInit, AfterViewInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_label!: string;
	@Input() data_items!: string;
	@Input() data_alias!: string;
	@Input() data_labelExtension!: string;
	@Input() data_size!: string;
	@Input() data_min!: string;
	@Input() data_max!: string;

	@Input() arr_data_textAlign!: string[];
	@Input() arr_data_textStyle!: string[];

	// Styling
	@Input() style_color!: string;
	@Input() style_minColor!: string;
	@Input() style_maxColor!: string;

	@Input() bool_data_useAlias!: boolean;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	label!: string;
	labelColor!: string;

	// label style
	labelWeight: number = 400;
	labelStyle: string = 'normal';

	// list itmes
	private items: string[] = [];
	private alias: string[] = [];

	ngOnInit(){
		// assign label before response
		this.label = this.data_label;
		// assign items(alias)
		if(this.bool_data_useAlias){
			this.items = this.data_items.replace(/\s/g, '').split(',');
			this.alias = this.data_alias.replace(/\s/g, '').split(',');
		}
		this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
			this.getState(device);
		}).then((device: FhemDevice|null)=>{
			this.getState(device);
		});
		// assign initial label color
		this.getValueColor();

		// get label style
		this.labelWeight = this.settings.transformWeightFromText(this.arr_data_textStyle[0]);
		this.labelStyle = this.settings.transformStyleFromText(this.arr_data_textStyle[0]);
	}

	ngAfterViewInit(){
		// assign label
		this.assignInnerHTML();
	}

	private getState(device: FhemDevice|null): void{
		this.fhemDevice = device;
		let label: any;
		if(device && this.fhemDevice && this.data_reading in this.fhemDevice.readings){
			label = this.fhemDevice.readings[this.data_reading].Value;
		}else{
			label = this.data_label;
		}
		// get alias
		this.getLabelValue(label);
	}

	private getValueColor(): void{
		// int colors
		if(this.fhemDevice && this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			if(!isNaN(this.fhemDevice.readings[this.data_reading].Value)){
				if(this.data_min !== '' && this.fhemDevice.readings[this.data_reading].Value < parseFloat(this.data_min)){
					this.labelColor = this.style_minColor;
				}
				else if(this.data_max !== '' && this.fhemDevice.readings[this.data_reading].Value > parseFloat(this.data_max)){
					this.labelColor = this.style_maxColor;
				}
				// use default
				else{
					this.labelColor = this.style_color;
				}
			}else{
				if(this.data_min !== '' && this.fhemDevice.readings[this.data_reading].Value === this.data_min){
					this.labelColor = this.style_minColor;
				}
				else if(this.data_max !== '' && this.fhemDevice.readings[this.data_reading].Value === this.data_max){
					this.labelColor = this.style_maxColor;
				}
				// use default
				else{
					this.labelColor = this.style_color;
				}
			}
		}else{
			this.labelColor = this.style_color;
		}
	}

	private getLabelValue(currentVal: any): void{
		if(this.bool_data_useAlias){
			let found: boolean = false;
			this.items.forEach((item: any, i: number)=>{
				let val: string|number|boolean = item;
				if(!isNaN(item)){
					val = parseFloat(item);
				}
				if(this.fhem.IsJsonString(item)){
					val = JSON.parse(item);
				}
				// check matching
				if(val === currentVal){
					found = true;
					this.label = this.alias[i] || currentVal;
				}
			});
			if(!found){
				this.label = currentVal;
			}
		}else{
			this.label = currentVal;
		}
		this.assignInnerHTML();
		this.getValueColor();
	}

	private assignInnerHTML(): void {
		// assign value as innerHtml
		if(this.label || this.label !== ''){
			const t: HTMLElement = this.ref.nativeElement.querySelector('.label-item');
			if(t){
				t.innerHTML = this.label + this.data_labelExtension;
			}
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(private ref: ElementRef,private fhem: FhemService,public settings: SettingsService) {}

	static getSettings(): ComponentSettings {
		return {
			name: 'Label',
			type: 'style',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: ''},
				{variable: 'data_label', default: ''},
				{variable: 'data_items', default: ''},
				{variable: 'data_alias', default: ''},
				{variable: 'data_labelExtension', default: ''},
				{variable: 'data_size', default: '16'},
				{variable: 'data_min', default: ''},
				{variable: 'data_max', default: ''},
				{variable: 'arr_data_textAlign', default: 'left,right,center'},
				{variable: 'arr_data_textStyle', default: 'normal,thin,italic,bold,thin-italic,bold-italic'},
				{variable: 'style_color', default: '#86d993'},
				{variable: 'style_minColor', default: '#02adea'},
				{variable: 'style_maxColor', default: '#fb0a2a'},
				{variable: 'bool_data_useAlias', default: false}
			],
			dimensions: {minX: 60, minY: 40},
			dependencies: {
				data_items: { dependOn: 'bool_data_useAlias', value: true },
				data_alias: { dependOn: 'bool_data_useAlias', value: true }
			}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule],
  	declarations: [FhemLabelComponent]
})
class FhemLabelComponentModule {}