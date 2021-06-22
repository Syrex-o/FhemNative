import { Component, Input, NgModule, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Components
import { IconModule } from '../icon/icon.component';
import { PickerComponentModule } from '../picker/picker.component';
import { OutsideClickModule } from '../../directives/outside-click.directive';

// Components
import { QRCodeModule } from "angularx-qrcode";

// Services
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { StructureService } from '../../services/structure.service';
import { LoggerService } from '../../services/logger/logger.service';
import { BackButtonService } from '../../services/back-button.service';
import { ComponentLoaderService } from '../../services/component-loader.service';
import { SelectComponentService } from '../../services/select-component.service';

// interfaces
import { DynamicComponentDefinition, ComponentPosition } from '../../interfaces/interfaces.type';

// Animation
import { PopupPicker } from '../../animations/animations';

// Capacitor
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
	selector: 'context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.scss'],
	animations: [ PopupPicker ]
})
export class ContextMenuComponent implements AfterViewInit, OnDestroy {
	// context-menu ref
	@ViewChild('CONTEXT_MENU', { static: false, read: ElementRef }) contextMenu!: ElementRef;

	// Inputs of position
	@Input() x!: number;
	@Input() y!: number;
	// source Input
	@Input() source!: string;
	// component ID
	@Input() componentID!: string;
	// position of dropdowns
	dropDownPosition: string = 'right';
	// back button handle ID for qr
	private handleID: string = this.settings.getUID();

	// show details
	show: any = {
		contextMenu: false,
		// sub menus
		align: false,
		arrange: false,
		export: false,
		import: false,
		select: false,
		// qr data
		qr: false,
		wrWidth: 0,
		qrData: '',
		componentDetails: {
			show: false
		}
	}

	constructor(
		private toast: ToastService,
		private logger: LoggerService,
		public settings: SettingsService,
		public structure: StructureService,
		public translate: TranslateService,
		private backBtn: BackButtonService,
		private undoManager: UndoRedoService,
		public selectComponent: SelectComponentService,
		public componentLoader: ComponentLoaderService){}

