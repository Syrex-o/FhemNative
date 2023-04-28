import { Component } from "@angular/core";

@Component({
    standalone: true,
	selector: 'fhem-native-rights-privacy',
	templateUrl: 'privacy.component.html',
	styleUrls: ['../../pages.style.scss', '../rights.style.scss']
})
export class RightsPrivacyComponent{
	version = '1.0';
    versionDate = 'April 2023';
}