import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { SandboxSettingsService } from "@fhem-native/pages";

@Injectable()
export class DemoModeGuard implements CanActivate {
    constructor(private router: Router, private settings: SandboxSettingsService){}

    canActivate(): boolean {
        if(!this.settings.demoMode.value) return true;
        
        this.router.navigate([''])
        return false;
    }
}