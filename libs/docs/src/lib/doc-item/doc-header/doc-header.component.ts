import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ScrollManagerModule } from '@fhem-native/directives';
import { IonicModule } from '@ionic/angular';

@Component({
	standalone: true,
	selector: 'fhem-native-doc-item-header',
	template: `
		<ng-container *ngIf="asAnchor; else DEFAULT">
			<h3 [createAnchorUrl]="true"  
				[fhemNativeScrollAnchor]="headerID" 
				[fhemNativeScrollSection]="headerID" class="inner-header color-a size-e spacing-b">
				{{header}}
				<ion-icon class="size-d" name="link-outline"></ion-icon>
			</h3>
		</ng-container>

		<ng-template #DEFAULT>
			<h3 [fhemNativeScrollAnchor]="headerID" [fhemNativeScrollSection]="headerID" class="inner-header color-a size-e spacing-b">
				{{header}}
				<ion-icon class="size-d" name="link-outline"></ion-icon>
			</h3>
		</ng-template>
    `,
	styleUrls: ['./doc-header.component.scss'],
	imports: [
		IonicModule,
		CommonModule,
		ScrollManagerModule
	]
})
export class DocItemHeaderComponent{
    @Input() headerID!: string|number;
    @Input() header!: string;

	@Input() asAnchor = false;
}