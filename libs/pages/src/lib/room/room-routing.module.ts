import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoomGuardService } from './room-guard.service';

import { RoomPageComponent } from './room.page';
import { RoomContentPageComponent } from './room-content/room-content.page';

const routes: Routes = [
	{
		path: '',
		component: RoomPageComponent, canActivate: [RoomGuardService],
		children: [
			{ 
				path: ':room', 
				component: RoomContentPageComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RoomPageRoutingModule {}
