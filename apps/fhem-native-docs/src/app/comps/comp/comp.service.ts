import { Injectable } from '@angular/core';

import { ComponentLoaderService } from '@fhem-native/services';

import { FhemComponentSettings } from '@fhem-native/types/components';
import { SandboxComponents } from './sandbox-components';

@Injectable()
export class CompService {

    constructor(private compLoader: ComponentLoaderService){}

    public getSandboxComponents(compRef: string): FhemComponentSettings[]|undefined {
        return SandboxComponents[compRef] || undefined;
    }

    public getComponent(compRef: string) {
        return this.compLoader.importFhemComponentConfig(compRef);
    }

}