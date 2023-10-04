import { Component, ViewEncapsulation } from "@angular/core";
import { RightsPrivacyComponent } from "@fhem-native/pages";

@Component({
    standalone: true,
	selector: 'fhem-native-website-rights-privacy',
	template: `<fhem-native-rights-privacy/>`,
    styleUrls: ['./rights-styles.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [RightsPrivacyComponent]
})
export class PrivacyPageComponent {}