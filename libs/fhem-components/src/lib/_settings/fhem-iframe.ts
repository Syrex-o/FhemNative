import { ComponentSettings } from "@fhem-native/types/components";

/*
    Iframe component
*/
export const Settings: ComponentSettings = {
    name: 'IFrame',
	type: 'style',
	dimensions: {minX: 100, minY: 100},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            url: {type: 'string', value: ''}
		},
        bool: {
            showBorder: true,
        }
	}
};