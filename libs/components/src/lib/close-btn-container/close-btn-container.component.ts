import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

import { ThemeService } from '@fhem-native/services';

@Component({
	selector: 'fhem-native-close-btn-container',
	templateUrl: './close-btn-container.component.html',
	styleUrls: ['./close-btn-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CloseBtnContainerComponent {
	@ViewChild('PAGE_HEADER', {read: ElementRef, static: true}) headerEl!: ElementRef<HTMLElement>;

	@Input() pageHeader!: string;

	@Input() backgroundColor!: string;
	private theme$ = this.theme.getThemePipe('--primary');

	@Output() closeButtonClicked: EventEmitter<void> = new EventEmitter<void>();

	constructor(private theme: ThemeService){}
}