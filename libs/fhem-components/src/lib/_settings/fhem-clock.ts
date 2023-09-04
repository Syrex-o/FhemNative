import { ComponentSettings } from "@fhem-native/types/components";

/*
    Clock component
*/
export const Settings: ComponentSettings = {
    name: 'Clock',
	type: 'style',
	dimensions: {minX: 60, minY: 60},
	inputs: {
		data: {
			info: {type: 'string', value: ''}
		},
		arr_data: {
			style: {items: ['digital', 'analog'], value: 'digital'},
			digitalStyle: {items: ['standard', 'alarm'], value: 'standard'},
			format: {items: ['HH:mm:ss', 'HH:mm'], value: 'HH:mm:ss'}
		},
		style: {
			color: '#14a9d5',
			hourColor: '#14a9d5',
            minuteColor: '#14a9d5',
            secondColor: '#d62121'
		},
		bool: {
			showTicks: true
		}
	},
	dependencies: {
		'bool.showTicks': {dependOn: ['arr_data.style'], value: ['analog']},
		'arr_data.digitalStyle': {dependOn: ['arr_data.style'], value: ['digital']}
	}
};