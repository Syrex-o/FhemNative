import { ComponentSettings } from "@fhem-native/types/components";

/*
    Circle Menu component
*/
export const Settings: ComponentSettings = {
    name: 'Circle Menu',
	type: 'fhem',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            values: {type: 'string', value: ''},

            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
		},
        arr_data: {
            expandStyle: {items: ['top', 'left', 'bottom', 'right', 'circle'], value: 'top'},
        },
        arr_icon: {
            icons: ['add-circle', 'close-circle'],
        },
        arr_style: {
            iconColors: ['#2ec6ff', '#272727'],
        },
        icon: {
            icon: 'checkmark-circle',
        },
        style: {
			iconColorOn: '#86d993 ',
			iconColorOff: '#fb0a2a',
            buttonColor: '#58677C',
            labelColor: '#fff',
            activeColor: '#02adea'
		},
        bool: {
            useIcons: false,
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

        'arr_icon.icons': {dependOn: ['bool.useIcons'], value: [true]},
        'arr_style.iconColors': {dependOn: ['bool.useIcons'], value: [true]},
    }
};