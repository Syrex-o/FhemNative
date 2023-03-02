import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
	},
	{
		path: 'room',
		loadChildren: () => import('./room/room.module').then( m => m.RoomPageModule)
	},
	{
		path: 'settings',
		loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AppPagesRoutingModule {}
