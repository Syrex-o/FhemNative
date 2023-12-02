import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
	selector: 'fhem-native-close-btn-container',
	templateUrl: './close-btn-container.component.html',
	styleUrls: ['./close-btn-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class CloseBtnContainerComponent{
	@ViewChild('PAGE_HEADER', {read: ElementRef, static: true}) headerEl: ElementRef<HTMLElement>|undefined;

	@Input() pageHeader!: string;

	@Output() closeButtonClicked: EventEmitter<void> = new EventEmitter<void>();
}