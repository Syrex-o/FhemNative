import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
	standalone: true,
	selector: 'fhem-native-popover',
	template: `
		<ion-popover cssClass="fhem-native-popover"
			[showBackdrop]="true"
			[isOpen]="value"
			(didDismiss)="onDismiss()">
			<ng-template>
				<ng-content></ng-content>
			</ng-template>
		</ion-popover>
	`,
	styleUrls: ['./popover.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> PopoverComponent),
		multi: true
	}],
	imports: [ IonicModule ]
})

export class PopoverComponent implements ControlValueAccessor{
	// allow closing
	@Input() backdropDismiss = true;
    @Input() closeButtonDismiss = true;

	// Current Value
	value = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: boolean): void {
		this.value = value;
		this.updateChanges();
	}

	onDismiss(): void{
		this.value = false;
		this.updateChanges();
	}
}