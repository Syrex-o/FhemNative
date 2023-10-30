import { ComponentSettings } from "@fhem-native/types/components";
import { componentPositionStyles, componentTextStyles} from './common';

/*
    Label component
*/
export const Settings: ComponentSettings = {
    name: 'Label',
	type: 'fhem',
	dimensions: {minX: 60, minY: 40},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
			reading: {type: 'string', value: ''},
			label: {type: 'string', value: ''},
            items: {type: 'string', value: ''},
            alias: {type: 'string', value: ''},
            labelExtension: {type: 'string', value: ''},

			size: {type: 'number', value: 16},
			rotation: {type: 'number', value: 0},
			min: {type: 'number', value: 0},
			max: {type: 'number', value: 100},
		},
		arr_data: {
			textStyle: {items: componentTextStyles, value: 'normal'},
			textAlign: {items: componentPositionStyles, value: 'left'}
		},
		style: {
			color: '#86d993',
			minColor: '#02adea',
            maxColor: '#fb0a2a'
		},
		bool: {
			useAlias: false,
			useMinMax: false
		}
	},
	dependencies: {
		'data.items': {dependOn: ['bool.useAlias'], value: [true]},
        'data.alias': {dependOn: ['bool.useAlias'], value: [true]},

		'data.min': {dependOn: ['bool.useMinMax'], value: [true]},
		'data.max': {dependOn: ['bool.useMinMax'], value: [true]},
		'style.minColor': {dependOn: ['bool.useMinMax'], value: [true]},
		'style.maxColor': {dependOn: ['bool.useMinMax'], value: [true]},
	}
};