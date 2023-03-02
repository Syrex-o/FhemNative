import { Component, OnDestroy, Output, EventEmitter, Input, ViewChild, ContentChild, TemplateRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
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
	@Output() initComponent: EventEmitter<void> = new EventEmitter<void>();
	@Output() destroyComponent: EventEmitter<void> = new EventEmitter<void>();

	/**
	 * Fhem component lifecycle functions
	 */
	@Output() initDevice: EventEmitter<FhemDevice> = new EventEmitter<FhemDevice>();
	@Output() updateDevice: EventEmitter<FhemDevice> = new EventEmitter<FhemDevice>();

	/**
	 * Component Move/Scale events
	 */
	@Output() transformationStart: EventEmitter<ComponentTransformation> = new EventEmitter<ComponentTransformation>();
	@Output() transformationEnd: EventEmitter<ComponentTransformation> = new EventEmitter<ComponentTransformation>();

	// % minimal dimensions of component
	minWidthPercentage = 0; minHeightPercentage = 0;

	// device holder
	fhemDevice: FhemDevice|null = null;

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
				// check for null --> show loader until relevant event occours
				if(connState === null) return of({ render: false, loading: true });
	
				// emit loader, while waiting for connection
				// trigger no connection error after timeout
				if(!connState) return merge( 
					of({ render: false, loading: true }), 
					of({ render: false, loading: false }).pipe( delay(5_000) ) 
				);
	
				// check if only connection is needed
				if(this.fhemDeviceConfig?.connected && !this.fhemDeviceConfig.deviceAvailable && !this.fhemDeviceConfig.readingAvailable) 
					return of({ render: true, loading: false });
	
				// get relevant fhem device and map to renderer
				return merge(
					of({ render: false, loading: true }),
					this.fhem.getDevice( this.UID, this.fhemDeviceConfig?.device || '', this.fhemDeviceConfig?.reading || '', (fhemDevice)=> this.deviceUpdate(fhemDevice) ).pipe(
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
		// device not found
		if(!x) return { device: x,  renderer: { render: false, loading: false, deviceNotFound: true } }

		// only device presence is needed
		if(this.fhemDeviceConfig?.deviceAvailable) return { device: x, renderer: {  render: true, loading: false } };

		// reading presence needed --> check for reading
		if(this.fhemDeviceConfig?.readingAvailable && x.readings[this.fhemDeviceConfig.reading])  return { device: x,  renderer: {  render: true, loading: false } };

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
		if(!this.contextMenu.getContextMenuState()) this.selectComponent.removeSelector(this.transformationItem);

		this.transformationEnd.emit(componentTransformation);
	}

	// create context menu
	async onContextClick(event: MouseEvent|TouchEvent): Promise<void>{
		const { role, data } = await this.contextMenu.createContextMenu(ContextMenuComponent, event, false, {
			source: 'component', componentId: this.UID, transformationManager: this.transformationManager
		});

		if(role === 'backdrop' || role === 'standard') return this.selectComponent.removeAllSelectors();
	}

	// get minimal sizes on resizing of component
	calcMinSizes(): void{
		this.minWidthPercentage = this.structure.getGridPercentage(this.minDimensions.width, this.transformationManager.container.offsetWidth);
		this.minHeightPercentage = this.structure.getGridPercentage(this.minDimensions.height, this.transformationManager.container.offsetHeight);
	}

	ngOnDestroy(): void {
		this.destroyComponent.emit();
		this.fhem.removeDevice(this.UID);
	}
}