import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef, ViewChildren, QueryList, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

// Components
import { IonicModule, IonSlides } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';

// Directives
import { GrouperModule } from '@FhemNative/directives/grouper.directive';
import { OutsideClickModule } from '@FhemNative/directives/outside-click.directive';

// Services
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

// Interfaces
import { ComponentSettings, DynamicComponentDefinition  } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-swiper',
	templateUrl: './fhem-swiper.component.html',
  	styleUrls: ['./fhem-swiper.component.scss']
})
export class FhemSwiperComponent implements OnInit, OnDestroy {
	// slides container
	@ViewChild( IonSlides, { static: true } ) slides!: IonSlides;
	@ViewChildren('container', { read: ViewContainerRef }) containers!: QueryList<ViewContainerRef>;
	// edit change
	private editSub!: Subscription;

	@Input() ID!: string;
	@Input() data_headline!: string;
	@Input() data_pages!: string;
	@Input() data_borderRadius!: string;

	@Input() data_customHeaders!: string;

	@Input() arr_data_orientation!: string|string[];
	@Input() arr_data_style!: string[];

	@Input() bool_data_showBorder!: boolean;
	@Input() bool_data_showPager!: boolean;
	@Input() bool_data_customHeaders!: boolean;

	// Styling
	@Input() style_headerColor!: string;
	@Input() style_backgroundColor!: string;
	@Input() style_pagerOffColor!: string;
	@Input() style_pagerOnColor!: string;

	@Input() arr_style_customHeaderBackgrounds!: string[];
	@Input() arr_style_customHeaderColors!: string[];

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	// swiper pages
	pages: number[] = [];
	// current swiper container
	private currentContainer: any;
	showEditButton: boolean = false;
	customHeaders: string[] = [];

	// only enable swiping if content is selected
	@HostListener('document:touchstart', ['$event.target'])
	@HostListener('document:mousedown', ['$event.target'])
	onMouseDown(target: HTMLElement) {
		if(target.className.match(/content|grid/)){
			// unlock slides
			this.slides.lockSwipes(false);
		}else{
			// lock slides
			this.slides.lockSwipes(true);
		}
	}

	ngOnInit(){
		// custom headers
		if(this.bool_data_customHeaders){
			this.customHeaders = this.data_customHeaders.split(',');
		}
		// get swiper pages
		// formatting pages integer to array
		for (let i = 0; i < parseInt(this.data_pages); i++) {
			this.pages.push(i);
		}

		setTimeout(()=>{
			// building views
			this.containers = this.containers.toArray() as any;
				// assign current container in swiper
			this.currentContainer = (this.containers as any)[0];
			// load components
			this.containers.forEach((container)=>{
				const swiperComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(container);
				if(swiperComponents){
					this.componentLoader.loadRoomComponents(swiperComponents, container, false);
				}
			});
			if(this.bool_data_showPager){
				// swiper style
				setTimeout(()=>{
					// attatch
					this.dynamicSwiperStyle();
				}, 200);
			}
		});

		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
	}

	private createGrid(): void{
		if(this.structure.canEditContainer(this.ID)){
			this.componentLoader.createSingleComponent('GridComponent', this.currentContainer, {
				container: this.currentContainer
			});
		}
	}

	private removeGrid(): void{
		this.componentLoader.removeDynamicComponent('GridComponent');
	}

