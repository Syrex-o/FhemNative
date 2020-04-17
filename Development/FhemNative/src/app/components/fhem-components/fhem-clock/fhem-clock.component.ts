import { Component, Input, NgModule, OnInit, OnDestroy } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';
import { NgIfOnceDirective } from '../../../directives/ngIfOnce.directive';

// Services
import { TimeService } from '../../../services/time.service';

@Component({
	selector: 'fhem-clock',
	templateUrl: './fhem-clock.component.html',
  	styleUrls: ['./fhem-clock.component.scss']
})
export default class FhemClockComponent implements OnInit, OnDestroy {
	@Input() ID: string;
	@Input() arr_data_style: string[];
	@Input() arr_data_format: string[];
	@Input() bool_data_showTicks: boolean;

	@Input() style_color: string;
	@Input() style_hourColor: string;
	@Input() style_minuteColor: string;
	@Input() style_secondColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	private interval:any;
	digitalClock: any = {HH: '00',mm: '00',ss: '00'};
	analogClock: any = {HH: 0,mm: 0,ss: 0};

	ngOnInit(){
		const update = 'update'+this.arr_data_style[0];
		this[update]();
		this.interval = setInterval(()=>{
			this[update]();
		}, 1000);
	}

	private updatedigital(){
		const t = this.time.local();
		this.digitalClock = {
			HH: t.hour,
			mm: t.minute,
			ss: t.second
		}
	}

	private updateanalog(){
		const t:any = this.time.local();
		this.analogClock = {
			HH: parseInt(t.hour) * 30 + parseInt(t.minute) * (360/720),
			mm: parseInt(t.minute) * 6 + parseInt(t.second) * (360/3600),
			ss: (360 / 60) * parseInt(t.second)
		};
	}

	displayValue(str){
		const re = new RegExp(str, 'g');
		return this.arr_data_format[0].match(re);
	}

	ngOnDestroy(){
		clearInterval(this.interval);
	}

	constructor(private time: TimeService) {}

	static getSettings() {
		return {
			name: 'Clock',
			type: 'style',
			inputs: [
				{variable: 'arr_data_style', default: 'digital,analog'},
				{variable: 'arr_data_format', default: 'HH:mm:ss,HH:mm'},
				{variable: 'bool_data_showTicks', default: true},
				{variable: 'style_color', default: '#14a9d5'},
				{variable: 'style_hourColor', default: '#14a9d5'},
				{variable: 'style_minuteColor', default: '#14a9d5'},
				{variable: 'style_secondColor', default: '#d62121'}
			],
			dependencies: {
				bool_data_showTicks: { dependOn: 'arr_data_style', value: 'analog' }
			},
			dimensions: {minX: 60, minY: 40}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [NgIfOnceDirective, FhemClockComponent]
})
class FhemClockComponentModule {}