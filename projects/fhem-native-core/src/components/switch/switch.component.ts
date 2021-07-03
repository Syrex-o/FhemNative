import { Component, Input, Output, EventEmitter, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Services
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'switch',
	templateUrl: './switch.component.html',
	styleUrls: ['./switch.component.scss'],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SwitchComponent, multi: true}]
})
export class SwitchComponent {
	// Switch Config
	// style of the switch
	@Input() switchStyle: string = 'toggle';
	// labeling
	@Input() label!: string;
	@Input() subTitle!: string;
	// Show/hide border
	@Input() showBorder: boolean = false;
	// Allow multi line/no line break...
	@Input() allowLinebreak: boolean = false;
	// enable/disable padding
	@Input() padding: boolean = true;
	// full height enabling
	@Input() fullHeight: boolean = false;

	// Color values
	@Input() borderColor: string = '#565656';
	@Input() colorOn: string = '#2994b3';
	@Input() colorOff: string = '#a2a4ab';
	@Input() thumbColorOn: string = '#14a9d5';
	@Input() thumbColorOff: string = '#fff';

	// Events
	@Output() onToggle: EventEmitter<boolean> = new EventEmitter();

	// Value handler
	toggleState: boolean = false;
	@Input() actOnCallback: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.toggleState); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: boolean): void {
		this.toggleState = value;
		this.updateChanges();
	}

	toggle(): void{
		if(!this.actOnCallback){
			this.toggleState = !this.toggleState;
		}
		// ontoggle emits the state, that should be the result, based on callback
		// state should switch to false and actonCallback --> false is emitted
		this.onToggle.emit(this.toggleState);
		this.updateChanges();
	}

	constructor(public settings: SettingsService){}
}
@NgModule({
	declarations: [ SwitchComponent ],
	imports: [ CommonModule, FormsModule ],
	exports: [ SwitchComponent ]
})
export class SwitchComponentModule {}