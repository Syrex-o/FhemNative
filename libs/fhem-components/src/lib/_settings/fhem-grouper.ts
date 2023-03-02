import { ComponentSettings } from "@fhem-native/types/components";

/*
    Group component
*/
export const Settings: ComponentSettings = {
    name: 'Grouper',
	type: 'container',
	dimensions: {minX: 150, minY: 150},
	inputs: {
		data: {
			info: {type: 'string', value: ''}
		}
	}
};