	ngAfterViewInit(){
		setTimeout(()=>{
			// remove selected elements outside of current container
			this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, false);
			const menu: HTMLElement = this.contextMenu.nativeElement;
			// get the base container
			const container: ClientRect = this.componentLoader.containerStack[0].container.element.nativeElement.parentNode.getBoundingClientRect();
			// check dropdown position
			if (this.x + (menu.clientWidth / 2) > (container.width / 2)) {
				this.dropDownPosition = 'left';
			}
			let x: number = 0; let y: number = 0;
			if (this.x + menu.clientWidth >= container.width) {
				const menuOverlap: number = container.width - (menu.getBoundingClientRect().left + menu.clientWidth + 10);
				x = menuOverlap;
			}
			if (this.y + menu.clientHeight >= container.height) {
				const menuOverlap: number = container.height - (menu.getBoundingClientRect().top + menu.clientHeight + 10);
				y = menuOverlap;
			}

			menu.style.transform = 'translate3d(' + x + 'px,' + y + 'px, 0)';

			// check for enough space for dropdown
			const menuPos: number = menu.getBoundingClientRect().left;
			if(this.dropDownPosition === 'left'){
				const delta:  number = menu.clientWidth - menuPos;
				if(delta > 0){
					menu.style.transform = 'translate3d(' + (x + delta) + 'px,' + y + 'px, 0)';
				}
			}else{
				const delta:  number = container.width - (menuPos + menu.clientWidth * 2);
				if(delta < 0){
					menu.style.transform = 'translate3d(' + (x - Math.abs(delta)) + 'px,' + y + 'px, 0)';
				}
			}

			// show menu
			this.show.contextMenu = true;
			// make sure component is selected, when menu opens
			if(this.componentID){
				this.selectComponent.buildCopySelectorForRelevant(this.componentID, false);
			}
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
		this.removeContextMenu(false);
	}

	// component details
	toggleComponentDetails(): void{
		// toggle menu
		this.show.componentDetails.show = !this.show.componentDetails.show;
		if(this.show.componentDetails.show){
			// get component
			const component: DynamicComponentDefinition|null = this.structure.getComponent(this.componentID);
			if(component){
				let componentAttributes: any = component.attributes;
				this.show.componentDetails.component = {ID: this.componentID, name: component.name};
				// fhem userAttr info
				let attrValue: {[key: string]: string} = {long: '', short: ''};

				let giveText = (attr: string, key: string, val: any): void =>{
					attrValue[attr] += val.attr.replace(key.replace('attr_', '')+'_', '') + ':' + ( Array.isArray(val.value) ? val.value[0] : val.value ) + ';';
				}
				// get default component
				this.componentLoader.getFhemComponentData(component.name).then((componentDefault: DynamicComponentDefinition)=>{
					let defaultComp: DynamicComponentDefinition = componentDefault;
					let defaultCompAttributes: any = defaultComp.attributes;
					// loop the default component
					for(const key of Object.keys(defaultComp.attributes)){
						defaultCompAttributes[key].forEach((defaultEntry: {attr: string, value: any})=>{
							// get the user defined entry
							let definedEntry = componentAttributes[key].find((x: any)=> x.attr === defaultEntry.attr);
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
	}

	toggleSubMenu(menu: string, onOpenOnly?: boolean): void{
		if(onOpenOnly){
			if(this.show[menu]){
				this.show[menu] = false;
			}
		}else{
			setTimeout(()=>{
				this.show[menu] = !this.show[menu];
			}, 0);
		}
	}

	// export component selection
	exportComponents(asType: string): void{
		// allow dirty selection for pinned components
		if(this.componentID){
			this.selectComponent.buildCopySelectorForRelevant(this.componentID, false, true);
		}
		let components: DynamicComponentDefinition[] = JSON.parse(JSON.stringify(this.selectComponent.selectorList));
		// remove unneded information for export
		components.forEach((component: DynamicComponentDefinition)=>{
			component = this.structure.removeNotNeededComponentParts(component);
			// pinned is not used in export/import
			if('pinned' in component) delete component.pinned;
		});

		if(asType === 'qr'){
			// minify component
			components.forEach((component: DynamicComponentDefinition, index: number)=>{
				// get default component
				this.componentLoader.getFhemComponentData(component.name).then((componentDefault: DynamicComponentDefinition)=>{
					component = this.structure.getMinifiedComponent(component, componentDefault);
					if(index === components.length -1){
						this.show.qrData = JSON.stringify(components);
						// min size --> height is only 80% (pciker size) (45 picker header size)
						const size = Math.min(window.innerWidth, (window.innerHeight * 0.8) - 45);
						this.show.qrWidth = size - 20;
						this.show.qr = true;
					}
				});
			});
		}else{
			// minify component
			components.forEach((component: DynamicComponentDefinition, index: number)=>{
				// get default component
				this.componentLoader.getFhemComponentData(component.name).then((componentDefault: DynamicComponentDefinition)=>{
					component = this.structure.getMinifiedComponent(component, componentDefault);
					if(index === components.length -1){
						// mobile fallback to display for copy
						this.toast.showAlert(
							this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_MOBILE_TITLE'),
							this.translate.instant('GENERAL.DICTIONARY.SETTINGS_SAVED_MOBILE_INFO'),
							{
								inputs: [{
									name: 'mobile-for-copy',
									type: 'textarea',
									value: JSON.stringify(components)
								}],
								buttons: [{text: this.translate.instant('GENERAL.BUTTONS.CLOSE'), role: 'cancel'}]
							}
						);
						this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
					}
				});
			});
		}
	}

	// import component data (qr/file)
	private importComponentData(data: any): void{
		let isValid: boolean = false;

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
				this.structure.modifyComponentList(data, (mod: any)=>{
					mod.ID = '_' + Math.random().toString(36).substr(2, 9);
				});

				// define place for component
				const place: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(this.componentLoader.currentContainer);
				if(place){
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
							}, 0);
						});
					});
					// logging
					this.logger.info('Components imported');
					// add as change event
					this.saveComp();
				}else{
					isValid = false;
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

	// import from file
	async importFromFile(event: any): Promise<void>{
		if(event && event.target && event.target.files){
			const file: File = event.target.files[0];
			if(file){
				const fileReader = new FileReader();

				fileReader.onload = (e: any) => {
					const data: any = JSON.parse(fileReader.result as string);
					this.importComponentData(data);
				}
				fileReader.readAsText(file);
			}
		}
	}

	// import from qr
	async importFromQr(): Promise<any>{
		// reqest access
		let canScan: boolean = false;
		const status = await BarcodeScanner.checkPermission({ force: false });

		if(status.granted){
			canScan = true;
		}
		// redirect to settings
		if(status.denied || status.restricted || status.unknown) {
			this.toast.showAlert(
				this.translate.instant('GENERAL.SETTINGS.REQUESTS.DENY.HEADER'),
				this.translate.instant('GENERAL.SETTINGS.REQUESTS.DENY.INFO'),
				{
					buttons: [{
						text: this.translate.instant('GENERAL.BUTTONS.OKAY'), 
						handler: ()=>{ BarcodeScanner.openAppSettings(); }
					}]
				}
			);
		}else{
			// not denied
			if(status.neverAsked){
				const statusRequest = await BarcodeScanner.checkPermission({ force: true });
				if (statusRequest.granted) {
					canScan = true;
				}
			}
		}

		if(canScan){
			// hide content
			BarcodeScanner.hideBackground();
			document.body.classList.add("qrscanner");

			// back button should cancel camera
			this.backBtn.handle(this.handleID, ()=>{
				BarcodeScanner.showBackground();
				BarcodeScanner.stopScan();
				this.backBtn.removeHandle(this.handleID);
				document.body.classList.remove("qrscanner");
				return;
			});

			const result = await BarcodeScanner.startScan();
			document.body.classList.remove("qrscanner");

			if (result.hasContent) {
				this.backBtn.removeHandle(this.handleID);
				this.importComponentData(JSON.parse(result.content as string));
			}else{
				this.backBtn.removeHandle(this.handleID);
				this.importComponentData('');
			}
		}else{
			// error message
			this.importComponentData('');
		}
	}

	// pin/unpin component --> block component movement
	pinComponent(): void{
		let pinner = (comp: DynamicComponentDefinition): void =>{
			const el: HTMLElement|null = document.getElementById(comp.ID as string);
			if(el){
				if(comp.pinned){
					el.classList.add('pinned');
					// remove the copy selector
					this.selectComponent.removeCopySelector(comp.ID as string);
				}else{
					el.classList.remove('pinned');
				}
			}
		};
		// get the component
		const component: DynamicComponentDefinition|null = this.structure.getComponent(this.componentID);
		if(component){
			if('pinned' in component){
				component.pinned = !component.pinned;
			}else{
				component['pinned'] = true;
			}
			pinner(component);
			// detect grouping and modify pinning
			const isGrouped = this.selectComponent.isGrouped(component.ID as string);
			// assign pinning to all selected components
			this.selectComponent.selectorList.map(x=> x.ID as string).forEach((id: string)=>{
				let comp: DynamicComponentDefinition|null = this.structure.getComponent(id);
				if(comp){
					comp['pinned'] = component['pinned'];
					pinner(comp);
				}
			});
			if(isGrouped){
				this.structure.rooms[this.structure.currentRoom.ID]['groupComponents'][isGrouped.group].forEach((id: string)=>{
					let comp: DynamicComponentDefinition|null = this.structure.getComponent(id);
					if(comp){
						comp['pinned'] = component['pinned'];
						pinner(comp);
					}
				});
			}
		}
	}

	// send component to from/back
	sendTo(param: string): void{
		const component: DynamicComponentDefinition|null = this.structure.getComponent(this.componentID);
		const roomComponents: DynamicComponentDefinition[]|null = this.structure.getComponentContainer(this.componentLoader.currentContainer);
		if(component && roomComponents){
			if(param == 'back'){
				// change z-index of all other components
				roomComponents.forEach((component: DynamicComponentDefinition, i: number)=>{
					if (this.componentID !== component.ID && component.position) {
						let changedIndex: number = component.position.zIndex;
						changedIndex = changedIndex > 1 ? changedIndex : changedIndex + 1;
						this.changeAttr(component.ID as string, 'zIndex', changedIndex);
					}
				});
				// set z-index to 1 of selected component
				this.changeAttr(component.ID as string, 'zIndex', 1);
			}else{
				// get z-index values
				const zIndex: number[] = [];
				roomComponents.forEach((component: DynamicComponentDefinition, i: number)=>{
					if (this.componentID !== component.ID && component.position) {
						let index: number = component.position.zIndex;
						zIndex.push(index);
					}
				});
				// change to max z-index + 1
				this.changeAttr(component.ID as string, 'zIndex', Math.max(...zIndex) + 1);
			}
			this.saveComp();
		}
	}

	// arrange components (top/left/right/bottom)
	arrange(param: string){
		// loop selected components
		if(['top', 'left'].includes(param)){
			this.selectComponent.selectorList.forEach((component: DynamicComponentDefinition)=>{
				if(component.ID && component.position){
					// rotated components have to include rotation
					if(component.position.rotation){
						// get comp bounding
						const elem: HTMLElement|null = document.getElementById(component.ID);
						if(elem){
							const bounding: ClientRect = elem.getBoundingClientRect();
							const res: {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} = this.structure.getOffsets(elem);

							if(param === 'top'){
								const diff: number = bounding.top - res.offsets.top;
								const newTop: number = this.structure.roundToGrid(parseInt(component.position.top) - diff);
								this.changeAttr(component.ID, param, newTop + 'px');
							}else{
								const diff: number = bounding.left - res.offsets.left;
								const newLeft: number = this.structure.roundToGrid(parseInt(component.position.left) - diff);
								this.changeAttr(component.ID, param, newLeft + 'px');
							}
						}
					}else{
						this.changeAttr(component.ID, param, '0px');
					}
				}
			});
		}else{
			// get container
			this.selectComponent.selectorList.forEach((component: DynamicComponentDefinition)=>{
				if(component.ID && component.position){
					const elem: HTMLElement|null = document.getElementById(component.ID);
					if(elem){
						const res: {container: HTMLElement, offsets: { top: number, left: number, right: number, scroller: number }} = this.structure.getOffsets(elem);
						// rotated components have to include rotation
						if(component.position.rotation){
							const bounding: ClientRect = elem.getBoundingClientRect();
							if(param === 'right'){
								const diff: number = Math.abs(parseInt(component.position.left) - bounding.left);
								const newLeft: number = this.structure.roundToGrid( (res.container.clientWidth - bounding.width + res.offsets.left) - diff );

								this.changeAttr(component.ID, 'left', newLeft + 'px');
							}else{
								const diff: number = Math.abs(parseInt(component.position.top) - bounding.top);
								let newTop: number = (res.container.clientHeight - bounding.height) + res.offsets.top;
								newTop = this.structure.roundToGrid( newTop - diff);

								this.changeAttr(component.ID, 'top', newTop + 'px');
							}
						}else{
							if(param === 'right'){
								let left: number = res.container.clientWidth - parseInt(component.position.width);
								left = this.structure.roundToGrid(left);
								this.changeAttr(component.ID, 'left', left + 'px');
							}else{
								let top: number = res.container.clientHeight - parseInt(component.position.height);
								top = this.structure.roundToGrid(top);
								this.changeAttr(component.ID, 'top', top + 'px');
							}
						}
					}
				}
			});
		}
		this.saveComp();
	}

	// select/unselect component 
	// respect groups
	markForSelection(): void{
		if(this.selectComponent.evalCopySelector(this.componentID)){
			// is selected, should be deselected
			this.selectComponent.buildCopySelectorForRelevant(this.componentID, true);
			this.removeContextMenu(false);
		}else{
			this.selectComponent.buildCopySelectorForRelevant(this.componentID);
		}
	}

	// deselect all components
	deselectAllComponents(): void{
		this.selectComponent.removeContainerCopySelector(this.componentLoader.currentContainer, true);
		this.removeContextMenu(false);
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
		let removedAny: boolean = false;
		if(this.componentID){
			// make sure component is selected, when source is component on tap
			this.selectComponent.buildCopySelectorForRelevant(this.componentID, false);
		}
		this.selectComponent.selectorList.forEach((component: DynamicComponentDefinition)=>{
			this.selectComponent.removeComponent(component.ID as string);
			removedAny = true;
		});
		if(removedAny){
			this.saveComp();
		}
	}

	removeContextMenu(checkSubMenus: boolean, target?: any): void{
		if(checkSubMenus){
			const subMenus: string[] = ['align', 'import', 'export', 'qr', 'select', 'arrange'];
			let closed: boolean = false;
			for(let i: number = 0; i < subMenus.length; i++){
				if(this.show[subMenus[i]]){
					closed = true;
					this.show[subMenus[i]] = false;
				}
			}
			// if some submenu closed --> not remove contextMenu
			if(closed){
				// outside click event maybe outside of component
				// so build selector for component
				if(this.componentID){
					// check that target is not any component
					if(target && 'className' in target && !target.className.match(/(overlay-move|rect|rotatation-handle)/) ){
						this.selectComponent.buildCopySelectorForRelevant(this.componentID, true);
					}
				}
			}else{
				this.componentLoader.removeDynamicComponent('ContextMenuComponent');
			}
		}else{
			this.componentLoader.removeDynamicComponent('ContextMenuComponent');
		}
	}

	// change component attribute
	private changeAttr(ID: string, attr: any, value: any): void {
		// change attr in view
		const elem = this.componentLoader.findFhemComponent(ID);
		if (elem) {
			elem.REF.instance[attr] = value;
			// get elem in view
			const el: HTMLElement|null = document.getElementById(ID);
			if(el) el.style[attr] = value;
		}
		// change attr in component definition
		const component: DynamicComponentDefinition|null = this.structure.getComponent(ID);
		if(component && component.position){
			(component.position as any)[attr] = value;
		}
	}

	// saving rooms
	private saveComp(): void {
		this.removeContextMenu(false);
		this.undoManager.addChange();
	}

	ngOnDestroy(){
		this.backBtn.removeHandle(this.handleID);
	}
}
@NgModule({
	imports: [ 
		IconModule,
		FormsModule,
		IonicModule, 
		QRCodeModule, 
		CommonModule,
		TranslateModule,
		OutsideClickModule,
		PickerComponentModule
	],
	declarations: [ ContextMenuComponent ]
})
class ContextMenuComponentComponentModule {}