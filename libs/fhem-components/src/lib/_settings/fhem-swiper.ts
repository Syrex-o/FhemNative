import { ComponentSettings } from "@fhem-native/types/components";
import { componentPositionStyles, componentTextStyles} from './common';

/*
    Box component
*/
export const Settings: ComponentSettings = {
    name: 'Swiper',
	type: 'container',
	dimensions: {minX: 150, minY: 150},
	inputs: {
		data: {
			headline: {type: 'string', value: ''},
			borderRadius: {type: 'number', value: 5},
			containerPages: {type: 'number', value: 3}
		},
		arr_data: {
			headerStyle: {items: componentTextStyles, value: 'normal'},
			headerPosition: {items: componentPositionStyles, value: 'left'},
			orientation: {items: ['horizontal', 'vertical'], value: 'horizontal'},
		},
		style: {
			headerColor: '#434E5D',
			backgroundColor: '#58677C',
			pagerOnColor: '#3880ff',
			pagerOffColor: '#cccccc',
		},
		bool: {
			showPager: true,
			showHeader: true
		}
	},
	dependencies: {
		// header options
		'arr_data.headerColor': {dependOn: ['bool.showHeader'], value: [true]},
		'arr_data.headerStyle': {dependOn: ['bool.showHeader'], value: [true]},
		'arr_data.headerPosition': {dependOn: ['bool.showHeader'], value: [true]},
		// styles
		'style.pagerOnColor': {dependOn: ['bool.showPager'], value: [true]},
		'style.pagerOffColor': {dependOn: ['bool.showPager'], value: [true]},
		'style.headerColor': {dependOn: ['bool.showHeader'], value: [true]}
	}
};