import { Component, ViewEncapsulation } from "@angular/core";
import { RightsUsageComponent } from "@fhem-native/pages";

@Component({
    standalone: true,
	selector: 'fhem-native-website-rights-usage',
	template: `<fhem-native-rights-usage/>`,
    styleUrls: ['./rights-styles.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [RightsUsageComponent]
})
export class UsagePageComponent {}