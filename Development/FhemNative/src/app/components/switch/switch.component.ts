import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Services
import { SettingsService } from '../../services/settings.service';

@Component({
	selector: 'switch',
	templateUrl: './switch.component.html',
  	styleUrls: ['./switch.component.scss'],
  	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SwitchComponent, multi: true}]
})

export class SwitchComponent {
	// Events
	@Output() onToggle: EventEmitter<boolean> = new EventEmitter();

	// Switch Config
	// style of the switch
	@Input() switchStyle: string = 'toggle';
	// labeling
	@Input() label: string;
    @Input() subTitle: string;
    // Show/hide border
    @Input() showBorder: boolean = false;
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

	// Value handler
	toggleState: boolean = false;
	@Input() actOnCallback: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.toggleState); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value) {
		this.toggleState = value;
		this.updateChanges();
	}

	toggle(){
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