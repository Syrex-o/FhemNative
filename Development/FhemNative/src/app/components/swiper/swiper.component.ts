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
			<fhem-container [specs]="{'device': null, 'reading': null, 'offline': true}">
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
		</div>
	`,
	styles: [`
		.swiper{
			position: absolute;
    		width: 100px;
    		height: 50px;
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

	// mouse positions
	private currentMouse = {x: 0, y: 0};
	private startMouse = {x: 0, y: 0};
	private sliderIndex = 0;

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

	// Subscription to room editor
	private modeSubscriber: Subscription;

	// custom edit mode, to disable resize, if swiper editing is active
	public editingEnabled = false;

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
			dimensions: {minX: 100, minY: 50}
		};
	}

	@HostListener('document:touchstart', ['$event'])
	@HostListener('document:mousedown', ['$event'])
	onMouseDown(e) {
		if (this.settings.modes.roomEdit) {
			this.startMouse = {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
			};
			// identify the click object
			if (!this.editingEnabled && (e.target.className.indexOf('content') !== -1 || (e.target.className.indexOf('overlay-move') !== -1 && !this.ref.nativeElement.contains(event.target))) ) {
				this.roomEditMode();
			}
			// identify if swiping should be allowed or not
			if (!this.editingEnabled && e.target.className.match(/(grid|line)/)) {
				this.slides.lockSwipes(false);
			} else {
				this.slides.lockSwipes(true);
			}
		}
	}

	@HostListener('document:mouseup', ['$event'])
	@HostListener('document:touchend', ['$event'])
	onClick(e) {
		if (this.settings.modes.roomEdit) {
			this.currentMouse = {
				x: e.pageX || (e.touches ? e.touches[0].clientX : 0),
				y: e.pageY || (e.touches ? e.touches[0].clientY : 0)
			};
			// identify the click object
			if (this.editingEnabled && this.ref.nativeElement.contains(event.target)) {
				// respect double click event
				setTimeout(() => {
					if (!this.ref.nativeElement.firstChild.classList.contains('double-click') && Math.abs(this.startMouse.x - this.currentMouse.x) < 5 && Math.abs(this.startMouse.y - this.currentMouse.y) < 5) {
						this.swiperEditMode();
					}
				}, 300);
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
					this.structure.roomComponents(this.containers[i]),
					this.containers[i],
					false
				);
			});

			// getting initial roomEdit state
			if (this.settings.modes.roomEdit) {
				this.editingEnabled = true;
			}
			// detecting mode changes in room edit
			this.modeSubscriber = this.settings.modeSub.subscribe(next => {
				if (this.settings.modes.roomEdit) {
					this.editingEnabled = true;
				} else {
					this.editingEnabled = false;
					this.slides.lockSwipes(false);
					// removing grid on all swiper views
					this.looper((i) => {
						this.createComponent.removeSingleComponent('GridComponent', this.containers[i]);
					});
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

	public getSliderIndex() {
		// getting the current index
		this.slides.getActiveIndex().then((index) => {
			this.sliderIndex = index - 1;
			if (this.editingEnabled) {
				this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
				this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
					container: this.containers[index]
				});
			}
		});
	}

	private roomEditMode() {
		// switch back to room edit mode
		this.editingEnabled = true;
		// remove grid on outside click and switch back to normal edit mode
		// removing createcomponent for swiper
		this.createComponent.removeSingleComponent('EditComponentComponent', this.createComponent.currentRoomContainer);
		// adding createcomponent for room
		this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
			container: this.createComponent.currentRoomContainer
		});
		// removing grid on all swiper views
		this.looper((i) => {
			this.createComponent.removeSingleComponent('GridComponent', this.containers[i]);
		});
		// adding grid back to room
		this.createComponent.createSingleComponent('GridComponent', this.createComponent.currentRoomContainer, {
			container: this.createComponent.currentRoomContainer
		});
	}

	private swiperEditMode() {
		// switch to swiper edit mode
		this.editingEnabled = false;
		this.slides.lockSwipes(true);
		// removing grid on room
		this.createComponent.removeSingleComponent('GridComponent', this.createComponent.currentRoomContainer);
		// removing createComponent
		this.createComponent.removeSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer);

		// building grid on all slider views
		this.looper((i) => {
			this.createComponent.createSingleComponent('GridComponent', this.containers[i], {
				container: this.containers[i]
			});
		});

		this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
			container: this.containers[this.sliderIndex]
		});
	}

	public resizeSlides() {
		setTimeout(() => this.slides.update(), 100);
	}

	private removeFhemComponents() {
		// removing fhem components in slider from view
		this.looper((i) => {
			const sliderComponents = this.helper.find(this.structure.rooms[this.roomID].components, 'ID', this.ID).item.attributes.components[i];
			for (let j = 0; j < sliderComponents.length; j++) {
				this.createComponent.removeFhemComponent(sliderComponents[j].ID);
				this.containers[i].clear();
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
