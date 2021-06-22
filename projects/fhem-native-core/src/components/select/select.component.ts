import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, OnInit, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Translator
import { TranslateModule } from '@ngx-translate/core';

// Directives
import { OutsideClickModule } from '@FhemNative/directives/outside-click.directive';

// Ionic
import { IonicModule } from '@ionic/angular';

// Services
import { SettingsService } from '../../services/settings.service';

// Animation
import { Unfold } from '../../animations/animations';

@Component({
	selector: 'selector',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss'],
	animations: [ Unfold ],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SelectComponent, multi: true}],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectComponent implements OnInit{
	@ContentChild(TemplateRef) templateRef!: TemplateRef<any>;

	// bind value and label
	@Input() bindLabel!: string;
	@Input() bindValue!: string;
	@Input() bindValueLabel: boolean = false;
	// placeholder text
	@Input() placeholder!: string;
	// allow multiple results
	@Input() multiple: boolean = false;
	// allow search
	@Input() searchable: boolean = true;
	// allow full height of parent
	@Input() fullHeight: boolean = false;
	// allow to add items
	@Input() addNewItems: boolean = true;
	// allow single selection to remove item frame
	@Input() singleSelection: boolean = false;
	// custom border radius input
	@Input() borderRadius: { [key: string]: number|string } = {top_left: 5, top_right: 5, bottom_left: 5, bottom_right: 5};
	// custom border color
	@Input() borderColor: string = '#565656';

	// pass selection items
	@Input() items!:Array<any>;

	@Output() onOpen = new EventEmitter();
	@Output() onClose = new EventEmitter();
	@Output() onValueChange = new EventEmitter();

	// state of dropdown
	opened: boolean = false;
	// selected items for display
	selectedDisplay!: Array<any>;
	// user input 
	input: string|null = null;
	// real list from input items
	_items: any;
	// output ngModel value
	_selected: any;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this._selected); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: any) {
		let selected: Array<any> = value ? ( Array.isArray(value) ? value : [value] ) : [];
		// check if other value should be displayed
		if(this.bindValueLabel){
			let labelValues: Array<any> = [];
			selected.forEach((item: any)=>{
				// find item in list
				const found: any = this._items.find((x: any)=> x[this.bindValue] === item);
				if(found && this.bindLabel in found){
					labelValues.push(found[this.bindLabel]);
				}
			});
			this.selectedDisplay = labelValues;
		}else{
			// just use values
			this.selectedDisplay = selected;
		}
		this._selected = value;
		this.updateChanges();
	}

	constructor(public settings: SettingsService){}

	ngOnInit(){
		// copy list to prevent changes in array structure
		this._items = JSON.parse(JSON.stringify(this.items || []));
	}

	// user input change
	onInputChange(input: string): void{
		if(this.searchable && input && input !== ''){
			this._items = this.items.filter(x =>  (this.bindValue ? x[this.bindValue] : x).indexOf(input) > -1 );
		}else{
			this._items = this.items;
		}
	}

	// open/close selection menu
	toggleSelectionMenu(preventClose?:boolean): void{
		if(preventClose){
			if(!this.opened){
				this.opened = !this.opened;
			}
		}else{
			this.opened = !this.opened;
		}
		if(this.opened){
			this.onOpen.emit();
		}else{
			this.onClose.emit();
		}
	}

	closeMenu(): void{
		this.opened = false;
	}

	// add value from user input
	addUserValue(): void{
		if(this.multiple){
			this._selected.push(this.input);
		}else{
			this._selected = this.input;
		}
		this.input = '';
		this.writeValue(this._selected);
		this.updateChanges();
		this.toggleSelectionMenu();
		// reset items
		this.onInputChange('');
		this.onValueChange.emit(this._selected);
	}

	// select item
	selectItem(item: any, index: number): void{
		if(this.multiple){
			this._selected.push(this.bindValue ? item[this.bindValue] : item);
		}else{
			this._selected = this.bindValue ? item[this.bindValue] : item;
		}
		this.writeValue(this._selected);
		this.updateChanges();
		this.toggleSelectionMenu();
		this.onValueChange.emit(this._selected);
	}

	// remove item from selection
	removeItem(item: any, index: number): void{
		this._selected.splice(index, 1);
		this.writeValue(this._selected);
		this.updateChanges();
		this.onValueChange.emit(this._selected);
	}
}
@NgModule({
	declarations: [ SelectComponent ],
	imports: [ 
		IonicModule, 
		FormsModule, 
		CommonModule, 
		TranslateModule,
		OutsideClickModule
	],
	exports: [ SelectComponent ]
})
export class SelectComponentModule {}