import { ComponentSettings } from "@fhem-native/types/components";

/*
    Table component
*/
export const Settings: ComponentSettings = {
    name: 'Table',
	type: 'fhem',
	dimensions: {minX: 100, minY: 50},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            readingValues: {type: 'string', value: 'state'},
            headerValues: {type: 'string', value: 'Reading,Value,Time'},
		},
        bool: {
            showAllReadings: true,
            showReading: true,
            showValue: true,
            showTime: false
        }
	},
    dependencies: {
        'data.readingValues': {dependOn: ['bool.showAllReadings'], value: [false]},
    }
};