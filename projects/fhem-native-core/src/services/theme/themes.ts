// Global App Theming

export interface Theme {
  	name: string;
  	properties: {[key: string]: string};
}

export const dark: Theme = {
	name: 'dark',
	properties: {
		'--primary': '#212121',
		'--primary-op': '#21212199',

		'--secondary': '#303030',
		'--secondary-op': '#30303080',

		'--text': '#fff',
		'--des': '#ffffffb3',
		'--des-op': 'rgb(255 255 255 / 20%)',

		'--shadow-one': '0px 4px 10px 0px rgba(0,0,0,0.3)',

		'--active': 'rgb(20, 169, 213)',

		'--neumorph-in': '0px 0px 0px 0px rgba(23,23,23,.801), 0px 0px 0px 0px rgba(40,40,40,.801), inset 6px 6px 16px 0px rgba(23,23,23,.801), inset -6px -6px 16px 0px rgba(40,40,40,.801)',
		'--neumorph-out': '6px 6px 16px 0px rgba(23,23,23,.801), -6px -6px 16px 0px rgba(40,40,40,.801), inset 0px 0px 0px 0px rgba(23,23,23,.801), inset 0px 0px 0px 0px rgba(40,40,40,.801)',
		'--neumorph-border': '1px solid rgba(40,40,40,.801)',
		'--neumorph-small-out': '2px 2px 6px 0px rgba(23,23,23,.801), -2px -2px 6px 0px rgba(40,40,40,.801), inset 0px 0px 0px 0px rgba(23,23,23,.801), inset 0px 0px 0px 0px rgba(40,40,40,.801)'
	}
};

export const darkAlter: Theme = {
	name: 'dark-alternative',
	properties: {
		'--primary': 'rgb(56, 56, 56)',
		'--primary-op': 'rgba(56, 56, 56, 0.6)',

		'--secondary': 'rgb(47, 47, 47)',
		'--secondary-op': '#30303080',

		'--text': '#fff',
		'--des': '#ffffffb3',
		'--des-op': 'rgb(255 255 255 / 20%)',

		'--shadow-one': '0px 4px 10px 0px rgba(0,0,0,0.3)',

		'--active': 'rgb(20, 169, 213)',

		'--neumorph-in': '0px 0px 0px 0px rgba(40, 40, 41, 0.801), 0px 0px 0px 0px rgba(65, 65, 65, 0.801), inset 6px 6px 16px 0px rgba(40, 40, 41, 0.801), inset -6px -6px 16px 0px rgba(65, 65, 65, 0.801)',
		'--neumorph-out': '6px 6px 16px 0px rgba(40, 40, 41, 0.801), -6px -6px 16px 0px rgba(65, 65, 65, 0.801), inset 0px 0px 0px 0px rgba(40, 40, 41, 0.801), inset 0px 0px 0px 0px rgba(65, 65, 65, 0.801)',
		'--neumorph-border': '1px solid rgba(65, 65, 65, 0.801)',
		'--neumorph-small-out': '2px 2px 6px 0px rgba(40, 40, 41, 0.801), -2px -2px 6px 0px rgba(65, 65, 65, 0.801), inset 0px 0px 0px 0px rgba(40, 40, 41, 0.801), inset 0px 0px 0px 0px rgba(65, 65, 65, 0.801)'
	}
};

export const bright: Theme = {
	name: 'bright',
	properties: {
		'--primary': '#ffffff',
		'--primary-op': '#efefef99',

		'--secondary': '#efefef',
		'--secondary-op': '#efefef99',

		'--text': '#000',
		'--des': '#000000b3',
		'--des-op': 'rgb(0 0 0 / 20%)',

		'--shadow-one': '0px 4px 10px 0px rgba(0,0,0,0.3)',

		'--active': 'rgb(20, 169, 213)',

		'--neumorph-in': '0px 0px 0px 0px #dde4ef, 0px 0px 0px 0px #fff, inset 6px 6px 16px 0px #dde4ef, inset -6px -6px 16px 0px #fff',
		'--neumorph-out': '6px 6px 16px 0px #dde4ef, -6px -6px 16px 0px #fff, inset 0px 0px 0px 0px #dde4ef, inset 0px 0px 0px 0px #fff',
		'--neumorph-border': '1px solid #fff',
		'--neumorph-small-out': '2px 2px 6px 0px #dde4ef, -2px -2px 6px 0px #fff, inset 0px 0px 0px 0px #dde4ef, inset 0px 0px 0px 0px #fff'
	}
};