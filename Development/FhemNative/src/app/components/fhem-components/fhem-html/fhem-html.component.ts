import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
import { TranslateModule } from '@ngx-translate/core';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';

@Component({
	selector: 'fhem-html',
	templateUrl: './fhem-html.component.html',
  	styleUrls: ['./fhem-html.component.scss']
})
export class FhemHtmlComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_rawHtml: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	fhemDevice: any;
	// html text
	html_text: string;
	// host elem of htmlElem
	private hostEl: HTMLElement;
	// renderer elem
	private htmlElem: HTMLElement;

	ngOnInit() {
		setTimeout(()=>{
			this.hostEl = this.ref.nativeElement.querySelector('.html-container');
			if(this.data_device !== ''){
				this.fhem.getDevice(this.ID, this.data_device, (device)=>{
					this.getHtml(device);
				}).then(device=>{
					this.getHtml(device);
				});
			}
			else if(this.data_rawHtml !== ''){
				this.html_text = this.data_rawHtml
				this.insertHtml();
			}
		}, 0);
	}

	private getHtml(device: any){
		this.fhemDevice = device;
		if(device){
			if(this.data_reading in device.readings){
				this.html_text = device.readings[this.data_reading].Value;
				this.insertHtml();
			}
		}else{
			this.html_text = undefined;
		}
	}

	private insertHtml(){
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
		public settings: SettingsService,
		private fhem: FhemService,
		private ref: ElementRef,
		private renderer: Renderer2){}

	static getSettings() {
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
	imports: [ComponentsModule, TranslateModule],
  	declarations: [FhemHtmlComponent]
})
class FhemHtmlComponentModule {}