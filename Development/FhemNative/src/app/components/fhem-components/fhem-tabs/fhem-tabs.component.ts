import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

@Component({
	selector: 'fhem-tabs',
	templateUrl: './fhem-tabs.component.html',
  	styleUrls: ['./fhem-tabs.component.scss']
})
export class FhemTabsComponent implements OnInit, OnDestroy {
	// containers
	@ViewChildren('container', { read: ViewContainerRef }) containers: QueryList<ViewContainerRef>;
	// edit change
	private editSub: Subscription;

	@Input() ID: string;
	@Input() data_pages: string;

	// Styling
	@Input() arr_style_iconColors: string|string[];
	@Input() arr_style_backGroundColors: string|string[];

	// Icons
	@Input() arr_icon_icons: string|string[];


	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	// swiper pages
	pages: number[];
	activePage: number;
	// current swiper container
	private currentContainer: any;
	showEditButton: boolean = false;

	ngOnInit(){
		// get tabs pages
		// formatting pages integer to array
		this.pages = [];
		for (let i = 0; i < parseInt(this.data_pages); i++) {
			this.pages.push(i);
		}
		// load components
		setTimeout(()=>{
			// building views
			this.containers = this.containers.toArray() as any;
			// assign current container in swiper
			this.currentContainer = this.containers[0];
			// assign active page
			this.activePage = 0;
			// load components
			this.containers.forEach((container)=>{
				const swiperComponents = this.structure.getComponentContainer(container);
				if(swiperComponents){
					this.componentLoader.loadRoomComponents(swiperComponents, container, false);
				}
			});
		});
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
	}

	private createGrid(){
		if(this.structure.canEditContainer(this.ID)){
			this.componentLoader.createSingleComponent('GridComponent', this.currentContainer, {
				container: this.currentContainer
			});
		}
	}

	private removeGrid(){
		this.componentLoader.removeDynamicComponent('GridComponent');
	}

	editTabs(){
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
					// add edit button
					this.showEditButton = true;
					// remove helpers
					this.endTabsEdit();
				}
			}
	  	});
	  	// assign edit properties
		this.settings.modeSub.next({roomEditFrom: this.ID});
	}

	endTabsEdit(){
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		// revert back to last container
		this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
	}

	// change the selected tab
	switchTab(index: number){
		if(index !== this.activePage){
			this.currentContainer = this.containers[index];
			this.activePage = index;

			// change container stack if editing
			if(!this.showEditButton && this.settings.app.enableEditing && this.settings.modes.roomEdit){
				// create grid 
				// old one is auto removed
				this.createGrid();
				// change container stack
				this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
				this.componentLoader.currentContainerSub.next({ID: this.ID,action: 'add',container: this.currentContainer});
			}
		}	
	}

	outsideClick(target: HTMLElement){
		if(!this.showEditButton && this.settings.app.enableEditing && this.settings.modes.roomEdit){
			if(target.className.indexOf('content') !== -1){
				// end edit
				this.endTabsEdit();
				// add edit button
				this.showEditButton = true;
				// revert back to last edit container
				this.settings.modeSub.next({roomEditFrom: this.componentLoader.containerStack[this.componentLoader.containerStack.length -1].ID});
			}
		}
	}

	ngOnDestroy(){
		this.containers.forEach((container)=>{
			const swiperComponents = this.structure.getComponentContainer(container);
			if(swiperComponents){
				swiperComponents.forEach((component)=>{
					this.componentLoader.removeDynamicComponent(component.ID);
				});
			}
		});
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
	}


	constructor(
		public settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings() {
		return {
			name: 'Tabs',
			type: 'style',
			container: 'multi',
			inputs: [
				{variable: 'data_pages', default: '3'},
				{variable: 'arr_icon_icons', default: 'add-circle,add-circle,add-circle'},
				{variable: 'arr_style_backGroundColors', default: '#58677C,#58677C,#58677C'},
				{variable: 'arr_style_iconColors', default: '#2ec6ff,#2ec6ff,#2ec6ff'}
			],
			dimensions: {minX: 100, minY: 100}
		};
	}
}
@NgModule({
	imports: [ComponentsModule, IonicModule],
  	declarations: [FhemTabsComponent]
})
class FhemTabsrComponentModule {}