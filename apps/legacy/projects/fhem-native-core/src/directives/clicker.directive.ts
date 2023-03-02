import { Directive, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, NgZone, HostListener, NgModule } from '@angular/core';

import { HotKeyService } from '../services/hotkey.service';
import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
import { EventHandlerService } from '../services/event-handler.service';
import { SelectComponentService } from '../services/select-component.service';
import { ComponentLoaderService } from '../services/component-loader.service';

@Directive({ selector: '[clicker]' })
export class ClickerDirective implements AfterViewInit, OnChanges, OnDestroy {
	// move handle ID
	private handleID: string = this.settings.getUID();
	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// Input of the source (component or grid)
	@Input() source!: string;

	// Output Events
	@Output() onContextClick = new EventEmitter();
	@Output() onLongClick = new EventEmitter();
	@Output() onDoubleClick = new EventEmitter();

	// for click events
	private clicker: number = 0;
	private pressing: boolean = false;
	private strgPress: boolean = false;

	// timeouts and durations
	private longClickTimeout: any;
	private doubleClickTimeout: any;
	private duration: number = 500;

	constructor(
		private zone: NgZone,
		private ref: ElementRef,
		private hotKey: HotKeyService,
		private settings: SettingsService,
		private structure: StructureService,
		private eventHandler: EventHandlerService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
	}

	ngOnChanges(changes: SimpleChanges){
		if(changes.editingEnabled){
			const state: boolean = changes.editingEnabled.currentValue;
			if(this.settings.operatingPlatform === 'desktop'){
				if(state){
					// assign strg/command key
					this.hotKey.add(this.ref.nativeElement.id + 'down' , 'mod', (ID: string)=>{
						if(this.editingEnabled){
							this.strgPress = true;
						}
					}, 'keydown');
					this.hotKey.add(this.ref.nativeElement.id + 'up', 'mod', (ID: string)=>{
						if(this.editingEnabled){
							this.strgPress = false;
						}
					}, 'keyup');
				}else{
					// remove hotkeys
					this.hotKey.remove(this.ref.nativeElement.id + 'down');
					this.hotKey.remove(this.ref.nativeElement.id + 'up');
					this.strgPress = false;
				}
			}
		}
	}

	// create the context menu
	private createContextMenu(e: TouchEvent|MouseEvent|PointerEvent): void{
		if(!this.settings.blockMenus){
			const pos: {x: number, y: number} = this.structure.getMousePosition(e);
			// create context menu component
			// component is created in room --> base level container in stack
			this.componentLoader.createSingleComponent('ContextMenuComponent', this.componentLoader.containerStack[0].container, {
				x: pos.x,
				y: pos.y,
				source: this.source,
				componentID: this.ref.nativeElement.id
			});
		}
	}

	// right click event
	@HostListener('contextmenu', ['$event, $event.target'])
	contextClick(e: MouseEvent, target: HTMLElement): void {
		e.preventDefault();
		if(this.settings.operatingPlatform === 'desktop' && this.editingEnabled && Object.prototype.toString.call(target.className) !== '[object SVGAnimatedString]' && target.className.match(/grid|overlay-move/)){
			if(this.source === 'component'){
				this.createContextMenu(e);
			}else{
				this.onContextClick.emit(e);
			}
		}
	}

	// double click handler
	@HostListener('click', ['$event, $event.target'])
	onClick(e: PointerEvent, target: HTMLElement){
		if(this.editingEnabled){
			this.clicker ++;
			if(this.doubleClickTimeout) clearTimeout(this.doubleClickTimeout);
			this.doubleClickTimeout = setTimeout(() => {
				this.handleDoubleClick(e);
			}, this.duration / 2);
		}
	}

	ngAfterViewInit(){
		this.buildEventHandler();
	}

	private buildEventHandler(): void{
		this.eventHandler.removeHandle(this.handleID);
		// start event
		const startMove = (startTime: number, startMouse: {x: number, y: number}, e: TouchEvent|MouseEvent, target: HTMLElement) =>{
			if( !('which' in e && e.which === 3) && !('button' in e && e.button === 2) ){
				if(this.editingEnabled && target.className.match(/grid|overlay-move/)){
					let mouseDelta: {x: number, y: number} = {x: 0, y: 0};
					if(this.strgPress) this.componentSelector();
					// long press
					this.pressing = true;
					// handle long press
					if(this.longClickTimeout) clearTimeout(this.longClickTimeout);
					this.longClickTimeout = setTimeout(() => {
						this.handleLongPress(mouseDelta, e);
					}, this.duration);

					const whileMove = (e: TouchEvent|MouseEvent): void => {
						this.zone.runOutsideAngular(()=>{
							mouseDelta = this.move(startMouse, e, ()=>{
								if(this.longClickTimeout) clearTimeout(this.longClickTimeout);
								if(this.doubleClickTimeout) clearTimeout(this.doubleClickTimeout);
								endMove();
							});
						});
					}

					const endMove = () => {
						this.pressing = false;
						// remove listeners
						window.removeEventListener('mousemove', whileMove);
						window.removeEventListener('touchmove', whileMove);
						window.removeEventListener('mouseup', endMove);
						window.removeEventListener('touchend', endMove);
					}

					// detection of move
					window.addEventListener('mousemove', whileMove, {passive: true});
					window.addEventListener('mouseup', endMove, {passive: true});
					window.addEventListener('touchmove', whileMove, {passive: true});
					window.addEventListener('touchend', endMove, {passive: true});
				}
			}
		}
		this.eventHandler.handle(this.handleID, this.ref.nativeElement, startMove);
	}

	// move events
	private move(startMouse: {x: number, y: number}, e: MouseEvent|TouchEvent, callback: any): {x: number, y: number}{
		const delta: {x: number, y: number} = this.structure.getMouseDelta(startMouse, e);

		if (Math.abs(delta.x) > 10 || Math.abs(delta.y) > 10) {
			this.componentLoader.removeDynamicComponent('ContextMenuComponent');
			callback();
		}
		return delta;
	}

	// long press checker
	private handleLongPress(mouseDelta: {x: number, y: number}, e: TouchEvent|MouseEvent): void{
		if(this.pressing && (Math.abs(mouseDelta.x) < 10 && Math.abs(mouseDelta.y) < 10) ){
			if (this.source === 'component') {
				this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id);
				this.createContextMenu(e);
			}else{
				this.onLongClick.emit(e);
			}
		}
	}

	// double click check
	private handleDoubleClick(e: PointerEvent): void{
		if(this.clicker >= 2){
			if (this.source === 'component') {
				this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id);
				this.createContextMenu(e);
			}else{
				this.onDoubleClick.emit(e);
			}
		}
		this.clicker = 0;
	}

	private componentSelector(): void{
		// select the component
		if(this.selectComponent.evalCopySelector(this.ref.nativeElement.id)){
			// is selected, should be deselected
			this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id, true);
		}else{
			this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id);
		}
	}

	ngOnDestroy(){
		this.eventHandler.removeHandle(this.handleID);
	}
}
@NgModule({
	declarations: [ ClickerDirective ],
	exports: [ ClickerDirective ]
})
export class ClickerModule {}