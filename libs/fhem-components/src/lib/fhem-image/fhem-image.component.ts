import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { interval, map, merge, Observable, of } from 'rxjs';

import { TextBlockModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { LoaderService, StructureService } from '@fhem-native/services';

import { imageImporter } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

@Component({
	standalone: true,
	selector: 'fhem-native-component-image',
	template: `
		<fhem-native-component 
			[UID]="UID" 
			[position]="position"
			[minDimensions]="{width: 40, height: 40}"
			[fhemDeviceConfig]="{
				device, reading,
				readingAvailable: (device !== '' && reading !== '' && !useLocalImage) ? true : false
			}"
			(initComponent)="onInitComponent()"
			(initDevice)="setFhemDevice($event)"
			(updateDevice)="setFhemDevice($event)">
			<div class="fhem-native-image">
				<ng-container *ngIf="src$ | async as src; else SELECT">
					<ng-container *ngIf="useLocalImage; else STANDARD_IMAGE">
						<div *ngIf="src !== ''; else SELECT" class="img-bg" [style.background-image]="src"></div>
					</ng-container>

					<ng-template #STANDARD_IMAGE>
						<img [src]="src" (error)="imgSrcError()">
					</ng-template>
				</ng-container>

				<ng-template #SELECT>
					<div class="select-container">
						<button class="app-button type-a ion-activatable" (click)="importImage()">
							Upload
							<ion-ripple-effect></ion-ripple-effect>
						</button>
						<fhem-native-text-block
							[label]="('COMPONENTS.Image.ERRORS.SELECT.name' | translate)"
							[info]="('COMPONENTS.Image.ERRORS.SELECT.info' | translate)">
						</fhem-native-text-block>
					</div>
				</ng-template>
			</div>
		</fhem-native-component>
	`,
	styleUrls: ['./fhem-image.component.scss'],
	imports: [FhemComponentModule, IonicModule, TextBlockModule]
})
export class FhemImageComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() device!: string;
	@Input() reading!: string;

	@Input() url!: string;
	@Input() imageUrl!: string;
	@Input() updateInterval!: number;

	// Arr data
	@Input() defaultImage!: string;

	// Bool
	@Input() useCache!: boolean;
	@Input() useLocalImage!: boolean;

	src$: Observable<string>|undefined;
	fhemDevice: FhemDevice|undefined;

	constructor(private loader: LoaderService, private structure: StructureService){}

	onInitComponent(): void{
		if(!this.fhemDevice) this.updateImageData(this.useLocalImage ? this.imageUrl : this.url);
	}

	setFhemDevice(device: FhemDevice): void{
		// use local image always, when selected
		if(this.useLocalImage) return this.updateImageData(this.imageUrl);

		this.fhemDevice = device;
		this.updateImageData(this.fhemDevice.readings[this.reading].Value);
	}

	// prevent continious errors
	imgSrcError(): void{
		this.src$ = of('assets/img/app/' + this.defaultImage);
	}

	async importImage() {
		this.loader.showLogoLoader();
		const imgData = await imageImporter();
		this.loader.hideLoader();
		if(!imgData) return;
		
		const imgStr = `url(data:${imgData.mimeType};base64,${imgData.data})`;
		this.updateImageData(imgStr);
		// save data to component
		const compSettings = this.structure.getComponent(this.UID);
		if(!compSettings) return;

		compSettings.inputs['imageUrl'] = imgStr;
		this.structure.saveRooms();
	}

	// create stream
	private updateImageData(src: string) {
		// prevent empty src to prevent SELECT template, when useLocalImage is false
		const srcNotEmpty = src === '' ? ' ' : src;

		if(this.useCache || this.useLocalImage){
			this.src$ = of(srcNotEmpty);
			return;
		}

		this.src$ = merge(
			of(srcNotEmpty),
			interval(this.updateInterval).pipe(
				map(()=>{
					const srcMod = '?dummy=' + new Date().getTime();
					return srcNotEmpty + srcMod;
				})
			)
		);
	}
}