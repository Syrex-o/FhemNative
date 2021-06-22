import { Component, Input, NgModule, OnInit, OnDestroy, ViewChild, ViewContainerRef, ViewChildren, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';

// Components
import { IonicModule } from '@ionic/angular';
import { IconModule } from '../../icon/icon.component';
import { FhemComponentModule } from '../fhem-component.module';

// Directives
import { GrouperModule } from '@FhemNative/directives/grouper.directive';
import { OutsideClickModule } from '@FhemNative/directives/outside-click.directive';

// Services
import { SettingsService } from '../../../services/settings.service';
import { StructureService } from '../../../services/structure.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

// Interfaces
import { ComponentSettings, DynamicComponentDefinition } from '../../../interfaces/interfaces.type';

@Component({
	selector: 'fhem-tabs',
	templateUrl: './fhem-tabs.component.html',
	styleUrls: ['./fhem-tabs.component.scss']
})
export class FhemTabsComponent implements OnInit, OnDestroy {
	// containers
	@ViewChildren('container', { read: ViewContainerRef }) containers!: QueryList<ViewContainerRef>;
	// edit change
	private editSub!: Subscription;

	@Input() ID!: string;
	@Input() data_pages!: string;
	@Input() data_borderRadius!: string;
	@Input() data_borderRadiusTopLeft!: string;
	@Input() data_borderRadiusTopRight!: string;
	@Input() data_borderRadiusBottomLeft!: string;
	@Input() data_borderRadiusBottomRight!: string;
	@Input() arr_data_style!: string[];
	@Input() arr_data_tabPosition!: string[];

	// Styling
	@Input() arr_style_iconColors!: string|string[];
	@Input() arr_style_iconOnColors!: string|string[];
	@Input() arr_style_backGroundColors!: string|string[];

	// Icons
	@Input() arr_icon_icons!: string|string[];

	@Input() bool_data_customBorder!: boolean;
	@Input() bool_data_customIconColors!: boolean;

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	// tab pages
	pages: number[] = [];
	activePage: number = 0;
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
			this.currentContainer = (this.containers as any)[0];
			// assign active page
			this.activePage = 0;
			// load components
			this.containers.forEach((container)=>{
				const tabComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(container);
				if(tabComponents){
					this.componentLoader.loadRoomComponents(tabComponents, container, false);
				}
			});
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

	editTabs(): void{
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

	endTabsEdit(): void{
		// unsubscribe
		if(this.editSub){
			this.editSub.unsubscribe();
		}
		// revert back to last container
		this.componentLoader.currentContainerSub.next({ID: this.ID, action: 'remove'});
	}

	// change the selected tab
	switchTab(index: number): void{
		if(index !== this.activePage){
			this.currentContainer = (this.containers as any)[index];
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

	outsideClick(target: HTMLElement): void{
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
			const tabComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(container);
			if(tabComponents){
				tabComponents.forEach((component: DynamicComponentDefinition)=>{
					if(component.ID) this.componentLoader.removeDynamicComponent(component.ID);
				});
			}
		});
		// unsubscribe
		if(this.editSub) this.editSub.unsubscribe();
	}

	constructor(
		public settings: SettingsService,
		private structure: StructureService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Tabs',
			type: 'style',
			container: 'multi',
			inputs: [
				{variable: 'data_pages', default: '3'},
				{variable: 'data_borderRadius', default: '5'},
				{variable: 'data_borderRadiusTopLeft', default: '5'},
				{variable: 'data_borderRadiusTopRight', default: '5'},
				{variable: 'data_borderRadiusBottomLeft', default: '5'},
				{variable: 'data_borderRadiusBottomRight', default: '5'},
				{variable: 'arr_icon_icons', default: 'add-circle,add-circle,add-circle'},
				{variable: 'arr_data_style', default: 'standard,NM-standard'},
				{variable: 'arr_data_tabPosition', default: 'top,right,bottom,left'},
				{variable: 'arr_style_backGroundColors', default: '#58677C,#58677C,#58677C'},
				{variable: 'arr_style_iconColors', default: '#2ec6ff,#2ec6ff,#2ec6ff'},
				{variable: 'arr_style_iconOnColors', default: '#2ec6ff,#2ec6ff,#2ec6ff'},
				{variable: 'bool_data_customBorder', default: false},
				{variable: 'bool_data_customIconColors', default: false},
			],
			dependencies: {
				data_borderRadius: { dependOn: 'bool_data_customBorder', value: false },
				data_borderRadiusTopLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusTopRight: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomLeft: { dependOn: 'bool_data_customBorder', value: true },
				data_borderRadiusBottomRight: { dependOn: 'bool_data_customBorder', value: true },

				arr_style_backGroundColors: { dependOn: 'arr_data_style', value: 'standard' },
				arr_style_iconOnColors: { dependOn: 'bool_data_customIconColors', value: true }
			},
			dimensions: {minX: 100, minY: 100}
		};
	}
}
@NgModule({
	imports: [
		IconModule,
		IonicModule,
		GrouperModule,
		OutsideClickModule,
		FhemComponentModule
	],
	declarations: [FhemTabsComponent]
})
class FhemTabsrComponentModule {}