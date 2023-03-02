import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { IonicModule } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';

// Interfaces
import { ComponentSettings, FhemDevice, DynamicComponentDefinition } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-image',
	templateUrl: './fhem-image.component.html',
	styleUrls: ['./fhem-image.component.scss']
})
export class FhemImageComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_url!: string;
	@Input() data_updateInterval!: string;
	@Input() data_imageUrl!: string;

	@Input() arr_data_defaultImage!: string[];

	@Input() bool_data_cache!: boolean;
	@Input() bool_data_defaultImage!: boolean;
	@Input() bool_data_useLocalImage!: boolean;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	src!: any;

	// update interval --> if needed
	private interval: any;
	// allow local image selection
	allowSelection: boolean = false;

	ngOnInit(){
		if(!this.bool_data_useLocalImage){
			this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
				this.getState(device);
			}).then((device: FhemDevice|null)=>{
				this.getState(device);
			});
		}else{
			// load local image
			if(this.data_imageUrl !== ''){
				// image already selected
				this.src = this.data_imageUrl;
			}else{
				// allow selection
				this.allowSelection = true;
			}
		}
	}

	// upload file from local storage
	async uploadFile(event: any): Promise<void>{
		if(event && event.target && event.target.files){
			const file: File = event.target.files[0];
			if(file && file.type.match(/image\/*/) !== null){
				const fileReader = new FileReader();
				fileReader.onload = () => {
					this.src = fileReader.result;
					// save data in component
					const comp: DynamicComponentDefinition|null = this.structure.getComponent(this.ID);
					if(comp && comp.attributes.attr_data){
						// change component attribute
						let setting = comp.attributes.attr_data.find(x=> x.attr === "data_imageUrl");
						if(setting){
							setting.value = this.src;
							// save structure
							this.structure.saveRooms();
							this.allowSelection = false;
						}
					}
				}
				fileReader.readAsDataURL(file);
			}
		}
		// allow room reloading again
		this.settings.blockRoomReload = false;
	}

	private getState(device: FhemDevice|null): void {
		this.fhemDevice = device;
		if(device && this.fhemDevice && this.fhemDevice.readings[this.data_reading]){
			this.src = this.fhemDevice.readings[this.data_reading].Value;
		}else{
			this.src = this.data_url !== '' ? this.data_url : '';
		}
		this.updateImageData(this.src);
	}

	private updateImageData(src: string): void {
		// (-) for none readings (list could be extended)
		if(src !== '' && src !== '-'){
			// build interval
			if(!this.bool_data_cache){
				if(this.interval){
					clearInterval(this.interval);
				}
				this.interval = setInterval(()=>{
					this.src = src +'?dummy=' + new Date().getTime();
				}, parseInt(this.data_updateInterval) * 1000);
			}
		}else{
			if(this.bool_data_defaultImage){
				this.src = 'assets/img/' + this.arr_data_defaultImage[0];
			}
		}
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		if(this.interval){
			clearInterval(this.interval);
		}
	}

	constructor(private fhem: FhemService, private structure: StructureService, public settings: SettingsService) {}

	static getSettings(): ComponentSettings {
		return {
			name: 'Image',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_url', default: ''},
				{variable: 'data_updateInterval', default: '10'},
				{variable: 'data_imageUrl', default: ''},
				{variable: 'arr_data_defaultImage', default: 'default-music.png,default-image.png'},
				{variable: 'bool_data_cache', default: true},
				{variable: 'bool_data_defaultImage', default: false},
				{variable: 'bool_data_useLocalImage', default: false}
			],
			dependencies:{
				data_updateInterval: {dependOn: 'bool_data_cache', value: false},
				arr_data_defaultImage: {dependOn: 'bool_data_defaultImage', value: true},
				// local image
				data_device: {dependOn: 'bool_data_useLocalImage', value: false},
				data_reading: {dependOn: 'bool_data_useLocalImage', value: false},
				data_url: {dependOn: 'bool_data_useLocalImage', value: false},
				bool_data_cache: {dependOn: 'bool_data_useLocalImage', value: false},
				data_imageUrl: {dependOn: 'bool_data_useLocalImage', value: true}
			},
			dimensions: {minX: 40, minY: 40}
		};
	}
}
@NgModule({
	imports: [FhemComponentModule, IonicModule],
	declarations: [FhemImageComponent]
})
class FhemImageComponentModule {}