import { Component, Input } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'fhem-box',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="box"
			resize
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			minimumWidth="60"
			minimumHeight="60"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{'device': null, 'reading': null, 'offline': true}">
				<div class="box-container" [ngStyle]="{'box-shadow': bool_data_showShadow ? '0px 15px 25px 0 rgba(0, 0, 0, 0.3)' : '0px'}">
					<div class="box-head" *ngIf="bool_data_showHeader" [ngStyle]="{
						'background-color': style_headerColor,
						'border-top-left-radius.px': data_borderRadius,
						'border-top-right-radius.px': data_borderRadius
					}"><p>{{data_headline}}</p></div>
					<div class="box-content" [ngStyle]="{
						'background-color': style_backgroundColor,
						'border-bottom-left-radius.px': data_borderRadius,
						'border-bottom-right-radius.px': data_borderRadius,
						'border-top-left-radius.px' : (bool_data_showHeader ? 0 : data_borderRadius),
						'border-top-right-radius.px' : (bool_data_showHeader ? 0 : data_borderRadius),
						'height' : (bool_data_showHeader ? 'calc(100% - 30px)' : '100%'),
						'top.px' : (bool_data_showHeader ? 30 : 0)
					}"></div>
				</div>
			</fhem-container>
		</div>
	`,
	styles: [`
		.box{
			position: absolute;
    		width: 60px;
    		height: 60px;
		}
		.box-container{
			width: 100%;
			height: 100%;
			position: absolute;
			overflow: hidden;
		}
		.box-head{
			width: 100%;
			height: 35px;
			position: absolute;
			top: 0;
			left: 0;
		}
		.box-head p{
			left: 50%;
			position: absolute;
			top: 50%;
			margin: 0;
			font-weight: 600;
			transform: translate(-50%, -50%);
			margin-top: -3px;
		}
		.box-content{
			width: 100%;
			position: absolute;
		}
		.dark p{
			color: var(--dark-p);
		}
	`]
})
export class BoxComponent {
	// Component ID
	@Input() ID: number;

	@Input() data_headline: string;
	@Input() data_borderRadius: string;
	@Input() bool_data_showShadow: boolean;
	@Input() bool_data_showHeader: boolean;

	// Styling
	@Input() style_headerColor: string;
	@Input() style_backgroundColor: string;

	// position information
	@Input() width: string;
	@Input() height: string;
	@Input() top: string;
	@Input() left: string;
	@Input() zIndex: number;

	// Popup information
	@Input() inPopup = false;

	constructor(public settings: SettingsService) {}


	static getSettings() {
		return {
			name: 'Box',
			component: 'BoxComponent',
			type: 'style',
			inputs: [
				{variable: 'data_headline', default: ''},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'style_headerColor', default: '#434E5D'},
				{variable: 'style_backgroundColor', default: '#58677C'},
				{variable: 'bool_data_showHeader', default: true},
				{variable: 'bool_data_showShadow', default: true}
			],
			dimensions: {minX: 60, minY: 60}
		};
	}
}
