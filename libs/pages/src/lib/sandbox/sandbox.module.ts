import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { SandboxPageComponent } from './sandbox.page';
import { SandboxPageRoutingModule } from './sandbox-routing.module';
import { SandboxGuardService } from './sandbox-guard.service';

@NgModule({
	imports: [
		IonicModule,
		SandboxPageRoutingModule
	],
	declarations: [ SandboxPageComponent ],
	providers: [SandboxGuardService]
})
export class SandboxPageModule {}