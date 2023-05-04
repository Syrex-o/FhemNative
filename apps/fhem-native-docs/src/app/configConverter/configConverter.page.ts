import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { Route, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { ImportExportService } from "@fhem-native/services";
import { jsonImporter } from "@fhem-native/utils";



@Component({
    standalone: true,
	selector: 'fhem-native-website-config-converter',
	templateUrl: 'configConverter.page.html',
	styleUrls: ['configConverter.page.scss'],
    imports: [
        IonicModule,
        RouterModule,
        TranslateModule
    ],
    providers: [
        ImportExportService
    ]
})
export class ConfigConverterPageComponent {
    importedConfig: Array<any> = [];

    constructor(
        private importExport: ImportExportService){
    }

    async uploadConfig(): Promise<void>{
        const data = await jsonImporter();

        console.log(data);
    }

    pasteConfig(): void{

    }
}

export const CONFIG_CONVERTER_ROUTES: Route[] = [
    {
        path: '',
        component: ConfigConverterPageComponent
    }
];