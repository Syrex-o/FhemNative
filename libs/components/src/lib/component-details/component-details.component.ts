import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { QRCodeModule } from 'angularx-qrcode';

import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';
import { ComponentLoaderService, StructureService } from '@fhem-native/services';

import { FhemComponentSettings } from '@fhem-native/types/components';
import { clone } from '@fhem-native/utils';

@Component({
    standalone: true,
	selector: 'fhem-native-component-details',
	templateUrl: './component-details.component.html',
	styleUrls: ['./component-details.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        QRCodeModule,
        CoreExtendedAndTranslateModule
    ]
})

export class ComponentDetailsComponent implements OnInit{
    @Input() componentUID!: string;

    componentSettings!: FhemComponentSettings;
    componentSettingsString!: string;

    constructor(
        private cdr: ChangeDetectorRef,
        private structure: StructureService, 
        private popoverCtrl: PopoverController,
        private compLoader: ComponentLoaderService){
    }

    async ngOnInit(): Promise<void> {
        const compSettings = this.structure.getComponent(this.componentUID);
        if(!compSettings) return;
        // clone, to prevent overwrite
        this.componentSettings = clone( compSettings );

        //compress nested components, if present
        if(this.componentSettings.components){
            const nestedComponents = this.structure.getAllComponents(this.componentSettings.components);
            for(let i = 0; i < nestedComponents.length; i++){
                nestedComponents[i] = await this.compLoader.getCompressedFhemComponentConfig(nestedComponents[i]);
            }
        }

        // compress main component
        const compressedSettings = await this.compLoader.getCompressedFhemComponentConfig(this.componentSettings);
        this.componentSettingsString = JSON.stringify({
            versionCode: '1.0.0',
            settings: compressedSettings
        });
        this.cdr.detectChanges();
    }

    close(): void{
        this.popoverCtrl.dismiss();
    }
}