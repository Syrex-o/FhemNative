import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, ChangeDetectionStrategy, forwardRef, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchbarCustomEvent } from '@ionic/angular';
import { tap } from 'rxjs';

import { CssVariableService, ThemeService } from '@fhem-native/services';

import { clone, getUID } from '@fhem-native/utils';

@Component({
	selector: 'fhem-native-select',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef(()=> SelectComponent),
		multi: true
	}],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class SelectComponent implements OnInit, OnChanges, ControlValueAccessor{
	@ViewChild('selectContainer', {read: ElementRef}) selectContainer!: ElementRef;

	// get UID for trigger of info
	// needed, when multiple inputs are on same page
	public selectorTriggerID = getUID();

	// open/close state of the selector
	selectState = false;

	// own implementation, when needed
	@ContentChild('VALUE_TEMPLATE') valueTemplate!: TemplateRef<any>;
	@ContentChild('ITEM_TEMPLATE') itemTemplate!: TemplateRef<any>;

	// Style of the selection --> ionic styles/custom
	@Input() selectionType: 'accordion'|'action-sheet' = 'accordion';

	// Items for selection
	@Input() items: Array<any> = [];

	// allow multi element selection
	@Input() multi = false;

	// allow search
	@Input() searchable = false;

	/**
		When Items is an Array of objects, we might need the properties for
			selectProp: value that is selected and assigned to 'value'
			displayProp: value that is displayed in selection menu
	*/
	@Input() selectProp!: string;
	@Input() displayProp!: string;

	// selector description
	@Input() label = '';
	@Input() info = '';
	@Input() placeholder = 'Select One';

	// determine if toggle should only switch state, when actual value changes
	@Input() actOnCallback = false;

	// Styling Inputs
	@Input() height = this.cssVariable.getVariableValue('--item-height-b');
	@Input() backgroundColor: string|undefined;

	theme$ = this.theme.getThemePipe('--tertiary').pipe(tap(x=> this._backgroundColor = this.backgroundColor || x));
	_backgroundColor: string|undefined;
	_containerMaxHeight = 250;

	// value change
	@Output() selectionChanged = new EventEmitter<{index: number, value: any}>();

	// list of filtered items from search
	filteredItems: Array<any> = [];

	// Current Value
	value: any;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.value); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value: any): void {
		this.value = value;
		this.updateChanges();
		this.sortFilteredItems();
	}

	constructor(public cssVariable: CssVariableService, public theme: ThemeService){}

	ngOnInit(): void {
		this.getContainerHeight();
		this.filteredItems = clone(this.items);
		this.sortFilteredItems();
	}

	ngOnChanges(): void {
		this.filteredItems = clone(this.items);
		this.sortFilteredItems();
		this.getContainerHeight();
	}

	toggleSelectState(): void{
		this.selectState = !this.selectState;
		if(this.selectState) this.sortFilteredItems();
	}

	private getContainerHeight(): void{
		this._containerMaxHeight = Math.min(250, parseInt(this.height) * this.items.length + ( parseInt(this.height) * (this.searchable ? 1 : 0) ) + 30);
	}

	private sortFilteredItems(): void{
		if(!this.multi || !this.value) return;
		this.filteredItems.sort((a, b)=>{
			const relA = this.selectProp ? a[this.selectProp] : a;
			const relB = this.selectProp ? b[this.selectProp] : b;
			return this.value.indexOf(relB) - this.value.indexOf(relA);
		});
	}

	// check items for active, when multi selection is allowed
	checkForMultiActive(loopItem: any): boolean{
		if(this.multi && Array.isArray(this.value)){
			return this.value.indexOf( this.selectProp ? loopItem[this.selectProp] : loopItem ) > -1;
		}
		return false;
	}

	presentPopover(ev: any): void{
		// adjust ionic css property
		ev.target.style.setProperty('--background', this._backgroundColor);
		ev.target.style.setProperty('--max-height', this._containerMaxHeight + 'px');
	}

	filterItems(event: SearchbarCustomEvent): void{
		const filter = event.detail.value?.toLowerCase();
		this.filteredItems = this.items.filter((x)=>{
			return ( this.selectProp ? x[this.selectProp] : x ).toLowerCase().indexOf( filter ) > -1
		});
		this.sortFilteredItems();
	}

	selectItem(item: any, index: number): void{
		const itemValue = this.selectProp ? item[this.selectProp] : item;

		// check for multi selection
		if(this.multi){
			// copy selection array
			const res = [...this.value];
			res.push(itemValue);

			this.value = res;
			this.updateChanges();

			this.selectionChanged.emit({index: index, value: itemValue});
		}else{
			// check for same value selection
			if(this.value !== itemValue){
				this.value = itemValue;
				this.updateChanges();

				this.selectionChanged.emit({index: index, value: itemValue});
			}
			this.selectState = false;
		}
	}

	removeSelectedItem(item: any, index: number): void{
		if(!this.multi) return;

		const itemValue = this.selectProp ? item[this.selectProp] : item;
		// copy selection array
		const res = [...this.value];

		// check if value is in array
		const itemIndex = this.value.lastIndexOf(itemValue);
		if(item === -1) return;

		res.splice(itemIndex, 1);

		this.value = res;
		this.updateChanges();

		this.selectionChanged.emit({index: index, value: itemValue});
	}
}