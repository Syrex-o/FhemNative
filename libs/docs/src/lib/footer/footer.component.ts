import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
	selector: 'fhem-native-doc-footer',
	templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    imports: [ IonicModule, RouterModule, TranslateModule ]
})
export class DocFooterComponent{
    year = new Date().getFullYear();
}