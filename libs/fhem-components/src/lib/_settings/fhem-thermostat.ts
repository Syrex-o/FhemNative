import { ComponentSettings } from "@fhem-native/types/components";

/*
    Thermostat component
*/
export const Settings: ComponentSettings = {
    name: 'Thermostat',
	type: 'fhem',
	dimensions: {minX: 120, minY: 120},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            setReading: {type: 'string', value: ''},
            displayReading: {type: 'string', value: ''},

            threshold: {type: 'number', value: 20},
            labelExtension: {type: 'string', value: '\xB0C'},

            steps: {type: 'number', value: 1},
            min: {type: 'number', value: 0},
            max: {type: 'number', value: 100}
		},
        arr_data: {
            sliderType: {items: ['thermostat', 'tick'], value: 'thermostat'}
        },
        style: {
            backgroundColor: '#272727',
            tickColor: '#fff',

            tickGradientColor1: '#d3d3d3',
            tickGradientColor2: '#2d3436',

            heatingColor: '#ef6805',
            coolingColor: '#0047bb',

            labelColor: '#fff',
            
            gradientColor1: '#FF0909',
            gradientColor2: '#F3481A',
            gradientColor3: '#FABA2C',
            gradientColor4: '#00BCF2',
		},
        bool: {
            updateOnMove: false,
            enableAnimation: true
        }
	},
    dependencies: {
        'data.threshold': {dependOn: ['bool.updateOnMove'], value: [true]},
        // Thermostat
        'bool.enableAnimation': {dependOn: ['arr_data.sliderType'], value: ['thermostat']},
        'style.gradientColor1': {dependOn: ['arr_data.sliderType'], value: ['thermostat']},
        'style.gradientColor2': {dependOn: ['arr_data.sliderType'], value: ['thermostat']},
        'style.gradientColor3': {dependOn: ['arr_data.sliderType'], value: ['thermostat']},
        'style.gradientColor4': {dependOn: ['arr_data.sliderType'], value: ['thermostat']},
        // Tick
        'style.backgroundColor': {dependOn: ['arr_data.sliderType'], value: ['tick']},
        'style.tickColor': {dependOn: ['arr_data.sliderType'], value: ['tick']},
        'style.labelColor': {dependOn: ['arr_data.sliderType'], value: ['tick']},
        'style.tickGradientColor1': {dependOn: ['arr_data.sliderType'], value: ['tick']},
        'style.tickGradientColor2': {dependOn: ['arr_data.sliderType'], value: ['tick']},
    }
};