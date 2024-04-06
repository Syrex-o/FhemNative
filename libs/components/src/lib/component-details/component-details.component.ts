import { Component, ChangeDetectionStrategy, ViewEncapsulation, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { BehaviorSubject, Subject, from, switchMap, tap } from 'rxjs';

import { QRCodeModule } from 'angularx-qrcode';

import { CoreExtendedAndTranslateModule } from '@fhem-native/modules';
import { ComponentLoaderService, ImportExportService, StructureService } from '@fhem-native/services';

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

    private _componentUID = new BehaviorSubject(this.componentUID);
    componentSettingsString$ = this._componentUID.pipe(
        switchMap(async (componentUID)=>{
            const compSettings = this.structure.getComponent(componentUID);
            if(!compSettings) return;
            // clone, to prevent overwrite
            const componentSettings = clone( compSettings );

            //compress nested components, if present
            if(componentSettings.components){
                const nestedComponents = this.structure.getAllComponents(componentSettings.components);
                for(let i = 0; i < nestedComponents.length; i++){
                    nestedComponents[i] = await this.compLoader.getCompressedFhemComponentConfig(nestedComponents[i]);
                }
            }

            // compress main component
            const compressedSettings = await this.compLoader.getCompressedFhemComponentConfig(componentSettings);
            return JSON.stringify(this.importExport.getComponentExportData([ compressedSettings ]));
        })
    )

    constructor(
        private structure: StructureService, 
        private popoverCtrl: PopoverController,
        private importExport: ImportExportService,
        private compLoader: ComponentLoaderService){
    }

    ngOnInit(): void {
        this._componentUID.next(this.componentUID);
    }

    close(): void{
        this.popoverCtrl.dismiss();
    }
}