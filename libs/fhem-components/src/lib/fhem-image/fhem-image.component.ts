import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { interval, map, merge, Observable, of } from 'rxjs';

import { TextBlockModule } from '@fhem-native/components';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { LoaderService, StructureService } from '@fhem-native/services';

import { imageImporter } from '@fhem-native/utils';

import { FhemDevice } from '@fhem-native/types/fhem';
import { ComponentPosition } from '@fhem-native/types/components';

interface ImgSrc {
	source: 'default'|'local'|'config',
	src: string
}

@Component({
	standalone: true,
	selector: 'fhem-native-component-image',
	imports: [FhemComponentModule, IonicModule, TextBlockModule],
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
				<ng-container *ngIf="src$ | async as srcData;">
					<!-- local image -->
					<ng-container *ngIf="srcData.source === 'local'; else STANDARD_IMAGE">
						<div *ngIf="srcData.src !== ''; else SELECT" class="img-bg" [style.background-image]="srcData.src"></div>
					</ng-container>

					<!-- standard image load -->
					<ng-template #STANDARD_IMAGE>
						<img [src]="srcData.src" (error)="imgSrcError()">
					</ng-template>
				</ng-container>

				<!-- select local image -->
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
	styleUrls: ['./fhem-image.component.scss']
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
	
	src$: Observable<ImgSrc>|undefined;
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
		this.src$ = of({source: 'default', src: 'assets/img/app/' + this.defaultImage});
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
		if(this.useCache || this.useLocalImage){
			this.src$ = of({source: this.useLocalImage ? 'local' : 'config', src: src});
			return;
		}

		this.src$ = merge(
			of(src),
			interval(this.updateInterval).pipe(
				map(()=>{
					const srcMod = '?dummy=' + new Date().getTime();
					return src + srcMod;
				})
			)
		).pipe(
			map((x)=>{
				return {source: 'config', src: x}
			})
		)
	}
}