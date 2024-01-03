import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    standalone: true,
	selector: 'fhem-native-rights-support',
	templateUrl: 'support.component.html',
	styleUrls: ['../../pages.style.scss', '../rights.style.scss'],
    imports: [
        TranslateModule
    ]
})
export class RightsSupportComponent{
    version = '1.1';
    versionDate = 'Januar 2024';
}