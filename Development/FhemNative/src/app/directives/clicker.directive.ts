import { Directive, ElementRef, HostListener, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, } from '@angular/core';

import { SelectComponentService } from '../services/select-component.service';
import { ComponentLoaderService } from '../services/component-loader.service';
import { HotKeyService } from '../services/hotkey.service';

@Directive({ selector: '[clicker]' })
export class ClickerDirective implements OnChanges {
	// Input to determine if editing should be available
	@Input() editingEnabled: boolean = false;
	// Input of the source (component or grid)
	@Input() source: string;

	// Output Events
	@Output() onContextClick = new EventEmitter();
	@Output() onLongClick = new EventEmitter();
	@Output() onDoubleClick = new EventEmitter();

	// for click events
	private clicker: number = 0;
	private pressing: boolean;
	private longPressing: boolean;
	private strgPress: boolean;

	// for long press
	private startMouse: any = {};
	private currentMouse: any = {};

	// timeouts and durations
	private longClickTimeout: any;
	private doubleClickTimeout: any;
	private duration: number = 500;

	constructor(
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService,
		private hotKey: HotKeyService,
		private ref: ElementRef){

	}

	ngOnChanges(changes: SimpleChanges){
		if(changes.editingEnabled){
			const state: boolean = changes.editingEnabled.currentValue;
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

	// create the context menu
	private createContextMenu(e){
		// create context menu component
		// component is created in room --> base level container in stack
		this.componentLoader.createSingleComponent('ContextMenuComponent', this.componentLoader.containerStack[0].container, {
			x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
			y: e.pageY || (e.touches ? e.touches[0].clientY : 0),
			source: this.source,
			componentID: this.ref.nativeElement.id
		});
	}

	// right click event
  	@HostListener('contextmenu', ['$event, $event.target'])
  	contextClick(e, target: HTMLElement) {
  		if(this.editingEnabled && target.className.match(/grid|overlay-move/)){
  			if(this.source === 'component'){
  				this.createContextMenu(e);
  			}else{
  				this.onContextClick.emit(e);
  			}
  		}
  	}

  	// long press event
	// double click event
  	@HostListener('mousedown', ['$event, $event.target'])
  	@HostListener('touchstart', ['$event, $event.target'])
	onMouseDown(e, target) {
		// detect context click
		if( !('which' in e && e.which === 3) && !('button' in e && e.button === 2) ){
			if(this.editingEnabled && target.className.match(/grid|overlay-move/)){
				if(this.strgPress){
					// select the component
					if(this.selectComponent.evalCopySelector(this.ref.nativeElement.id)){
						// is selected, should be deselected
						this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id, true);
					}else{
						this.selectComponent.buildCopySelectorForRelevant(this.ref.nativeElement.id);
					}
				}
				this.clicker ++;
				// long press
				this.currentMouse = this.startMouse = {
					x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
					y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
				};
				this.pressing = true;
				this.longPressing = false;
				// long press
				this.longClickTimeout = setTimeout(() => {
					// checking the location distance from start to current
					if (Math.abs(this.startMouse.x - this.currentMouse.x) < 10 && Math.abs(this.startMouse.y - this.currentMouse.y) < 10) {
						this.longPressing = true;
						if (this.source === 'component') {
							this.createContextMenu(e);
						}else{
							this.onLongClick.emit(e);
						}
					}
				}, this.duration);

				// double click
				this.doubleClickTimeout = setTimeout(() => {
					// workaround for grid clicker
					if (this.clicker >= (e.target.className.match(/grid/) ? 3 : 2) ) {
						if (this.source === 'component') {
							this.createContextMenu(e);
						}else{
							this.onDoubleClick.emit(e);
						}
					}
					this.clicker = 0;
				}, this.duration / 2);
			}
		}
	}

	// update movement
	@HostListener('mousemove', ['$event, $event.target'])
	@HostListener('touchmove', ['$event, $event.target'])
	onMouseMove(e, target) {
		if(this.editingEnabled && Object.prototype.toString.call(target.className) !== '[object SVGAnimatedString]' && target.className.match(/grid|overlay-move/)){
			if (this.pressing) {
				this.currentMouse = {
					x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
					y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
				};
			}
		}
	}

	// end events
	@HostListener('touchend')
	@HostListener('mouseup')
	endPress() {
		// reset values
		clearTimeout(this.longClickTimeout);
		this.longPressing = false;
		this.pressing = false;
	}
}