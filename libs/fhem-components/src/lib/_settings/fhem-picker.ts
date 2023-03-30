import { ComponentSettings } from "@fhem-native/types/components";

/*
    Picker Container component
*/
export const Settings: ComponentSettings = {
    name: 'Picker',
	type: 'container',
	dimensions: {minX: 40, minY: 40},
	inputs: {
		data: {
            device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            getOn: {type: 'string', value: ''},
            getOff: {type: 'string', value: ''},

			headline: {type: 'string', value: ''},
			height: {type: 'number', value: 80},

            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
		},
		icon: {
            iconOn: 'add-circle',
            iconOff: 'add-circle',
        },
		style: {
			iconColorOn: '#86d993',
			iconColorOff: '#86d993',
			backgroundColorOn: '#303030',
			backgroundColorOff: '#303030',
		},
		bool: {
			openOnReading: false,
            customBorder: false
		}
	},
    dependencies: {
        // custom border
		'data.borderRadius': {dependOn: ['bool.customBorder'], value: [false]},
		'data.borderRadiusTopLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusTopRight': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomRight': {dependOn: ['bool.customBorder'], value: [true]},
    }
};