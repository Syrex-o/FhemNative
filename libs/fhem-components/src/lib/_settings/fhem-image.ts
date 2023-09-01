import { ComponentSettings } from "@fhem-native/types/components";

/*
    Image component
*/
export const Settings: ComponentSettings = {
    name: 'Image',
	type: 'style',
	dimensions: {minX: 40, minY: 40},
	inputs: {
		data: {
			device: {type: 'string', value: ''},
            reading: {type: 'string', value: 'state'},
            url: {type: 'string', value: ''},
            imageUrl: {type: 'string', value: ''},
            updateInterval: {type: 'number', value: 1000},
		},
        arr_data: {
            defaultImage: {items: ['default-music.png', 'default-image.png'], value: 'default-music.png'},
        },
        bool: {
            useCache: true,
            useLocalImage: false,
        }
	},
    dependencies: {
        'data.updateInterval': {dependOn: ['bool.useCache', 'bool.useLocalImage'], value: [false, false]},

        // local image
        'data.device': {dependOn: ['bool.useLocalImage'], value: [false]},
        'data.reading': {dependOn: ['bool.useLocalImage'], value: [false]},
        'data.url': {dependOn: ['bool.useLocalImage'], value: [false]},
        'bool.useCache': {dependOn: ['bool.useLocalImage'], value: [false]},
        'arr_data.defaultImage': {dependOn: ['bool.useLocalImage'], value: [false]},

        // fully hide this setting
        'data.imageUrl': {dependOn: ['bool.useLocalImage', 'bool.useLocalImage'], value: [true, false]}
    }
};