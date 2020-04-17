import { Component, Input, NgModule } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

@Component({
	selector: 'fhem-line',
	templateUrl: './fhem-line.component.html',
  	styleUrls: ['./fhem-line.component.scss']
})
export default class FhemLineComponent {
	// Component ID
	@Input() ID: string;

	@Input() arr_data_orientation: string[];
	@Input() data_height: string;
	@Input() data_rotation: string;
	@Input() data_curve_percentage: string;

	// Styling
	@Input() style_color: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;

	static getSettings() {
		return {
			name: 'Line',
			type: 'style',
			inputs: [
				{variable: 'arr_data_orientation', default: 'vertical,horizontal'},
				{variable: 'data_height', default: '2'},
				{variable: 'data_rotation', default: '0'},
				{variable: 'data_curve_percentage', default: '0'},
				{variable: 'style_color', default: '#86d993'}
			],
			dimensions: {minX: 30, minY: 30}
		};
	}
}
@NgModule({
	imports: [ComponentsModule],
  	declarations: [FhemLineComponent]
})
class FhemLineComponentModule {}