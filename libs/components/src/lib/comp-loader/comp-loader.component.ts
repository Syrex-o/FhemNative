import { AfterContentChecked, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { map, of } from 'rxjs';

import { GridComponent } from '../grid/grid.component';
import { ComponentLoaderService, EditorService, LoaderService, StructureService, UndoRedoService } from '@fhem-native/services';

import { BaseComponentPosition, ComponentTransformation, ContainerRegistry, FhemComponentSettings } from '@fhem-native/types/components';

@Component({
	selector: 'fhem-native-component-loader',
	templateUrl: './comp-loader.component.html',
	styleUrls: ['./comp-loader.component.scss']
})

export class ComponentLoaderComponent implements AfterViewInit, AfterContentChecked, OnDestroy{
	@ViewChild(GridComponent) grid: GridComponent|undefined;
	@ViewChild('Container', {read: ViewContainerRef}) componentContainer: ViewContainerRef|undefined;

	@Input() containerId: string|undefined;
	@Input() components: FhemComponentSettings[] = [];

	// Events
	@Output() beginTransformationAny: EventEmitter<ComponentTransformation[]> = new EventEmitter<ComponentTransformation[]>();
	@Output() endTransformationAny: EventEmitter<ComponentTransformation[]> = new EventEmitter<ComponentTransformation[]>();

	private containerRegistry: ContainerRegistry|undefined;

	public coreEditor$ = this.editor.core.getMode();
	public showGrid$ = of(false);

	constructor(
		private cdr: ChangeDetectorRef,
		private editor: EditorService,
		private loader: LoaderService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private compLoader: ComponentLoaderService){
	}

	onScroll(): void{
		if(this.grid) this.grid.updateHeight();
	}

	ngAfterViewInit(): void{
		// get grid visibility --> ViewContainerRef is not available before
		this.showGrid$ = this.coreEditor$.pipe( map(x=> x.editComponents && x.editFrom === this.containerId && this.componentContainer !== undefined ));

		this.loader.showLoader();
		// be sure, to only create container with valid ID
		if(this.containerId && this.componentContainer){
			// attatch container to registry
			this.containerRegistry = this.compLoader.addContainerRegistry(this.containerId, this.componentContainer);
			// load components to container
			this.compLoader.loadContainerComponents(this.components, this.containerRegistry);
		}
		this.loader.hideLoader();
	}

	// prevent: Expression has changed after it was checked
	// containers may be created/deleted on undo/redo --> could cause errors without another check
	ngAfterContentChecked(): void {
		this.cdr.detectChanges();
	}

	onBeginTransformationAny(transformations: ComponentTransformation[]): void{
		this.beginTransformationAny.emit(transformations);
	}

	onEndTransformationAny(transformations: ComponentTransformation[]): void{
		this.checkForComponentChanges(transformations);

		this.endTransformationAny.emit(transformations);
	}

	private checkForComponentChanges(transformations: ComponentTransformation[]): void{
		// check if any component was changed
		let changedAny = false;
		// check all components
		for(const transformation of transformations){
			const componentConfig = this.structure.getComponent(transformation.componentUID);
			if(!componentConfig) continue;

			const compPosition = (componentConfig as FhemComponentSettings).position;
			const comparePosition: BaseComponentPosition = { top: compPosition.top, left: compPosition.left, width: compPosition.width, height: compPosition.height };

			// check for change
			if(JSON.stringify(comparePosition) !== JSON.stringify(transformation.position)) changedAny = true;
			// apply updated position
			(componentConfig as FhemComponentSettings).position = Object.assign( transformation.position, {zIndex: compPosition.zIndex} );
		}
		if(changedAny) this.undoManager.addChange();
	}

	ngOnDestroy(): void {
		// remove container from registry
		if(this.containerRegistry) this.compLoader.deleteContainerRegistry(this.containerRegistry.containerId);
	}
}