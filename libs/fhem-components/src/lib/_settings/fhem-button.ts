import { ComponentSettings } from "@fhem-native/types/components";

/*
    Button component
*/
export const Settings: ComponentSettings = {
    name: 'Button',
	type: 'fhem',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            sendCommand: {type: 'string', value: ''},

            label: {type: 'string', value: ''},

            getOn: {type: 'string', value: 'on'},
            getOff: {type: 'string', value: 'off'},
            setOn: {type: 'string', value: 'on'},
            setOff: {type: 'string', value: 'off'},

            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},

            iconSize: {type: 'number', value: 20}
		},
        icon: {
            iconOn: 'checkmark-circle',
            iconOff: 'close-circle',
        },
        style: {
			iconColorOn: '#86d993 ',
			iconColorOff: '#fb0a2a',
            buttonColor: '#58677C',
            labelColor: '#fff'
		},
        bool: {
            iconOnly: false,
            customBorder: false
        }
	},
    dependencies: {
        'data.label': {dependOn: ['bool.iconOnly'], value: [false]},
        'data.iconSize': {dependOn: ['bool.iconOnly'], value: [false]},
        // custom border
		'data.borderRadius': {dependOn: ['bool.customBorder'], value: [false]},
		'data.borderRadiusTopLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusTopRight': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomRight': {dependOn: ['bool.customBorder'], value: [true]},
    }
};