import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SandboxGuardService } from './sandbox-guard.service';
import { SandboxPageComponent } from './sandbox.page';

import { StructureService } from '@fhem-native/services';
import { SandboxStructureService } from './services/sandbox-structure.service';

const routes: Routes = [
	{
		path: '',
		component: SandboxPageComponent,
		canActivate: [SandboxGuardService],
		providers: [
			{provide: StructureService, useExisting: SandboxStructureService}
		],
		children: [
			{
				path: 'room',
				loadChildren: () => import('../room/room.module').then( m => m.RoomPageModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SandboxPageRoutingModule {}
