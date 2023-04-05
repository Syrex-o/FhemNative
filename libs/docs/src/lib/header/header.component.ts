import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
    standalone: true,
	selector: 'fhem-native-doc-header',
	templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
        IonicModule
    ]
})
export class DocHeaderComponent{

}