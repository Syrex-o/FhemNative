import { ComponentSettings } from "@fhem-native/types/components";

/*
    Tabs Container component
*/
export const Settings: ComponentSettings = {
    name: 'Tabs',
	type: 'container',
	dimensions: {minX: 100, minY: 100},
	inputs: {
		data: {
			containerPages: {type: 'number', value: 3},
            
            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
		},
		arr_data: {
			tabPosition: {items: ['top', 'right', 'bottom', 'left'], value: 'top'},
		},
        arr_icon: {
            icons: ['add-circle', 'close-circle']
        },
        style: {
            activeTabColor: '#14a9d5'
        },
        arr_style: {
            iconColors: ['#2ec6ff', '#2ec6ff'],
            headerColors: ['#434E5D', '#434E5D'],
            backgroundColors: ['#58677C', '#58677C']
        },
		bool: {
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