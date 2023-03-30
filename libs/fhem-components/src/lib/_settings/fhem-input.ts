import { ComponentSettings } from "@fhem-native/types/components";

/*
    Input component
*/
export const Settings: ComponentSettings = {
    name: 'Input',
	type: 'fhem',
	dimensions: {minX: 120, minY: 35},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            setReading: {type: 'string', value: ''},
            
            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
		},
        icon: {
            sendIcon: 'paper-plane',
        },
        style: {
			backgroundColor: '#b0b0b0 ',
			textColor: '#fff',
            iconColor: '#fff',
            borderColor: '#565656',
            buttonColor: '#14a9d5'
		},
        bool: {
            customBorder: false,
            showFavorites: false,
        },
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