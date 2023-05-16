import { ComponentSettings } from "@fhem-native/types/components";
import { componentPositionStyles, componentTextStyles } from "./common";

/*
	HTML component
*/
export const Settings: ComponentSettings = {
	name: 'Html',
	type: 'fhem',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
			reading: {type: 'string', value: 'state'},
			rawHtml: {type: 'string', value: ''}
		},
		arr_data: {
			textStyle: {items: componentTextStyles, value: 'normal'},
			textAlign: {items: componentPositionStyles, value: 'left'}
		},
		style: {
			textColor: '#86d993'
		},
		bool: {
			customTextProperties: false
		}
	},
	dependencies: {
		'style.textColor': {dependOn: ['bool.customTextProperties'], value: [true]},
		'arr_data.textStyle': {dependOn: ['bool.customTextProperties'], value: [true]},
		'arr_data.textAlign': {dependOn: ['bool.customTextProperties'], value: [true]},
	}
};