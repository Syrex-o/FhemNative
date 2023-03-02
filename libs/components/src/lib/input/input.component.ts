import { AfterContentInit, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
	selector: 'fhem-native-input',
	templateUrl: './input.component.html',
	styleUrls: ['./input.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> InputComponent),
		multi: true
	}]
})

export class InputComponent implements ControlValueAccessor, AfterContentInit{

	// type of input
	@Input() inputType: 'text'|'password'|'number' = 'text';
	currentInputType!: 'text'|'password'|'number';

	// display text
	@Input() label = 'Text';

	// placeholder text
	@Input() placeholder = 'Enter text';

	// When filled, info bubble is created for additional information
	@Input() info = '';
	
	// trim input to prevent spaces
	@Input() trimInput = false;

	// Current Value
	value: string|number = '';

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: string|number): void {
		this.value = value;
		this.updateChanges();
	}

	ngAfterContentInit(): void {
		this.currentInputType = this.inputType;
	}

	// only update type of password
	updateInputType(): void{
		if(this.inputType === 'password') this.currentInputType = (this.currentInputType === 'password' ? 'text' : 'password');
	}

	updateIonChanges(e: any){
		this.value = this.inputType === 'number' ? parseInt(e.detail.value) : e.detail.value;

		// trim input if needed --> no spaces
		if(this.trimInput) setTimeout(()=> this.value = (typeof this.value !== 'number') ? this.value.replace(/\s+/g, '') : this.value, 0);

		this.updateChanges();
	}
}