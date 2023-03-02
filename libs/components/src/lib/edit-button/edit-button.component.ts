import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [ IonicModule, CommonModule ],
	selector: 'fhem-native-edit-button',
	templateUrl: './edit-button.component.html',
	styleUrls: ['./edit-button.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditButtonComponent {
    @Output() editBtnClicked: EventEmitter<void> = new EventEmitter<void>();
}