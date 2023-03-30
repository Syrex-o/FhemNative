import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { IconModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { FhemService } from '@fhem-native/services';

import { OutsideClickModule } from '@fhem-native/directives';

import { commaListToArray } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	imports: [ IconModule, FhemComponentModule, OutsideClickModule ],
	selector: 'fhem-native-component-component-circle-menu',
	templateUrl: './fhem-circle-menu.component.html',
	styleUrls: ['./fhem-circle-menu.component.scss'],
})
export class FhemCircleMenuComponent{
	@ViewChild('CIRCLE_MENU', {read: ElementRef, static: false}) circleMenu: ElementRef|undefined;

	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
    @Input() reading!: string;
    @Input() setReading!: string;
	@Input() values!: string;

	@Input() borderRadius!: number;
	@Input() borderRadiusTopLeft!: number;
	@Input() borderRadiusTopRight!: number;
	@Input() borderRadiusBottomLeft!: number;
	@Input() borderRadiusBottomRight!: number;

	@Input() expandStyle!: string;

    // Icons
	@Input() icon!: string;
    @Input() icons!: string[];

	// Styling
	@Input() iconColorOn!: string;
	@Input() iconColorOff!: string;
	@Input() buttonColor!: string;
	@Input() labelColor!: string;
	@Input() activeColor!: string;
	@Input() iconColors!: string[];

	// Bool
	@Input() useIcons!: boolean;
	@Input() customBorder!: boolean;

	// build items based on user input
	_items: string[] = [];

	// state of button
	buttonState = false;
	currentValue: string|undefined;
	fhemDevice: FhemDevice|undefined;

	trackByFn(index: number){ return index; }

	constructor(private fhem: FhemService){}

	getArrValues(): void{
		if(this.values) this._items = commaListToArray(this.values);
	}

	setFhemDevice(device: FhemDevice): void{ 
		this.fhemDevice = device;
		this.currentValue = this.fhemDevice.readings[this.reading]?.Value.toString();
	}

	select(index: number): void{
		if(!this.fhemDevice) return;
		
		const command: string = this._items[index];
		if (this.setReading === '') return this.fhem.set(this.fhemDevice.device, command);
		return this.fhem.setAttr(this.fhemDevice.device, this.setReading, command);
	}

	toggleMenu(): void{
		this.buttonState = !this.buttonState;
		
	}

	closeMenu(): void{
		this.buttonState = false;
	}

	translator(index: number): string {
		if(!this.circleMenu) return 'translate3d(0px,0px,0px)';

		if(this.expandStyle === 'top') return `translate3d(0px, ${((this.circleMenu.nativeElement.offsetHeight * (index + 1)) * -1)}px, 0px)`;
		if(this.expandStyle === 'left') return `translate3d(${((this.circleMenu.nativeElement.offsetWidth * (index + 1)) * -1) }px, 0px, 0px)`;
		if(this.expandStyle === 'bottom') return `translate3d(0px, ${(this.circleMenu.nativeElement.offsetHeight * (index + 1))}px, 0px)`;
		if(this.expandStyle === 'right') return `translate3d(${(this.circleMenu.nativeElement.offsetWidth * (index + 1)) }px, 0px, 0px)`;
		
		// expandStyle: circle
		const max = Math.max(this.circleMenu.nativeElement.offsetWidth, this.circleMenu.nativeElement.offsetHeight);
		return `rotate(${(360 / this._items.length) * index}deg) translate3d(${max}px, ${max}px, 0px) rotate(${(-360 / this._items.length) * index}deg)`;
	}
}