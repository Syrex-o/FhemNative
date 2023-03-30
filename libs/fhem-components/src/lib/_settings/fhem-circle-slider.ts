import { ComponentSettings } from "@fhem-native/types/components";

/*
    Circle Slider component
*/
export const Settings: ComponentSettings = {
    name: 'Circle Slider',
	type: 'fhem',
	dimensions: {minX: 160, minY: 160},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            threshold: {type: 'number', value: 20},

            label: {type: 'string', value: ''},
            labelExtension: {type: 'string', value: ''},
            textSize: {type: 'number', value: 40},
            labelTopPos: {type: 'number', value: 50},
            labelLeftPos: {type: 'number', value: 50},

            bottomAngle: {type: 'number', value: 90},
            arcThickness: {type: 'number', value: 18},
            thumbRadius: {type: 'number', value: 16},
            thumbBorder: {type: 'number', value: 3},

            step: {type: 'number', value: 0.1},
            min: {type: 'number', value: 0},
            max: {type: 'number', value: 100}
		},
        style: {
			backgroundColor: '#272727 ',
			circleBackgroundColor: '#272727',
            thumbColor: '#fbfbfb',
            labelColor: '#fbfbfb',
		},
        arr_style_grad: {
            fillColors: ['#2ec6ff', '#272727'],
        },
        bool: {
            updateOnMove: false,
            customLabelPosition: false
        }
	},
    dependencies: {
		'data.threshold': {dependOn: ['bool.updateOnMove'], value: [true]},

		'data.labelTopPos': {dependOn: ['bool.customLabelPosition'], value: [true]},
        'data.labelLeftPos': {dependOn: ['bool.customLabelPosition'], value: [true]}
    }
};