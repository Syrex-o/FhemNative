import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, IonModal } from '@ionic/angular';

import { ScrollHeaderModule } from '@fhem-native/directives';
import { CloseBtnContainerModule } from '../close-btn-container/close-btn-container.module';

import { BackButtonService } from '@fhem-native/services';
import { decimalRounder, getUID } from '@fhem-native/utils';
import { IonAnimationService, IonPickerAnimationService } from '@fhem-native/animations';

@Component({
	standalone: true,
	selector: 'fhem-native-modal',
	template: `
		<ion-modal #MODAL class="modal-component-modal" 
			[isOpen]="value" 
			[cssClass]="cssClass"
			(didDismiss)="onDismiss()"
			[showBackdrop]="showBackdrop" 
			[backdropDismiss]="showBackdrop"
			[enterAnimation]="enterAnimation"
			[leaveAnimation]="leaveAnimation">
			<ng-template>
				<ion-header>
					<ion-toolbar class="background-a-ion">
						<div class="modal-header">
							<fhem-native-close-btn-container #HEADER [pageHeader]="modalHeader" (closeButtonClicked)="onDismiss()">
								<ng-content select="[header]"></ng-content>
							</fhem-native-close-btn-container>
						</div>
					</ion-toolbar>
				</ion-header>
				<ion-content 
					fhemNativeScrollHeader [header]="headerAnimation ? HEADER.headerEl : undefined"
					[class.add-padding]="addPaddingToContent" [scrollEvents]="true" class="background-a-ion">
					<div class="modal-inner-content">
						<ng-content select="[content]"></ng-content>
					</div>
				</ion-content>
			</ng-template>
		</ion-modal>
	`,
	styleUrls: ['./modal.component.scss'],
	providers: [
		IonAnimationService,
		IonPickerAnimationService,
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(()=> ModalComponent),
			multi: true
		}
	],
	imports: [
		IonicModule,
		CommonModule,
		ScrollHeaderModule,
		CloseBtnContainerModule
	]
})

export class ModalComponent implements ControlValueAccessor, AfterViewInit, OnDestroy{
	private readonly handleID = getUID();
	@ViewChild('MODAL', { read: IonModal }) ionModal: IonModal|undefined;
	@ViewChild('MODAL', { read: ElementRef, static: false }) modal: ElementRef|undefined;

	protected maxWidth = 550;
	protected maxHeight = 550;
	protected minWidth = 280;
	protected minHeight = 280;

	// popup dimensions in percentage
	@Input() width = 80;
	@Input() height = 80;

	@Input() showBackdrop = true;
	@Input() addPaddingToContent = true;

	@Input() cssClass = '';
	@Input() modalHeader = '';
	@Input() headerAnimation = true;

	private backBtn = inject(BackButtonService);
	protected modalAnimations: IonAnimationService = inject(IonPickerAnimationService);
	@Input() enterAnimation = this.modalAnimations.getAnimation('scaleIn');
	@Input() leaveAnimation = this.modalAnimations.getAnimation('scaleOut');

	@Output() cancelled = new EventEmitter<void>();

	value = false;
	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: boolean): void {
		this.value = value;
		this.updateChanges();

		if(!this.value) return;

		this.removeBackBtnSub();
		this.backBtn.handle(this.handleID, ()=> this.onDismiss() );
	}

	ngAfterViewInit(): void {
		if(!this.modal) return;
		
		this.modal.nativeElement.style.setProperty('--width', this.width + '%');
		this.modal.nativeElement.style.setProperty('--height', this.height + '%');

		this.modal.nativeElement.style.setProperty('--min-width', this.minWidth + 'px');
		this.modal.nativeElement.style.setProperty('--min-height', this.minHeight + 'px');

		this.modal.nativeElement.style.setProperty('--max-width', this.maxWidth + 'px');
		this.modal.nativeElement.style.setProperty('--max-height', this.maxHeight + 'px');
	}

	private removeBackBtnSub(): void{
		this.backBtn.removeHandle(this.handleID);
	}

	getDimensions(){
		const w = Math.min(this.maxWidth, Math.max(this.minWidth, decimalRounder(window.innerWidth * ( Math.min(100, this.width) / 100 ), 0.1)) );
		const h = Math.min(this.maxHeight, Math.max(this.minHeight, decimalRounder(window.innerHeight * ( Math.min(100, this.height) / 100 ), 0.1)) );
		return { w, h };
	}

	onDismiss(): void{
		this.value = false;
		this.updateChanges();
		this.cancelled.emit();
		this.removeBackBtnSub();
	}

	ngOnDestroy(): void {
		this.removeBackBtnSub();
		if(this.ionModal && this.ionModal.isOpen) this.ionModal.dismiss();
	}
}