	editSwiper(): void{
		// assign new current container
		this.componentLoader.currentContainerSub.next({ID: this.ID,action: 'add',container: this.currentContainer});
		// subscribe to room edit Changes
	  	this.editSub = this.settings.modeSub.subscribe(next =>{
	  		if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
				if(this.settings.modes.roomEdit && this.showEditButton){
					this.createGrid();
					// remove edit button
					this.showEditButton = false;
				}else{
					this.removeGrid();
					// unlock slides
					this.slides.lockSwipes(false);
					// add edit button
					this.showEditButton = true;
					// remove helpers
					this.endSwiperEdit();
				}
			}
		});
		// assign edit properties
		this.settings.modeSub.next({roomEditFrom: this.ID});
	}

	dynamicSwiperStyle(): void{
		if(this.bool_data_showPager){
			this.ref.nativeElement.querySelectorAll('.swiper-pagination-bullet').forEach((elem: HTMLElement)=>{
				if(elem) elem.style.background = this.style_pagerOffColor;
			});	
			this.ref.nativeElement.querySelector('.swiper-pagination-bullet-active').style.background = this.style_pagerOnColor;
		}
	}

	private endSwiperEdit(): void{
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		// revert back to last container
		this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
	}

	changeSliderContainer(): void{
		// getting the current index
		this.slides.getActiveIndex().then((index: number) => {
			this.currentContainer = (this.containers as any)[index];
			// change container stack if editing
			if(!this.showEditButton && this.settings.app.enableEditing && this.settings.modes.roomEdit){
				// create grid 
				// old one is auto removed
				this.createGrid();
				// change container stack
				this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
				this.componentLoader.currentContainerSub.next({ID: this.ID,action: 'add',container: this.currentContainer});
			}
		});
	}

	outsideClick(target: HTMLElement){
		if(!this.showEditButton && this.settings.app.enableEditing && this.settings.modes.roomEdit){
			if(target.className.indexOf('content') !== -1){
				// end edit
				this.endSwiperEdit();
				// unlock slides
				this.slides.lockSwipes(false);
				// add edit button
				this.showEditButton = true;
				// revert back to last edit container
				this.settings.modeSub.next({roomEditFrom: this.componentLoader.containerStack[this.componentLoader.containerStack.length -1].ID});
			}
		}
	}

	ngOnDestroy(){
		this.containers.forEach((container)=>{
			const swiperComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(container);
			if(swiperComponents){
				swiperComponents.forEach((component: DynamicComponentDefinition)=>{
					if(component.ID) this.componentLoader.removeDynamicComponent(component.ID);
				});
			}
		});
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
	}

	constructor(
		private ref: ElementRef,
		public settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Swiper',
			type: 'style',
			container: 'multi',
			inputs: [
				{variable: 'data_headline', default: ''},
				{variable: 'data_pages', default: '3'},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_customHeaders', default: ''},
				{variable: 'bool_data_showBorder', default: true},
				{variable: 'bool_data_showPager', default: true},
				{variable: 'bool_data_customHeaders', default: false},
				{variable: 'arr_data_orientation', default: 'horizontal,vertical'},
				{variable: 'arr_data_style', default: 'standard,NM-IN-standard,NM-OUT-standard'},
				{variable: 'style_headerColor', default: '#434E5D'},
				{variable: 'style_backgroundColor', default: '#58677C'},
				{variable: 'style_pagerOffColor', default: '#cccccc'},
				{variable: 'style_pagerOnColor', default: '#3880ff'},
				{variable: 'arr_style_customHeaderBackgrounds', default: '#58677C,#58677C,#58677C'},
				{variable: 'arr_style_customHeaderColors', default: '#434E5D,#434E5D,#434E5D'}
			],
			dependencies: {
				bool_data_showBorder: { dependOn: 'arr_data_style', value: 'standard' },
				style_headerColor: { dependOn: 'arr_data_style', value: 'standard' },
				style_backgroundColor: { dependOn: 'arr_data_style', value: 'standard' },
				style_pagerOffColor: { dependOn: 'bool_data_showPager', value: true },
				style_pagerOnColor: { dependOn: 'bool_data_showPager', value: true },
				// custom headers
				data_customHeaders: { dependOn: 'bool_data_customHeaders', value: true },
				arr_style_customHeaderBackgrounds: { dependOn: 'bool_data_customHeaders', value: true },
				arr_style_customHeaderColors: { dependOn: 'bool_data_customHeaders', value: true }
			},
			dimensions: {minX: 60, minY: 60}
		};
	}
}
@NgModule({
	imports: [
		IonicModule, 
		GrouperModule,
		OutsideClickModule,
		FhemComponentModule
	],
  	declarations: [FhemSwiperComponent]
})
class FhemSwiperComponentModule {}