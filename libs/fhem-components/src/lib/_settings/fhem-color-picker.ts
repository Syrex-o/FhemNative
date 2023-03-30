import { ComponentSettings } from "@fhem-native/types/components";

/*
    Color Picker component
*/
export const Settings: ComponentSettings = {
    name: 'Color Picker',
	type: 'fhem',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            threshold: {type: 'number', value: 20},

            headline: {type: 'string', value: ''},
            popupWidth: {type: 'number', value: 80},
            popupHeight: {type: 'number', value: 80},

            borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
		},
		arr_data: {
			colorInput: {items: ['hex', '#hex', 'rgb'], value: 'hex'},
			colorOutput: {items: ['hex', '#hex', 'rgb'], value: 'hex'}
		},
		bool: {
			usePopup: false,
			showFavMenu: true,
			customBorder: false,
			updateOnMove: false
		}
	},
	dependencies: {
        'data.threshold': {dependOn: ['bool.updateOnMove'], value: [true]},
		// custom border
		'data.borderRadius': {dependOn: ['bool.customBorder', 'bool.usePopup'], value: [false, true]},
		'data.borderRadiusTopLeft': {dependOn: ['bool.customBorder', 'bool.usePopup'], value: [true, true]},
		'data.borderRadiusTopRight': {dependOn: ['bool.customBorder', 'bool.usePopup'], value: [true, true]},
		'data.borderRadiusBottomLeft': {dependOn: ['bool.customBorder', 'bool.usePopup'], value: [true, true]},
		'data.borderRadiusBottomRight': {dependOn: ['bool.customBorder', 'bool.usePopup'], value: [true, true]},
		// popup
		'data.headline': {dependOn: ['bool.usePopup'], value: [true]},
        'data.popupWidth': {dependOn: ['bool.usePopup'], value: [true]},
        'data.popupHeight': {dependOn: ['bool.usePopup'], value: [true]},
        'bool.customBorder': {dependOn: ['bool.usePopup'], value: [true]},
	}
};