import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
	selector: 'fhem-native-rights-terms',
	templateUrl: 'terms.component.html',
	styleUrls: ['../../pages.style.scss', '../rights.style.scss'],
    imports: [
        TranslateModule
    ]
})
export class RightsTermsComponent{
    version = '1.0';
    versionDate = 'April 2023';
}