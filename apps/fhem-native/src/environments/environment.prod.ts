import { AppConfig, MobileVersionCode } from "@fhem-native/app-config";

export const environment: AppConfig = {
	production: true,
	platform: 'mobile',
	versionCode: MobileVersionCode,
	store: {
        testMode: false,
		debugMode: false
    }
};
