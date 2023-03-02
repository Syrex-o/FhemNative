import { ComponentSettings } from "@fhem-native/types/components";
import { componentPositionStyles, componentStyleVariations, componentTextStyles} from './common';

/*
    Box component
*/
export const Settings: ComponentSettings = {
    name: 'Box',
	type: 'style',
	dimensions: {minX: 60, minY: 60},
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
			style: {items: componentStyleVariations, value: 'standard'},
			headerStyle: {items: componentTextStyles, value: 'normal'},
			headerPosition: {items: componentPositionStyles, value: 'left'}
		},
		style: {
			headerColor: '#434E5D',
			backgroundColor: '#58677C'
		},
		arr_style_grad: {
			gradientBackgroundColor: ['#2ec6ff', '#272727']
		},
		bool: {
			showHeader: true,
			showShadow: true,
			customBorder: false,
			customNotch: false,
			gradientBackground: false
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
		'bool.showShadow': {dependOn: ['arr_data.style'], value: ['standard']},
		'style.headerColor': {dependOn: ['arr_data.style', 'bool.showHeader'], value: ['standard', true]},
		'style.backgroundColor': {dependOn: ['arr_data.style', 'bool.gradientBackground'], value: ['standard', false]},
		
		'arr_style_grad.gradientBackgroundColor': {dependOn: ['bool.gradientBackground'], value: [true]},
	}
};