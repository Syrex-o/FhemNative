import { AppConfig, DesktopVersionCode } from "@fhem-native/app-config";

export const environment: AppConfig = {
	production: true,
	platform: 'desktop',
	versionCode: DesktopVersionCode,
	store: {
        testMode: false,
		debugMode: false
    }
};
