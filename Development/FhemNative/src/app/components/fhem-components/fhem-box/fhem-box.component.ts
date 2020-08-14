import { Component, Input, NgModule } from '@angular/core';

// Components
import { ComponentsModule } from '../../components.module';

// Interfaces
import { ComponentSettings } from '../../../interfaces/interfaces.type';

// Services
import { SettingsService } from '../../../services/settings.service';

@Component({
	selector: 'fhem-box',
	templateUrl: './fhem-box.component.html',
  	styleUrls: ['./fhem-box.component.scss']
})
export class FhemBoxComponent{
	@Input() ID: string;

	@Input() data_headline: string;
	@Input() data_borderRadius: string;
	@Input() data_borderRadiusTopLeft: string;
	@Input() data_borderRadiusTopRight: string;
	@Input() data_borderRadiusBottomLeft: string;
	@Input() data_borderRadiusBottomRight: string;
	@Input() arr_data_style: string[];

	// notch values
	@Input() data_notchDefinition: string;

	@Input() bool_data_showShadow: boolean;
	@Input() bool_data_showHeader: boolean;
	@Input() bool_data_customBorder: boolean;
	@Input() bool_data_customNotch: boolean;

	// Styling
	@Input() style_headerColor: string;
	@Input() style_backgroundColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: string;


	constructor(public settings: SettingsService){}

	static getSettings(): ComponentSettings {
		return {
			name: 'Box',
			type: 'style',
			inputs: [
				{variable: 'data_headline', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				// box notch
				{variable: 'data_notchDefinition', default: '0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%'},
				{variable: 'style_headerColor', default: '#434E5D'},
				{variable: 'style_backgroundColor', default: '#58677C'},
				{variable: 'bool_data_showHeader', default: true},
				{variable: 'bool_data_showShadow', default: true},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'bool_data_customNotch', default: false},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'}

			],
			dependencies: {
				// custom border
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },
				// custom notch
				data_notchDefinition: { dependOn: 'bool_data_customNotch', value: true },
				// neumorph dependencies
				bool_data_showShadow: { dependOn: 'arr_data_style', value: 'standard' },
				style_headerColor: { dependOn: 'arr_data_style', value: 'standard' },
				style_backgroundColor: { dependOn: 'arr_data_style', value: 'standard' }
			},
			dimensions: {minX: 60, minY: 60}
		};
	}
}
@NgModule({
	imports:[ComponentsModule],
  	declarations: [FhemBoxComponent]
})
class FhemBoxComponentModule {}