import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'de.slapapps.fhemnative',
	appName: 'FhemNative',
	webDir: '../../dist/apps/fhem-native',
	bundledWebRuntime: false,
	plugins: {
		SplashScreen: {
			launchAutoHide: false,
			splashImmersive: false,
			splashFullScreen: false,
			backgroundColor: '#f9fafe',
			androidScaleType: 'CENTER_CROP'
		}
	},
};

export default config;
