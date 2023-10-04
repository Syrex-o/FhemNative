import { ComponentSettings } from "@fhem-native/types/components";

/*
	Weather component
*/
export const Settings: ComponentSettings = {
	name: 'Weather',
	type: 'fhem',
	dimensions: {minX: 100, minY: 100},
	inputs: {
		data: {
			device: {type: 'string', value: ''}
		},
		arr_data: {
			fhemModule: {items: ['Proplanta'], value: 'Proplanta'},
			displayType: {items: ['details', 'cards', 'only-temp', 'only-rain', 'only-wind'], value: 'details'}
		}
	}
};