import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { SandboxSettingsService } from './sandbox-settings.service';

import { ComponentLoaderService, FhemService, LoggerService, ToastService } from '@fhem-native/services';

import { FhemDevice } from '@fhem-native/types/fhem';
import { SandboxStructureService } from './sandbox-structure.service';
import { APP_CONFIG } from '@fhem-native/app-config';

@Injectable({providedIn: 'root'})
export class SandboxFhemService extends FhemService {
    // fake connected state
    override connected = new BehaviorSubject<boolean|null>(true);
    // fake fhem device list
    private demoTime: string = new Date().toLocaleString();
    override devices: Array<FhemDevice> = [
        {
            id: 0,
            device: 'DEMO',
            readings: {
                // int values
				value_int: { Value: 10, Time: this.demoTime },
				// comma values
				value_float: { Value: 50.1, Time: this.demoTime },
				// true/false
				value_bool: { Value: true, Time: this.demoTime },
				// true/false as transformed list
				value_bool_form: { Value: 'on', Time: this.demoTime },
				// state 
				state: { Value: 'off', Time: this.demoTime }
            },
            internals: {},
            attributes: {}
        },
        {
            id: 1,
            device: 'TEMP',
            readings: {
				currentTemp: { Value: 20, Time: this.demoTime },
				desiredTemp: { Value: 25, Time: this.demoTime }
            },
            internals: {},
            attributes: {}
        },
        {
            id: 2,
            device: 'AV',
            readings: {
				input: { Value: 'hdmi1', Time: this.demoTime },
				inputName: { Value: 'TV', Time: this.demoTime },
                sources: { Value: 'hdmi1,hdmi2', Time: this.demoTime },
                power: { Value: 'off', Time: this.demoTime }
            },
            internals: {},
            attributes: {}
        }
    ];

    constructor(
        override toast: ToastService, 
        override logger: LoggerService,
        override settings: SandboxSettingsService,
        override structure: SandboxStructureService,
        override compLoader: ComponentLoaderService,
        @Inject(APP_CONFIG) override appConfig: any){
        super(toast, logger, settings, structure, compLoader, appConfig);
    }

    public override getDevice(componentUID: string, deviceName: string, readingName: string, deviceUpdateCb: (fhemdevice: FhemDevice) => void): Observable<FhemDevice | null> {
        this.addListenDevice(componentUID, deviceName, deviceUpdateCb);
        // search in dummy list
        const foundDevice = this.devices.find(x=> x.device === deviceName);
        return of(foundDevice || null);
    }

    public override sendCommand(cmd: any): void {
        const relCommand = cmd.command || cmd;
        const commadParts = relCommand.split(' ');

        const device: string = commadParts[1];
        const foundDevice = this.devices.find(x=> x.device === device);
        if(!foundDevice) return;

        let reading = 'state', toValue;
        // relevant for setReading
        if(commadParts.length === 4){
            reading = commadParts[2];
            toValue = commadParts[3];
        }else{
            toValue = commadParts[2];
        }
        // search for reading
        if( !(reading in foundDevice.readings) ) return;
        foundDevice.readings[reading] = {Value: toValue, Time: new Date().toLocaleString()};
        this.deviceUpdateSub.next(foundDevice);
    }
}