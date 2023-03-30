import { ComponentSettings } from "@fhem-native/types/components";

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
		}
	}
};