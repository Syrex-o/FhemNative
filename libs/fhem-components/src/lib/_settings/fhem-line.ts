import { ComponentSettings } from "@fhem-native/types/components";

/*
    Line component
*/
export const Settings: ComponentSettings = {
    name: 'Line',
	type: 'style',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			height: {type: 'number', value: 2},
			rotation: {type: 'number', value: 0},
			curvePercentage: {type: 'number', value: 0}
		},
		arr_data: {
			orientation: {items: ['vertical', 'horizontal'], value: 'vertical'}
		},
		style: {
			color: '#86d993'
		}
	}
};