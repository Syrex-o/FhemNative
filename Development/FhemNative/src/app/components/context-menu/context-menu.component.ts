import { Component, Input, NgModule, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// interfaces
import { DynamicComponentDefinition } from '../../interfaces/interfaces.type';

// Components
import { ComponentsModule } from '../components.module';

// Services
import { LoggerService } from '../../services/logger/logger.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { ComponentLoaderService } from '../../services/component-loader.service';
import { SelectComponentService } from '../../services/select-component.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { FileManagerService } from '../../services/file-manager.service';
import { ToastService } from '../../services/toast.service';

// Translate
import { TranslateService } from '@ngx-translate/core';

// Animation
import { PopupPicker } from '../../animations/animations';

@Component({
	selector: 'context-menu',
	templateUrl: './context-menu.component.html',
  	styleUrls: ['./context-menu.component.scss'],
  	animations: [ PopupPicker ]
})
export class ContextMenuComponent implements OnInit {
	// context-menu ref
	@ViewChild('CONTEXT_MENU', { static: false, read: ElementRef }) contextMenu: ElementRef;
	// Inputs of position
	@Input() x: number;
	@Input() y: number;
	// source Input
	@Input() source: string;
	// component ID
	@Input() componentID: string;

	// show details
	show: any = {
		contextMenu: false,
		componentDetails: {
			show: false
		}
	}

	constructor(
		private logger: LoggerService,
		public structure: StructureService,
		public settings: SettingsService,
		public selectComponent: SelectComponentService,
		public componentLoader: ComponentLoaderService,
		public translate: TranslateService,
		private undoManager: UndoRedoService,
		private fileManager: FileManagerService,
		private toast: ToastService){
	}

	ngOnInit(){
		// remove selected elements outside of current container
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, false);
		// calc position of the menu
		setTimeout(() => {
			const menu: HTMLElement = this.contextMenu.nativeElement;
			// get the base container
			const container: ClientRect = this.componentLoader.containerStack[0].container.element.nativeElement.parentNode.getBoundingClientRect();
			let x: number = 0; let y: number = 0;
			if (this.x + menu.clientWidth >= container.width) {
				const menuOverlap = container.width - (menu.getBoundingClientRect().left + menu.clientWidth + 10);
				x = menuOverlap;
			}
			if (this.y + menu.clientHeight >= container.height) {
				const menuOverlap = container.height - (menu.getBoundingClientRect().top + menu.clientHeight + 10);
				y = menuOverlap;
			}
			menu.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';
			// show menu
			this.show.contextMenu = true;
		});
	}

	// edit a selected component
	toggleComponentSettings(): void{
		// create edit menu at base level
		// pass current container
		this.componentLoader.createSingleComponent('CreateEditComponent', this.componentLoader.containerStack[0].container, {
			container: this.componentLoader.currentContainer,
			type: 'edit',
			componentID: this.componentID
		});
		this.removeContextMenu();
	}

	// component details
	toggleComponentDetails(): void{
		// toggle menu
		this.show.componentDetails.show = !this.show.componentDetails.show;
		if(this.show.componentDetails.show){
			// get component
			const component: DynamicComponentDefinition|null = this.structure.getComponent(this.componentID);
			this.show.componentDetails.component = {
				ID: this.componentID,
				name: component.name
			}
			// fhem userAttr info
			let attrValue: {[key: string]: string} = {long: '', short: ''};

			let giveText = (attr: string, key: string, val: any) =>{
				attrValue[attr] += val.attr.replace(key.replace('attr_', '')+'_', '') + ':' + ( Array.isArray(val.value) ? val.value[0] : val.value ) + ';';
			}
			// get default component
			this.componentLoader.getFhemComponentData(component.name).then((componentDefault)=>{
				let defaultComp: any = componentDefault;
				// loop the default component
				for(const key of Object.keys(defaultComp.attributes)){
					defaultComp.attributes[key].forEach((defaultEntry: {attr: string, value: any})=>{
						// get the user defined entry
						let definedEntry = component.attributes[key].find(x=> x.attr === defaultEntry.attr);
						if(definedEntry){
							// defined entry
							if(definedEntry.attr !== 'data_device'){
								giveText('long', key, definedEntry);
								// compare to default
								if(
									(Array.isArray(definedEntry.value) ? definedEntry.value[0] : definedEntry.value) !== 
									(Array.isArray(defaultEntry.value) ? defaultEntry.value[0] : defaultEntry.value)
								){
									giveText('short', key, definedEntry);
								}
							}
						}else{
							// new default entry
							giveText('long', key, defaultEntry);
						}
					});
				}
			});
			this.show.componentDetails.fhem = {
				userAttr: 'FhemNative_'+component.name.replace(' ', ''),
				value: attrValue
			};
			// room info
			this.show.componentDetails.room = {
				ID: this.structure.currentRoom.ID,
				UID: this.structure.currentRoom.UID,
				name: this.structure.currentRoom.name
			};
		}
	}

	// export component selection
	exportComponents(): void{
		// allow dirty selection for pinned components
		if(this.componentID){
			this.selectComponent.buildCopySelectorForRelevant(this.componentID, false, true);
		}
		let components: DynamicComponentDefinition[] = JSON.parse(JSON.stringify(this.selectComponent.selectorList));

		// remove unneded information for export
		components.forEach((component: DynamicComponentDefinition)=>{
			if(component.dependencies){
				delete component.dependencies;
			}
			if('pinned' in component){
				delete component.pinned;
			}
		});
		// create file
		this.fileManager.writeFile('FhemNative_ComponentExport.json', JSON.stringify(components)).then((data: any)=>{
			this.toast.showAlert(
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.EXPORT_COMPONENT.SUCCESS.TITLE'),
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.EXPORT_COMPONENT.SUCCESS.INFO') + data.dir + '/' + data.name,
				false
			);
		}).catch((err) => {
			this.toast.showAlert(
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.EXPORT_COMPONENT.ERROR.TITLE'),
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.EXPORT_COMPONENT.ERROR.INFO'),
				false
			);
		});

		// remove selection
		setTimeout(()=>{
			this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
		}, 300);
	}

	// import component selection from file
	async importComponents(): Promise<any>{
		const data: any = await this.fileManager.readFile();
		let isValid: boolean = false;
		if(data){
			// validate
			if(Array.isArray(data)){
				let allValid: boolean = true;
				// simple check if all components are in FhemNative
				for(const component of data){
					if(!component.name || !this.componentLoader.fhemComponents.find(x=> x.name === component.name)){
						allValid = false;
						break;
					}
				}
				if(allValid){
					isValid = true;
					// get min left and top prop
					const minLeft: number = Math.min.apply(Math, data.map(x=> parseInt(x.position.left)));
					const minTop: number = Math.min.apply(Math, data.map(x=> parseInt(x.position.top)));
					// build new ID for every nested component
					this.structure.modifyComponentList(data, (mod)=>{
						mod.ID = '_' + Math.random().toString(36).substr(2, 9);
					});

					// define place for component
					const place = this.structure.getComponentContainer(this.componentLoader.currentContainer);
					// modify top/left
					data.forEach((component)=>{
						component.position.left = (parseInt(component.position.left) - minLeft) + 'px';
						component.position.top = (parseInt(component.position.top) - minTop) + 'px';
						// push to structure
						place.push(component);
						// adding the new component to the current view
						this.componentLoader.loadRoomComponents([component], this.componentLoader.currentContainer, false).then(()=>{
							// assign selector to new component
							setTimeout(()=>{
								this.selectComponent.buildCopySelector(component.ID, false);
							});
						})
					});
					// logging
					this.logger.info('Components imported');
					// add as change event
					this.saveComp();
				}
			}
		}
		// show message
		if(isValid){
			this.toast.showAlert(
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.IMPORT_COMPONENT.SUCCESS.TITLE'),
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.IMPORT_COMPONENT.SUCCESS.INFO'),
				false
			);
		}else{
			this.toast.showAlert(
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.IMPORT_COMPONENT.ERROR.TITLE'),
				this.translate.instant('GENERAL.EDIT_COMPONENT.MENU.IMPORT_COMPONENT.ERROR.INFO'),
				false
			);
		}
	}

	// pin/unpin component --> block component movement
	pinComponent(): void{
		let pinner = (comp): void =>{
			if(comp.pinned){
				document.getElementById(comp.ID).classList.add('pinned');
				// remove the copy selector
				this.selectComponent.removeCopySelector(comp.ID);
			}else{
				document.getElementById(comp.ID).classList.remove('pinned');
			}
		};
		// get the component
		const component = this.structure.getComponent(this.componentID);
		if('pinned' in component){
			component.pinned = !component.pinned;
		}else{
			component['pinned'] = true;
		}
		pinner(component);

		// detect grouping and modify pinning
		const isGrouped = this.selectComponent.isGrouped(component.ID);
		// assign pinning to all selected components
		this.selectComponent.selectorList.map(x=> x.ID).forEach((id)=>{
			let comp = this.structure.getComponent(id);
			comp['pinned'] = component['pinned'];
			pinner(comp);
		});
		
		if(isGrouped){
			this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group].forEach((id)=>{
				let comp = this.structure.getComponent(id);
				comp['pinned'] = component['pinned'];
				pinner(comp);
			});
		}
	}

	// detect pinned component
	private isPinned(ID: string): boolean{
		// get the component
		const component = this.structure.getComponent(this.componentID);
		if('pinned' in component){
			if(component.pinned){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}

	// send component to from/back
	sendTo(param: string): void{
		const component: DynamicComponentDefinition = this.structure.getComponent(this.componentID);
		const roomComponents = this.structure.getComponentContainer(this.componentLoader.currentContainer);
		
		if(param == 'back'){
			// change z-index of all other components
			roomComponents.forEach((component: DynamicComponentDefinition, i: number)=>{
				if (this.componentID !== component.ID) {
					let changedIndex: number = component.position.zIndex;
					changedIndex = changedIndex > 1 ? changedIndex : changedIndex + 1;
					this.changeAttr(component.ID, 'zIndex', changedIndex);
				}
			});
			// set z-index to 1 of selected component
			this.changeAttr(component.ID, 'zIndex', 1);
		}else{
			// get z-index values
			const zIndex: number[] = [];
			roomComponents.forEach((component: DynamicComponentDefinition, i: number)=>{
				if (this.componentID !== component.ID) {
					let index: number = component.position.zIndex;
					zIndex.push(index);
				}
			});
			// change to max z-index + 1
			this.changeAttr(component.ID, 'zIndex', Math.max(...zIndex) + 1);
		}
		this.saveComp();
	}

	// select/unselect component 
	// respect groups
	markForSelection(): void{
		if(this.selectComponent.evalCopySelector(this.componentID)){
			// is selected, should be deselected
			this.selectComponent.buildCopySelectorForRelevant(this.componentID, true);
		}else{
			this.selectComponent.buildCopySelectorForRelevant(this.componentID);
		}
	}

	// copy component
	copyComp(): void{
		this.selectComponent.copyComponent( (this.componentID ? this.componentID : ''), this.componentLoader.currentContainer);
	}

	// paste component
	pasteComp(): void{
		// paste component
		this.selectComponent.pasteComponent(this.componentLoader.currentContainer);
		// save config
		this.saveComp();
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
	}

	// group components
	groupComponents(): void{
		this.selectComponent.groupComponents(this.componentID);
		// add to change stack
		this.undoManager.addChange();
	}

	// delete component
	compDelete(): void{
		const component = this.structure.getComponent(this.componentID);

		this.selectComponent.removeComponent(component ? component.ID : '');
		this.saveComp();
	}

	// remove context menu on outside click
	removeContextMenu(): void{
		this.componentLoader.removeDynamicComponent('ContextMenuComponent');
	}

	// change component attribute
	private changeAttr(ID: string, attr: string, value: any): void {
		const elem = this.componentLoader.findFhemComponent(ID);
		if (elem) {
			elem.REF.instance[attr] = value;
		}
	}

	// saving rooms
	private saveComp(): void {
		this.removeContextMenu();
		this.undoManager.addChange();
	}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
  	declarations: [ContextMenuComponent]
})
class ContextMenuComponentComponentModule {}