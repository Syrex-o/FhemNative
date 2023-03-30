import { ComponentSettings } from "@fhem-native/types/components";

/*
    Select component
*/
export const Settings: ComponentSettings = {
    name: 'Select',
	type: 'fhem',
	dimensions: {minX: 80, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},

            options: {type: 'string', value: ''},
            seperator: {type: 'string', value: ','},

            items: {type: 'string', value: ''},
            alias: {type: 'string', value: ''},
            placehoder: {type: 'string', value: ''}
		},
        style: {
            selectColor: '#232524',
            selectActiveColor: '#191816',
            labelColor: '#f7fbfa',
            iconColor: '#f7fbfa'
		},
	}
};