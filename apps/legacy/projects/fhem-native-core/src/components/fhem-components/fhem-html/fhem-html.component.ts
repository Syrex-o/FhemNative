import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';

// Components
import { FhemComponentModule } from '../fhem-component.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
// Interfaces
import { ComponentSettings, FhemDevice } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-html',
	templateUrl: './fhem-html.component.html',
  	styleUrls: ['./fhem-html.component.scss']
})
export class FhemHtmlComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_reading!: string;
	@Input() data_rawHtml!: string;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;
	@Input() rotation!: string;

	fhemDevice!: FhemDevice|null;
	// html text
	html_text!: string|null;
	// host elem of htmlElem
	private hostEl!: HTMLElement;
	// renderer elem
	private htmlElem!: HTMLElement;

	ngOnInit() {
		setTimeout(()=>{
			this.hostEl = this.ref.nativeElement.querySelector('.html-container');
			if(this.data_device !== ''){
				this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
					this.getHtml(device);
				}).then((device: FhemDevice|null)=>{
					this.getHtml(device);
				});
			}
			else if(this.data_rawHtml !== ''){
				this.html_text = this.data_rawHtml
				this.insertHtml();
			}
		}, 0);
	}

	private getHtml(device: any): void{
		this.fhemDevice = device;
		if(device){
			if(this.data_reading in device.readings){
				this.html_text = device.readings[this.data_reading].Value;
				this.insertHtml();
			}
		}else{
			this.html_text = null;
		}
	}

	private insertHtml(): void{
		if(this.htmlElem){
			this.renderer.removeChild(this.hostEl, this.htmlElem);
		}
		// create html elem
		this.htmlElem = this.renderer.createElement('div');
		this.renderer.appendChild(this.hostEl, this.htmlElem);
		this.renderer.setProperty(this.htmlElem, 'innerHTML', this.html_text);
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
	}

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		private renderer: Renderer2,
		public settings: SettingsService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Html',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_rawHtml', default: ''}
			],
			dimensions: {minX: 30, minY: 30}
		}
	};
}
@NgModule({
	imports: [FhemComponentModule],
  	declarations: [FhemHtmlComponent]
})
class FhemHtmlComponentModule {}