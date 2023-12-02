import { Component, forwardRef, inject } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ScrollHeaderModule } from '@fhem-native/directives';

import { ModalComponent } from '../modal.component';
import { CloseBtnContainerModule } from '../../close-btn-container/close-btn-container.module';

import { IonPopupAnimationService } from '@fhem-native/animations';

@Component({
	standalone: true,
	selector: 'fhem-native-popup',
	template: `
		<ion-modal #MODAL class="modal-component-modal popup-component-modal" 
			[isOpen]="value" 
			[cssClass]="cssClass"
			(didDismiss)="onDismiss()"
			[showBackdrop]="showBackdrop" 
			[backdropDismiss]="showBackdrop"
			[enterAnimation]="enterAnimation"
			[leaveAnimation]="leaveAnimation">
			<ng-template>
				<ion-header>
					<div class="modal-header">
						<fhem-native-close-btn-container #HEADER [pageHeader]="modalHeader" (closeButtonClicked)="onDismiss()">
							<ng-content select="[header]"></ng-content>
						</fhem-native-close-btn-container>
					</div>
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
	styleUrls: ['../modal.component.scss'],
	providers: [
		IonPopupAnimationService,
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(()=> PopupComponent),
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

export class PopupComponent extends ModalComponent{
    override modalAnimations = inject(IonPopupAnimationService);

    constructor(){
        super();

        this.enterAnimation = this.modalAnimations.getAnimation('fromBottomIn');
        this.leaveAnimation = this.modalAnimations.getAnimation('fromBottomOut');
    }
}