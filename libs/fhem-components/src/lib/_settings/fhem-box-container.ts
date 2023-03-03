import { ComponentSettings } from "@fhem-native/types/components";
import { componentPositionStyles, componentTextStyles} from './common';

/*
    Box Container component
*/
export const Settings: ComponentSettings = {
    name: 'Box Container',
	type: 'container',
	dimensions: {minX: 150, minY: 150},
	inputs: {
		data: {
			headline: {type: 'string', value: ''},
			borderRadius: {type: 'number', value: 5},
			borderRadiusTopLeft: {type: 'number', value: 5},
			borderRadiusTopRight: {type: 'number', value: 5},
			borderRadiusBottomLeft: {type: 'number', value: 5},
			borderRadiusBottomRight: {type: 'number', value: 5},
			notchDefinition: {type: 'string', value: '0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%'}
		},
		arr_data: {
			headerStyle: {items: componentTextStyles, value: 'normal'},
			headerPosition: {items: componentPositionStyles, value: 'left'}
		},
		style: {
			headerColor: '#434E5D',
			backgroundColor: '#58677C'
		},
		bool: {
			showHeader: true,
			showShadow: true,
			customBorder: false,
			customNotch: false
		}
	},
	dependencies: {
		// custom border
		'data.borderRadius': {dependOn: ['bool.customBorder'], value: [false]},
		'data.borderRadiusTopLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusTopRight': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomLeft': {dependOn: ['bool.customBorder'], value: [true]},
		'data.borderRadiusBottomRight': {dependOn: ['bool.customBorder'], value: [true]},
		// custom notch
		'data.notchDefinition': {dependOn: ['bool.customNotch'], value: [true]},
		// header options
		'arr_data.headerStyle': {dependOn: ['bool.showHeader'], value: [true]},
		'arr_data.headerPosition': {dependOn: ['bool.showHeader'], value: [true]},
		// styles
		'style.headerColor': {dependOn: ['bool.showHeader'], value: ['standard', true]},
	}
};