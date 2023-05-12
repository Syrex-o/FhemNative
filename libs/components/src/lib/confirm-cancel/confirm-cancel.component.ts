import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    standalone: true,
    imports: [
        IonicModule,
        CommonModule
    ],
	selector: 'fhem-native-confirm-cancel-buttons',
    template: `
        <button class="size-d app-button save ion-activatable" *ngIf="showConfirmButton" (click)="confirmClick.emit()">
			{{confirmText}}
			<ion-ripple-effect></ion-ripple-effect>
		</button>

        <button class="size-d app-button cancel ion-activatable" (click)="cancelClick.emit()">
			{{cancelText}}
			<ion-ripple-effect></ion-ripple-effect>
		</button>
    `,
	styleUrls: ['./confirm-cancel.component.scss'],
})

export class ConfirmCancelButtonsComponent {
   // buttons
	@Input() confirmText = '';
	@Input() cancelText = '';

    @Input() showConfirmButton = false;

    @Output() confirmClick = new EventEmitter<void>();
    @Output() cancelClick = new EventEmitter<void>();

    @HostBinding('class.single-btn') get btnAmount(){ return !this.showConfirmButton }
}