import { Component, OnInit, Input, OnDestroy, ViewChild, ViewChildren, QueryList, ViewContainerRef, ElementRef, HostListener } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { CreateComponentService } from '../../services/create-component.service';
import { HelperService } from '../../services/helper.service';

@Component({
	selector: 'fhem-swiper',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="swiper"
			resize
			double-click
			[editingEnabled]="settings.modes.roomEdit && editingEnabled"
			minimumWidth="60"
			minimumHeight="60"
			id="{{ID}}"
			(onResize)="resizeSlides()"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{ID: ID, device: null, reading: null, offline: true}">
				<div class="swiper-container" [ngStyle]="{
					'border': bool_data_showBorder ? '1px solid #ddd' : '0px',
					'border-bottom-left-radius.px': data_borderRadius,
					'border-bottom-right-radius.px': data_borderRadius,
					'border-top-left-radius.px' : data_borderRadius,
					'border-top-right-radius.px' : data_borderRadius,
					'overflow-y': (this.arr_data_orientation[0] === 'vertical' ? 'hidden' : 'auto')
				}">
					<p *ngIf="data_headline && data_headline !== ''" [ngStyle]="{'background-color': style_headerColor}">{{data_headline}}</p>
					<ion-slides
						[options]="sliderOpts"
						(ionSlideDidChange)="getSliderIndex()"
						pager="bool_data_showPager"
						#slides [ngStyle]="{'background-color': style_backgroundColor, 'height': (data_headline && data_headline !== '') ? 'calc(100% - 35px)' : '100%'}">
				      	<ion-slide *ngFor="let page of pages" [attr.id]="'swiper_'+page.ID+'_'+ID">
				      		<ng-container #container></ng-container>
				      	</ion-slide>
				    </ion-slides>
				</div>
			</fhem-container>
			<button (click)="swiperEditMode()" matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" *ngIf="settings.modes.roomEdit && this.editingEnabled">
			    <ion-icon class="edit" name="create"></ion-icon>
			</button>
		</div>
	`,
	styles: [`
		.swiper{
			position: absolute;
    		width: 130px;
    		height: 130px;
		}
		p{
			text-align: center;
			margin: 0;
			line-height: 35px;
		}
		.swiper-container{
			width: 100%;
			height: 100%;
			position: absolute;
			overflow-x: hidden;
		}
		.dark p{
			color: var(--dark-p);
		}
		.btn-round{
			position: absolute;
			top: 5px;
			right: 8px;
			width: 45px;
		    height: 45px;
		    border-radius: 50%;
		    border: none;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		    z-index: 101;
		    pointer-events: all;
		}
		.btn-round:focus{
			outline: 0px;
		}
		.btn-round ion-icon{
			color: var(--btn-blue);
			font-size: 25px;
		}
		.dark .btn-round{
			background: var(--dark-bg);
		}
	`],
})

export class SwiperComponent implements OnInit, OnDestroy {

	constructor(
		public settings: SettingsService,
		private structure: StructureService,
		private createComponent: CreateComponentService,
		private ref: ElementRef,
		private helper: HelperService) {}
	@ViewChild( IonSlides, { static: true } ) slides: IonSlides;
	@ViewChildren('container', { read: ViewContainerRef }) containers: QueryList<ViewContainerRef>;

	// Component ID
	@Input() ID: number;
	// room ID
	private roomID: number;
	public sliderOpts: any = {};

	@Input() data_headline: string;
	@Input() data_pages: string;
	@Input() data_borderRadius: string;
	@Input() bool_data_showBorder: boolean;
	@Input() bool_data_showPager: boolean;
	@Input() arr_data_orientation: string|string[];
	@Input() arr_data_swipeEffect: string|string[];

	// Styling
	@Input() style_headerColor: string;
	@Input() style_backgroundColor: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public pages: Array<any>;
	private currentContainer:any;

	// Subscription to room editor
	private modeSubscriber: Subscription;

	// custom edit mode, to disable resize, if swiper editing is active
	public editingEnabled: boolean = false;

	static getSettings() {
		return {
			name: 'Swiper',
			component: 'SwiperComponent',
			type: 'style',
			inputs: [
				{variable: 'data_headline', default: ''},
				{variable: 'data_pages', default: '3'},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'bool_data_showBorder', default: true},
				{variable: 'bool_data_showPager', default: true},
				{variable: 'arr_data_orientation', default: 'horizontal,vertical'},
				{variable: 'style_headerColor', default: '#434E5D'},
				{variable: 'style_backgroundColor', default: '#58677C'}
			],
			dimensions: {minX: 60, minY: 60}
		};
	}

	@HostListener('document:touchstart', ['$event'])
	@HostListener('document:mousedown', ['$event'])
	onMouseDown(e) {
		if (this.settings.modes.roomEdit) {
			// identify the click object
			if (!this.editingEnabled && (e.target.className.indexOf('content') !== -1 || (e.target.className.indexOf('overlay-move') !== -1 && !this.ref.nativeElement.contains(e.target))) ) {
				if(this.structure.canEdit(this.ID)){
					this.editingEnabled = true;
					// change edit ID back to relevant
					if(e.target.className.indexOf('popup') !== -1){
						// switch back to popup
						const id = e.target.id.replace('popup_', '');
						this.settings.modeSub.next({roomEditFrom: id});
					}else{
						this.settings.modeSub.next({roomEditFrom: this.structure.getCurrentRoom().item.ID});
					}
					this.removeHelpers();
				}
			}
			// identify if swiping should be allowed or not
			if(this.structure.canEdit(this.ID)){
				if (!this.editingEnabled && e.target.className.match(/(grid|line)/)) {
					this.slides.lockSwipes(false);
				}else{
					this.slides.lockSwipes(true);
				}
			}else{
				this.slides.lockSwipes(true);
			}
		}
	}

	@HostListener('window:resize')
	onWindowResize() {
		this.resizeSlides();
	}

	ngOnInit() {
		// initiallizing slider options
		this.sliderOpts = {
			direction: this.arr_data_orientation[0]
		};
		// formatting pages integer to array
		this.pages = [];
		for (let i = 0; i < parseInt(this.data_pages); i++) {
			this.pages.push({
				ID: i
			});
		}
		setTimeout(() => {
			// building views
			this.containers = this.containers.toArray() as any;

			// loading swiper components
			this.looper((i) => {
				this.createComponent.loadRoomComponents(
					this.structure.getComponentContainer(this.containers[i]),
					this.containers[i],
					false
				);
			});

			this.currentContainer = this.containers[0];

			// getting initial roomEdit state
			if (this.settings.modes.roomEdit) {
				this.editingEnabled = true;
			}
			// detecting mode changes in room edit
			this.modeSubscriber = this.settings.modeSub.subscribe(next => {
				if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
					if(this.settings.modes.roomEdit){
						if(this.structure.canEdit(this.ID)){
							this.editingEnabled = true;
						}
					}else{
						this.editingEnabled = false;
						this.slides.lockSwipes(false);
						this.removeHelpers();
					}
				}
			});
			// getting the spawn room ID, to remove components after OnDestroy
			this.roomID = this.structure.currentRoom.ID;
		}, 0);
	}

	private looper(callback) {
		for (let i = 0; i < this.containers.length; i++) {
			callback(i);
		}
	}

	public swiperEditMode(){
		this.settings.modeSub.next({roomEditFrom: this.ID});
		// create helpers
		this.createHelpers();
		// remove edit button
		this.editingEnabled = false;
		this.slides.lockSwipes(true);
	}

	private createHelpers(){
		if(this.structure.canEdit(this.ID)){
			// grid
			this.looper((i)=>{
				this.createComponent.createSingleComponent('GridComponent', (this.containers['_results'] ? this.containers['_results'][i] : this.containers[i]), {
					container: (this.containers['_results'] ? this.containers['_results'][i] : this.containers[i])
				});
			});
			// create component
			this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
				container: this.currentContainer
			});
		}else{
			this.removeHelpers();
		}
	}

	private removeHelpers(){
		this.looper((i)=>{
			this.createComponent.removeSingleComponent('GridComponent', (this.containers['_results'] ? this.containers['_results'][i] : this.containers[i]) );
		});
		this.createComponent.removeSingleComponent('CreateComponentComponent', this.currentContainer);
	}

	public getSliderIndex() {
		// getting the current index
		this.slides.getActiveIndex().then((index) => {
			this.currentContainer = this.containers['_results'] ? this.containers['_results'][index] : this.containers[index];
			// build new create component for current container
			if(this.settings.modes.roomEdit && !this.editingEnabled){
				this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
					container: this.currentContainer
				});
			}
		});
	}

	public resizeSlides() {
		setTimeout(() => this.slides.update(), 100);
	}

	private removeFhemComponents() {
		// removing fhem components in slider from view
		this.looper((i) => {
			const sliderComponents = this.structure.getComponentContainer( (this.containers['_results'] ? this.containers['_results'][i] : this.containers[i]) );
			if(sliderComponents){
				sliderComponents.forEach((comp)=>{
					this.createComponent.removeFhemComponent(comp.ID);
				});
				if(this.containers['_results']){
					this.containers['_results'][i].clear();
				}else{
					this.containers[i].clear();
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.modeSubscriber !== undefined) {
			this.modeSubscriber.unsubscribe();
		}
		this.removeFhemComponents();
	}
}
