import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'de.fhemnative.app',
	appName: 'FhemNative',
	webDir: '../../dist/FhemNativeMobile',
	bundledWebRuntime: false,
	plugins: {
		SplashScreen: {
			launchAutoHide: false,
			splashImmersive: false,
			splashFullScreen: false,
			backgroundColor: '#383d44',
			androidScaleType: 'CENTER_CROP'
		}
	},
	android: {
		allowMixedContent: true
	}
};

export default config;
