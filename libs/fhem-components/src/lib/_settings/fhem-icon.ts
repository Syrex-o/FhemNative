import { ComponentSettings } from "@fhem-native/types/components";

/*
    Icon component
*/
export const Settings: ComponentSettings = {
    name: 'Icon',
	type: 'style',
	dimensions: {minX: 30, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            indicatorReading: {type: 'string', value: ''},

            getOn: {type: 'string', value: 'on'},
            getOff: {type: 'string', value: 'off'},

            min: {type: 'string', value: ''},
            max: {type: 'string', value: ''}
		},
        arr_data: {
            indicatorPosition: {items: ['top-right', 'top-left', 'bottom-right', 'bottom-left'], value: 'top-right'},
        },
        icon: {
            iconOn: 'add-circle',
            iconOff: 'add-circle',
        },
        style: {
			iconColorOn: '#86d993 ',
			iconColorOff: '#fb0a2a',
            indicatorColor: '#86d993',
            indicatorBackgroundColor: '#58677c',

            minColor: '#02adea',
            maxColor: '#fb0a2a'
		},
        bool: {
            showIndicator: false,
        }
	},
    dependencies: {
        'data.indicatorReading': {dependOn: ['bool.showIndicator'], value: [true]},
        'arr_data.indicatorPosition': {dependOn: ['bool.showIndicator'], value: [true]},
        'style.indicatorColor': {dependOn: ['bool.showIndicator'], value: [true]},
        'style.indicatorBackgroundColor': {dependOn: ['bool.showIndicator'], value: [true]},
    }
};