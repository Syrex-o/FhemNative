import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IonicModule, NavController } from "@ionic/angular";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { take } from "rxjs";

import { ScrollHeaderModule } from "@fhem-native/directives";

import { CloseBtnContainerModule, InputModule, SwitchModule, TextBlockModule, UI_BoxComponent } from "@fhem-native/components";

import { BackButtonService, FhemService, LoaderService, SettingsService, StorageService, ThemeService, ToastService } from "@fhem-native/services";

import { clone, getUID } from "@fhem-native/utils";

@Component({
    standalone: true,
	selector: 'fhem-native-settings-advanced-shared-config',
	templateUrl: 'shared-config.page.html',
	styleUrls: ['../../../pages.style.scss', 'shared-config.page.scss'],
    imports: [
        IonicModule,
        FormsModule,
        CommonModule,
        TranslateModule,
        CloseBtnContainerModule,
        ScrollHeaderModule,

        InputModule,
        SwitchModule,
        TextBlockModule,
        UI_BoxComponent
    ]
})
export class SharedConfigSettingsPageComponent implements OnInit, OnDestroy{
    private handleID = getUID();

    primaryColor$ = this.theme.getThemePipe('--primary');

    sharedConfigValid = {
        connected: false,
        devicePresent: false,
        readingPresent: false,
        validConfig: false
    };
    sharedConfig = clone(this.settings.app.sharedConfig);

    constructor(
        private fhem: FhemService,
        private toast: ToastService,
        private theme: ThemeService,
        private loader: LoaderService,
        private navCtrl: NavController,
        private storage: StorageService,
        public settings: SettingsService,
        private backBtn: BackButtonService,
        private translate: TranslateService){
    }

    ngOnInit(): void {
		this.backBtn.handle(this.handleID, ()=> this.closePage());
        this.initializeSharedConfig();
	}

    private initializeSharedConfig(): void{
        // update shared config clone
        this.sharedConfig = clone(this.settings.app.sharedConfig);
        if(this.sharedConfig.enabled && this.sharedConfig.device !== '' && this.sharedConfig.reading !== ''){
            this.testSharedConfig(true);
        }
    }

    invalidateSharedConfig(): void{
        this.sharedConfigValid.devicePresent = false;
        this.sharedConfigValid.readingPresent = false;
        this.sharedConfigValid.validConfig = false;
    }

    updateSharedConfigState(toState: boolean): void{
        if(toState){
            this.settings.app.sharedConfig.enabled = toState;
            this.initializeSharedConfig();
        }else{
            this.settings.app.sharedConfig.enabled = false;
		    this.storage.changeSetting({name: 'sharedConfig', change: JSON.stringify(this.settings.app.sharedConfig)});
            this.fhem.removeSharedConfig();
        }
    }

    async testSharedConfig(noToasts?: boolean){
        this.loader.showLogoLoader();

        if(!this.fhem.connected.value){
            this.loader.hideLoader();
            return noToasts ? null : this.toast.showTranslatedAlert(
                'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.NO_CONNECTION.HEAD',
                'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.NO_CONNECTION.INFO',
                false
            );
        }

        this.sharedConfigValid.connected = true;

        if(this.sharedConfig.device === '' || this.sharedConfig.reading === ''){
            this.loader.hideLoader();
            return noToasts ? null : this.toast.showTranslatedAlert(
                'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.MISSING.HEAD',
                'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.MISSING.INFO',
                false
            );
        }

        // get relevant device
        this.fhem.getDevice('sharedConfigTest', this.sharedConfig.device, this.sharedConfig.reading, ()=> {}, true).pipe(
            take(1)
        ).subscribe({
            next: (d)=> {
                this.loader.hideLoader();
                if(!d){
                    return noToasts ? null : this.toast.showTranslatedAlert(
                        'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.DEVICE_NOT_FOUND.HEAD',
                        'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.DEVICE_NOT_FOUND.INFO',
                        false
                    );
                }

                this.sharedConfigValid.devicePresent = true;

                if(!d.readings[this.sharedConfig.reading]){
                    return noToasts ? null : this.toast.showTranslatedAlert(
                        'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.READING_NOT_FOUND.HEAD',
                        'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TEST.ERRORS.READING_NOT_FOUND.INFO',
                        false
                    );
                }

                this.sharedConfigValid.readingPresent = true;

                // all tests passed
                this.sharedConfigValid.validConfig = this.fhem.validateSharedConfig(d.readings[this.sharedConfig.reading].Value);
                return;
            }
        });
    }

    transferSharedConfig(): void{
        this.toast.showTranslatedAlert(
            'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TRANSFER.HEAD',
            'PAGES.ADVANCED.FHEM.SHARED_CONFIG.TRANSFER.INFO',
            [
                {
                    text: this.translate.instant('DICT.CANCEL'),
                    role: 'cancel'
                },
                {
                    text: this.translate.instant('BUTTONS.CONTINUE'),
                    role: 'save',
                    handler: async ()=> {
                        this.overrideSharedConfig();
                        const sharedConfig = await this.fhem.getSharedConfig();
                        this.fhem.setAttr(this.sharedConfig.device, this.sharedConfig.reading, JSON.stringify(sharedConfig));
                        
                        // initialize the config and run test
                        await this.fhem.initializeSharedConfig();
                        this.testSharedConfig(false);
                    }
                },
            ]
        );
    }

    private overrideSharedConfig(): void{
        this.settings.app.sharedConfig = this.sharedConfig;
		this.storage.changeSetting({name: 'sharedConfig', change: JSON.stringify(this.sharedConfig)});
    }

    private saveSharedConfig(): void{
        this.overrideSharedConfig();
        // get shared config
        this.fhem.initializeSharedConfig();
    }

    cancelSharedConfig(): void {
        if(this.sharedConfigValid.validConfig) return this.saveSharedConfig();

        // invalid config on cancel
        this.settings.app.sharedConfig.enabled = false;
        this.storage.changeSetting({name: 'sharedConfig', change: JSON.stringify(this.settings.app.sharedConfig)});
    }

    closePage(): void{
        this.cancelSharedConfig();
        this.navCtrl.back();
    }

    ngOnDestroy(): void {
		this.backBtn.removeHandle(this.handleID);
	}
}