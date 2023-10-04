import { Component, ViewEncapsulation } from "@angular/core";
import { RightsImprintComponent } from "@fhem-native/pages";

@Component({
    standalone: true,
	selector: 'fhem-native-website-rights-imprint',
	template: `<fhem-native-rights-imprint/>`,
    styleUrls: ['./rights-styles.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [RightsImprintComponent]
})
export class ImprintPageComponent {}