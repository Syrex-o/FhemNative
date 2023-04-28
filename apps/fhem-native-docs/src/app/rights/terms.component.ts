import { Component, ViewEncapsulation } from "@angular/core";
import { RightsTermsComponent } from "@fhem-native/pages";

@Component({
    standalone: true,
	selector: 'fhem-native-website-rights-terms',
	template: `<fhem-native-rights-terms/>`,
    styleUrls: ['./rights-styles.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [RightsTermsComponent]
})
export class TermsPageComponent {
    
}