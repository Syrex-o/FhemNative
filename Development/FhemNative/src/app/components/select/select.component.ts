import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// Services
import { SettingsService } from '../../services/settings.service';

// Animation
import { Unfold } from '../../animations/animations';

@Component({
	selector: 'selector',
	templateUrl: './select.component.html',
  	styleUrls: ['./select.component.scss'],
  	animations: [ Unfold ],
  	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SelectComponent, multi: true}]
})

export class SelectComponent implements OnInit{
	@ContentChild(TemplateRef) templateRef: TemplateRef<any>;

	// bind value and label
	@Input() bindLabel: string;
    @Input() bindValue: string;
    // placeholder text
	@Input() placeholder: string;
	// allow multiple results
	@Input() multiple: boolean = false;
	// allow search
	@Input() searchable: boolean = true;
	// allow full height of parent
	@Input() fullHeight: boolean = false;
	// allow to add items
	@Input() addNewItems: boolean = true;
	// pass selection items
	@Input() items:Array<any>;

	@Output() onOpen = new EventEmitter();
	@Output() onClose = new EventEmitter();
	@Output() onValueChange = new EventEmitter();

	// state of dropdown
	opened: boolean = false;
	// selected items
	selected: Array<any>;
	// user input 
	input: string = null;
	// real list from input items
	_items: any;
	// output ngModel value
	_selected: any;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this._selected); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value) {
		this.selected = value ? ( Array.isArray(value) ? value : [value] ) : [];
		this._selected = value;
		this.updateChanges();
	}

	constructor(public settings: SettingsService){}

	ngOnInit(){
		// copy list to prevent changes in array structure
		this._items = JSON.parse(JSON.stringify(this.items || []));
	}

	// user input change
	onInputChange(input: string){
		if(this.searchable && input && input !== ''){
			this._items = this.items.filter(x =>  (this.bindValue ? x[this.bindValue] : x).indexOf(input) > -1 );
		}else{
			this._items = this.items;
		}
	}

	// open/close selection menu
	toggleSelectionMenu(preventClose?:boolean){
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

	// add value from user input
	addUserValue(){
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
	selectItem(item: any, index: number){
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
	removeItem(item: any, index: number){
		this._selected.splice(index, 1);
		this.writeValue(this._selected);
		this.updateChanges();
		this.onValueChange.emit(this._selected);
	}
}