import { ComponentSettings } from "@fhem-native/types/components";

/*
    Slider component
*/
export const Settings: ComponentSettings = {
    name: 'Slider',
	type: 'fhem',
	dimensions: {minX: 150, minY: 30},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            threshold: {type: 'number', value: 20},

            labelExtension: {type: 'string', value: ''},

            steps: {type: 'number', value: 1},
            min: {type: 'number', value: 0},
            max: {type: 'number', value: 100},

            sliderHeight: {type: 'number', value: 5},
            thumbWidth: {type: 'number', value: 25},
            thumbHeight: {type: 'number', value: 25},
		},
        arr_data: {
            sliderType: {items: ['slider', 'box', 'ios-slider'], value: 'slider'},
            orientation: {items: ['horizontal', 'vertical'], value: 'horizontal'},
        },
        icon: {
            sliderIcon: 'lightbulb'
        },
        style: {
            backgroundColor: '#303030',
            boxBackgroundColor: '#272727',
            thumbColor: '#ddd',
            thumbValueColor: '#ddd',
            fillColor: '#14a9d5',
            iconColor: '#ddd',

            buttonColor: '#0d0d0c'
		},
        bool: {
            updateOnMove: false,
            showPin: true,
            showValueInThumb: false
        }
	},
    dependencies: {
        'data.threshold': {dependOn: ['bool.updateOnMove'], value: [true]},

        'data.sliderHeight': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
        'data.thumbWidth': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
        'data.thumbHeight': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
        'data.labelExtension': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},

        'style.thumbColor': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
        'style.thumbValueColor': {dependOn: ['bool.showValueInThumb', 'arr_data.sliderType'], value: [true, ['slider', 'box']]},

        'style.buttonColor': {dependOn: ['arr_data.sliderType'], value: ['box']},
        'style.boxBackgroundColor': {dependOn: ['arr_data.sliderType'], value: ['box']},

        'icon.sliderIcon': {dependOn: ['arr_data.sliderType'], value: ['ios-slider']},
        'style.iconColor': {dependOn: ['arr_data.sliderType'], value: [ ['ios-slider', 'box'] ]},

        'bool.showPin': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
        'bool.showValueInThumb': {dependOn: ['arr_data.sliderType'], value: [['slider', 'box']]},
    }
};