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
			<div *ngIf="arr_data_orientation[0] == 'horizontal'" class="line-item horizontal" [ngStyle]="{'height': data_height+'px', 'background': style_color}"></div>
			<div *ngIf="arr_data_orientation[0] == 'vertical'" class="line-item vertical" [ngStyle]="{'width': data_height+'px', 'background': style_color}"></div>
		</div>
	`,
	styles: [`
		.line{
			position: absolute;
    		width: 30px;
    		height: 30px;
		}
		.line-item{
			position: absolute;
		}
		.horizontal{
			width: 100%;
			top: 50%;
			transform: translate3d(0-50%,0);
			left: 0;
		}
		.vertical{
			height: 100%;
			left: 50%;
			transform: translate3d(-50%,0,0);
			top: 0;
		}
	`]
})
export class LineComponent {
	// Component ID
	@Input() ID: number;

	@Input() arr_data_orientation: string|string[];
	@Input() data_height: string;

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
				{variable: 'style_color', default: '#86d993'}
			],
			dimensions: {minX: 30, minY: 30}
		};
	}
}
