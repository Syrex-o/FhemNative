import { Component, Input } from '@angular/core';

import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-line',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="line"
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			minimumWidth="50"
			minimumHeight="20"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{ID: ID, device: null, reading: null, offline: true}">
				<div class="line-container">
					<div 
						*ngIf="arr_data_orientation[0] === 'horizontal'" 
						class="line-item horizontal"
						[ngStyle]="{
							'height': data_curve_percentage === '0' ? data_height+'px' : '100%', 
							'background': data_curve_percentage === '0' ? style_color : 'transparent', 
							'transform': 'translate3d(0, -50%, 0) rotate('+data_rotation+'deg)',
							'border-left': data_curve_percentage !== '0' ? data_height+'px solid '+style_color : '0px',
							'border-top': data_curve_percentage !== '0' ? data_height+'px solid '+style_color : '0px',
							'border-top-left-radius': data_curve_percentage+'%'
						}">
					</div>
					<div 
						*ngIf="arr_data_orientation[0] === 'vertical'" 
						class="line-item vertical"
						[ngStyle]="{
							'width': data_curve_percentage === '0' ? data_height+'px' : '100%', 
							'background': data_curve_percentage === '0' ? style_color : 'transparent', 
							'transform': 'translate3d(-50%, 0, 0) rotate('+data_rotation+'deg)',
							'border-right': data_curve_percentage !== '0' ? data_height+'px solid '+style_color : '0px',
							'border-bottom': data_curve_percentage !== '0' ? data_height+'px solid '+style_color : '0px',
							'border-bottom-right-radius': data_curve_percentage+'%'
						}">
					</div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.line{
			position: absolute;
    		width: 30px;
    		height: 30px;
		}
		.line-container{
			width: 100%;
			height: 100%;
			overflow: hidden;
			position: relative;
		}
		.line-item{
			position: absolute;
		}
		.horizontal{
			width: 100%;
			top: 50%;
			left: 0;
		}
		.vertical{
			height: 100%;
			left: 50%;
			top: 0;
		}
	`]
})
export class LineComponent {
	// Component ID
	@Input() ID: number;

	@Input() arr_data_orientation: string|string[];
	@Input() data_height: string;
	@Input() data_rotation: string;
	@Input() data_curve_percentage: string;

	// Styling
	@Input() style_color: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;


	constructor(public settings: SettingsService) {}

	static getSettings() {
		return {
			name: 'Line',
			component: 'LineComponent',
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
