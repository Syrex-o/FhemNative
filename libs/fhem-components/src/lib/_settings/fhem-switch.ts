import { ComponentSettings } from "@fhem-native/types/components";

/*
    Switch component
*/
export const Settings: ComponentSettings = {
    name: 'Switch',
	type: 'fhem',
	dimensions: {minX: 100, minY: 45},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},

            getOn: {type: 'string', value: 'on'},
            getOff: {type: 'string', value: 'off'},
            setOn: {type: 'string', value: 'on'},
            setOff: {type: 'string', value: 'off'},

            label: {type: 'string', value: ''},
            info: {type: 'string', value: ''}
		},
        arr_data: {
			style: {items: ['toggle', 'toggle-outline'], value: 'toggle-outline'}
		},
        style: {
            labelColor: '#f7f8fa ',
			infoColor: '#a9aaab',
			backgroundColorOn: '#2994b3 ',
			backgroundColorOff: '#a2a4ab',
            knobColorOn: '#14a9d5',
            knobColorOff: '#fff'
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
        'style.infoColor': {dependOn: ['bool.customLabelColors'], value: [true]}
    }
};