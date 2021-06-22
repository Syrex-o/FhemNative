import { 
	Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, 
	HostListener, NgZone, ElementRef, forwardRef, ChangeDetectorRef, NgModule
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Ionic
import { IonicModule } from '@ionic/angular';
// Translator
import { TranslateModule } from '@ngx-translate/core';

// Services
import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { BackButtonService } from '../../services/back-button.service';
import { EventHandlerService } from '../../services/event-handler.service';

// Animation
import { PopupPicker, PickerContent, ShowHide } from '../../animations/animations';

@Component({
	selector: 'picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss'],
	host: {'[style.zIndex]': 'zIndex'},
	animations: [ PopupPicker, PickerContent, ShowHide ],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(()=> PickerComponent), multi: true}]
})
export class PickerComponent {
	// params for picker
	@Input() height: string|number = 50;
	// Input for custom z-index
	@Input() zIndex: number = 102;
	// Picker Config
	// Backdrop
	@Input() backdropDismiss: boolean = true;
	// Conform Button
	@Input() showConfirmBtn: boolean = true;
	@Input() confirmButtonDismiss: boolean = true;
	@Input() confirmBtn!: string;
	// Cancel Button
	@Input() showCancelBtn: boolean = true;
	@Input() cancelButtonDismiss: boolean = true;
	@Input() cancelBtn!: string|null;

	// choose animation style of the popup
	// (from-top, from-bottom)
	@Input() animation: string = 'from-bottom';

	// Events
	@Output() onOpen = new EventEmitter();
	@Output() onClose = new EventEmitter();
	@Output() onConfirm = new EventEmitter();
	@Output() onCancel = new EventEmitter();

	// Value handler
	showPicker: boolean = false;

	onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.showPicker); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	// Back button handle ID
	private handleID: string = this.settings.getUID();

	constructor(
		private zone: NgZone, 
		private ref: ElementRef,
		private cdr: ChangeDetectorRef,
		public settings: SettingsService, 
		private backBtn: BackButtonService,
		private structure: StructureService,
		private eventHandler: EventHandlerService){
	}

	private move(startMouse: {x: number, y: number}, e: MouseEvent|TouchEvent, elem: HTMLElement, relOpeation: string, operations: any): number{
		const delta: {x: number, y: number} = this.structure.getMouseDelta(startMouse, e);
		if( operations[relOpeation](delta.y, 0) ) delta.y = 0;

		const abs: number = Math.abs(delta.y);
		if(abs >= elem.clientHeight) delta.y = elem.clientHeight * (relOpeation === '>' ? -1 : 1);
		
		elem.style.transform = `translateY(${delta.y}px)`;

		return delta.y;
	}

	private end(startTime: number, distY: number, elem: HTMLElement): void{
		const endTime: number = new Date().getTime();
		const diff: number = endTime - startTime;
		const delta: number = Math.abs(distY);
		if(delta >= elem.clientHeight / 2 || (delta > 40 && diff < 300)){
			this.closePicker(true, true);
			this.cdr.detectChanges();
		}else{
			const timeout: number = (elem.clientHeight / (elem.clientHeight - delta)) / 10;
			elem.style.transition = timeout + 's ease';
			elem.style.transform = 'translateY(0px)';
			setTimeout(()=>{ 
				elem.style.transition = '0s'; 
			}, timeout);
		}
	}

	writeValue(value: boolean): void{
		const previousState: boolean = this.showPicker;
		this.showPicker = value;
		if (value) {
			this.onOpen.emit();
			this.updateChanges();
			this.assignBackHandle();
			this.assignMoveHandle();
		}
		// change in model
		if(previousState && !this.showPicker){
			this.closePicker(this.backdropDismiss || this.cancelButtonDismiss);
		}
	}

	ngOnChanges(changes: SimpleChanges){
		// check for changes in dismiss properties
		if(this.showPicker && (changes.backdropDismiss || changes.cancelButtonDismiss)){
			this.assignBackHandle();
			this.assignMoveHandle();
		}
	}

	// back button handle
	private assignBackHandle(): void{
		// handle back Button
		this.backBtn.removeHandle(this.handleID);
		// only when backdrop or close is enabled
		if(this.backdropDismiss || this.cancelButtonDismiss){
			this.backBtn.handle(this.handleID, ()=>{
				this.closePicker(true, true);
			});
		}
	}

	// move handle
	private assignMoveHandle(): void{
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			if(target.className.match(/dragger|backdrop/)){
				if(e.cancelable){
					e.stopPropagation();
				}
				// operations
				const operations = {
					'>': (a: number, b: number): boolean =>{ return a > b },
					'<': (a: number, b: number): boolean =>{ return a < b }
				};
				// get relevant operation
				const relOpeation: string = this.animation === 'from-bottom' ? '<' : '>';
				const elem: HTMLElement = this.ref.nativeElement.querySelector('.picker-content');
				let distY: number = 0;

				const whileMove = (e: TouchEvent|MouseEvent): void => {
					this.zone.runOutsideAngular(()=>{
						distY = this.move(startMouse, e, elem, relOpeation, operations);
					});
				}

				const endMove = (e: TouchEvent|MouseEvent): void => {
					document.removeEventListener('touchmove', whileMove);
					document.removeEventListener('touchend', endMove);
					this.end(startTime, distY, elem);
				}

				document.addEventListener('touchmove', whileMove, {passive: true});
				document.addEventListener('touchend', endMove, {passive: true});
			}
		}
		if(this.settings.operatingPlatform === 'mobile'){
			this.eventHandler.handle(this.handleID, this.ref.nativeElement, startMove);
		}
	}

	confirm(): void{
		this.onConfirm.emit();
		this.closePicker(this.confirmButtonDismiss);
	}

	cancel(from: string): void{
		if(from === 'backdrop'){
			this.closePicker(this.backdropDismiss, true);
		}else{
			if(this.cancelButtonDismiss){
				this.closePicker(this.cancelButtonDismiss, true);
			}
		}
	}

	private closePicker(allowed: boolean, cancel?: boolean): void{
		if(allowed){
			this.showPicker = false;
			this.updateChanges();
			this.onClose.emit();
			this.backBtn.removeHandle(this.handleID);
			this.eventHandler.removeHandle(this.handleID);
			// cancel called from button
			if(cancel){
				this.onCancel.emit();
			}
		}
	}
}
@NgModule({
	declarations: [ PickerComponent ],
	imports: [ IonicModule, FormsModule, CommonModule, TranslateModule ],
	exports: [ PickerComponent ]
})
export class PickerComponentModule {}