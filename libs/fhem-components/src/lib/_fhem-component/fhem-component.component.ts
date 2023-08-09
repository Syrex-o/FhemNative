import { Component, OnDestroy, Output, EventEmitter, Input, ViewChild, ContentChild, TemplateRef, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { delay, distinctUntilChanged, map, merge, Observable, of, switchMap, tap} from 'rxjs';

import { ContextMenuComponent } from '@fhem-native/components';
import { TransformationItemDirective, TransformationManagerDirective } from '@fhem-native/directives';
import { ContextMenuService, FhemService, SelectComponentService, StructureService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition, ComponentTransformation, FhemDeviceConfig, FhemDeviceRenderer } from '@fhem-native/types/components';

@Component({
	selector: 'fhem-native-component',
	templateUrl: './fhem-component.component.html',
	styleUrls: ['./fhem-component.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FhemComponent implements AfterViewInit, OnDestroy{
	@ViewChild('COMPONENT', {read: ElementRef, static: false}) elem: ElementRef<HTMLElement>|undefined;

	// get reference to transformation item
	@ViewChild(TransformationItemDirective) transformationItem!: TransformationItemDirective;

	/**
	 * Custom Templates
	 */
	@ContentChild('LOADER_TEMPLATE') loaderTemplate!: TemplateRef<any>;
	@ContentChild('ERROR_TEMPLATE') errorTemplate!: TemplateRef<any>;

	/**
	 * Regular Component Inputs
	 */
	 @Input() UID!: string;
	 @Input() position!: ComponentPosition;
	 @Input() minDimensions!: {width: number, height: number};

	 /**
	  * Fhem Device details
	  */
	@Input() fhemDeviceConfig: FhemDeviceConfig|undefined;
	fhemDeviceRenderer: Observable<FhemDeviceRenderer> = of({render: false, loading: true});

	/**
	 * Component lifecycle functions
	 */
	@Output() initComponent = new EventEmitter<void>();
	@Output() destroyComponent = new EventEmitter<void>();

	/**
	 * Fhem component lifecycle functions
	 */
	@Output() initDevice = new EventEmitter<FhemDevice>();
	@Output() updateDevice = new EventEmitter<FhemDevice>();

	/**
	 * Component Transformation events
	 */
	@Output() resized = new EventEmitter<void>();
	@Output() transformationStart = new EventEmitter<ComponentTransformation>();
	@Output() transformationEnd = new EventEmitter<ComponentTransformation>();

	// % minimal dimensions of component
	minWidthPercentage = 0; minHeightPercentage = 0;

	// device holder
	fhemDevice: FhemDevice|undefined;

	constructor(
		private fhem: FhemService,
		private structure: StructureService,
		private contextMenu: ContextMenuService,
		private selectComponent: SelectComponentService,
		private transformationManager: TransformationManagerDirective){
	}

	ngAfterViewInit(): void {
		this.initComponent.emit();
		this.fhemDeviceRenderer = this.getRenderer();
	}

	private getRenderer(): Observable<FhemDeviceRenderer>{
		// no config needed --> just render
		if(!this.fhemDeviceConfig) return of({ render: true, loading: false });

		return this.fhem.connected.pipe(
			// only changed values are relevant for renderer 
			// allow displaying of error while reconnecting in background
			distinctUntilChanged(),
			switchMap(connState=>{
				const c = this.fhemDeviceConfig;
				// check if nothing is needed
				if(c && !c.connected && !c.deviceAvailable && !c.readingAvailable) return of({ render: true, loading: false });

				// check for null --> show loader until relevant event occours
				if(connState === null) return of({ render: false, loading: true });
	
				// emit loader, while waiting for connection
				// trigger no connection error after timeout
				if(!connState) return merge( 
					of({ render: false, loading: true }), 
					of({ render: false, loading: false }).pipe( delay(5_000) ) 
				);
	
				// check if only connection is needed
				if(c?.connected && !c.deviceAvailable && !c.readingAvailable) 
					return of({ render: true, loading: false });
	
				// get relevant fhem device and map to renderer
				return merge(
					of({ render: false, loading: true }),
					this.fhem.getDevice( this.UID, c?.device || '', c?.reading || '', (fhemDevice)=> this.deviceUpdate(fhemDevice) ).pipe(
						map(x=> this.deviceMapper(x)),
						tap(x=> x.renderer.render && x.device ? this.deviceInit(x.device) : null),
						map(x=> x.renderer)
					)
				);
			})
		);
	}


	// map observable output to renderer
	private deviceMapper(x: FhemDevice|null): {device: FhemDevice|null, renderer: FhemDeviceRenderer} {
		const c = this.fhemDeviceConfig;
		// device not found
		if(!x) return { device: x,  renderer: { render: false, loading: false, deviceNotFound: true } }

		// only device presence is needed
		if(c?.deviceAvailable) return { device: x, renderer: {  render: true, loading: false } };

		// reading presence needed --> check for reading
		if(c?.readingAvailable && c.reading && x.readings[c.reading]) return { device: x,  renderer: {  render: true, loading: false } };

		// reading not found, but needed
		return { device: x,  renderer: {  render: false, loading: false, readingNotFound: true } };
	}

	private deviceInit(fhemDevice: FhemDevice): void{
		this.fhemDevice = fhemDevice;
		this.initDevice.emit(fhemDevice);
	}

	private deviceUpdate(fhemDevice: FhemDevice): void{
		this.fhemDevice = fhemDevice;
		this.updateDevice.emit(fhemDevice);
	}

	onTransformationStart(componentTransformation: ComponentTransformation): void{
		// create selector
		this.selectComponent.buildSelector(this.transformationItem);
		this.transformationStart.emit(componentTransformation);
	}

	onTransformationEnd(componentTransformation: ComponentTransformation): void{
		// remove selector
		// depends on: 
			// closed context menu
			// control/mod is not pressed
		if(!this.contextMenu.getContextMenuState() && !this.transformationManager.allowClickSelection){
			this.selectComponent.removeSelector(this.transformationItem);
		}

		this.transformationEnd.emit(componentTransformation);
	}

	// create context menu
	async onContextClick(event: PointerEvent|Touch): Promise<void>{
		const { role, data } = await this.contextMenu.createContextMenu(ContextMenuComponent, event, false, {
			source: 'component', 
			componentId: this.UID, 
			transformationManager: this.transformationManager
		});

		if(role === 'backdrop' || role === 'standard') return this.selectComponent.removeAllSelectors();
	}

	// get minimal sizes on resizing of component
	calcMinSizes(): void{
		this.minWidthPercentage = this.structure.getGridPercentage(this.minDimensions.width, this.transformationManager.container.offsetWidth);
		this.minHeightPercentage = this.structure.getGridPercentage(this.minDimensions.height, this.transformationManager.container.offsetHeight);
		this.resized.emit();
	}

	ngOnDestroy(): void {
		this.destroyComponent.emit();
		this.fhem.removeDevice(this.UID);
	}
}