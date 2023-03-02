import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    standalone: true,
    imports: [ IonicModule, CommonModule ],
	selector: 'fhem-native-ui-box',
    template: `
        <div class="box-container" [class.ion-activatable]="clickable">
            <ng-content></ng-content>
            <ion-ripple-effect *ngIf="clickable"></ion-ripple-effect>
        </div>
    `,
    styleUrls: ['./box.component.scss']
})

export class UI_BoxComponent {
    @Input() clickable = false;
}