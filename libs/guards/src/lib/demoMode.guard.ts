import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { SandboxSettingsService } from "@fhem-native/pages";

@Injectable()
export class DemoModeGuard  {
    constructor(private router: Router, private settings: SandboxSettingsService){}

    canActivate(): boolean {
        if(!this.settings.demoMode.value) return true;
        
        this.router.navigate([''])
        return false;
    }
}