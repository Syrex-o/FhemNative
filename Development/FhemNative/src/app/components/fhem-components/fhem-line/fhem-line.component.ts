import { Component, Input, NgModule, ElementRef, OnInit } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { SettingsService } from '../../../services/settings.service';

@Component({
	selector: 'fhem-line',
	templateUrl: './fhem-line.component.html',
  	styleUrls: ['./fhem-line.component.scss']
})
export class FhemLineComponent implements OnInit {
	// Component ID
	@Input() ID: string;

	@Input() arr_data_orientation: string[];
	@Input() data_height: string;
	@Input() data_rotation: string;
	@Input() data_curve_percentage: string;
	@Input() arr_data_style: string[];

	// Styling
	@Input() style_color: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;
	@Input() rotation: string;

	heightT: number = 0;

	ngOnInit(){
		this.heightT = parseInt(this.data_height);
	}

	constructor(public settings: SettingsService, private ref: ElementRef){}

	static getSettings() {
		return {
			name: 'Line',
			type: 'style',
			inputs: [
				{variable: 'arr_data_orientation', default: 'vertical,horizontal'},
				{variable: 'data_height', default: '2'},
				{variable: 'data_rotation', default: '0'},
				{variable: 'data_curve_percentage', default: '0'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'},
				{variable: 'style_color', default: '#86d993'}
			],
			dependencies:{
				style_color: { dependOn: 'arr_data_style', value: 'standard' },
			},
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemLineComponent]
})
class FhemLineComponentModule {}