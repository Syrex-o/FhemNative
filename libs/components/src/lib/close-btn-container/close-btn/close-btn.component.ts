import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'fhem-native-close-btn',
	templateUrl: './close-btn.component.html',
	styleUrls: ['./close-btn.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CloseBtnComponent {
	@Output() clicked: EventEmitter<void> = new EventEmitter<void>();
}