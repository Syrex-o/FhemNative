import { ComponentSettings } from "@fhem-native/types/components";

/*
    Room Button
*/
export const Settings: ComponentSettings = {
    name: 'Button Menu',
	type: 'style',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
            room: {type: 'string', value: ''},
            label: {type: 'string', value: ''},

            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},

            iconSize: {type: 'number', value: 20}
		},
        icon: {
            icon: 'checkmark-circle',
        },
        style: {
			iconColor: '#86d993 ',
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