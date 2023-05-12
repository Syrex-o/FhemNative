import { ComponentSettings } from "@fhem-native/types/components";

/*
    Timepicker component
*/
export const Settings: ComponentSettings = {
    name: 'Time Picker',
	type: 'fhem',
	dimensions: {minX: 100, minY: 40},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},

            label: {type: 'string', value: ''},
            info: {type: 'string', value: ''},
            confirmBtn: {type: 'string', value: 'Bestätigen'},
            cancelBtn: {type: 'string', value: 'Abbrechen'},

            maxHours: {type: 'number', value: 24},
            maxMinutes: {type: 'number', value: 60}
		},
        style: {
            labelColor: '#f7f8fa',
			infoColor: '#a9aaab',
            timeColor: '#f7f8fa'
        },
        bool: {
            customLabels: false,
            customLabelColors: false
        }
	},
    dependencies: {
        'data.label': {dependOn: ['bool.customLabels'], value: [true]},
        'data.info': {dependOn: ['bool.customLabels'], value: [true]},

        'style.labelColor': {dependOn: ['bool.customLabelColors'], value: [true]},
        'style.timeColor': {dependOn: ['bool.customLabelColors'], value: [true]},
        'style.infoColor': {dependOn: ['bool.customLabelColors', 'bool.customLabels'], value: [true, true]}
    }
};