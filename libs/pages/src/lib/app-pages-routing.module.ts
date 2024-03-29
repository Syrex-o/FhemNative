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
		path: 'release-notes',
		loadChildren: () => import('./release-notes/release-notes.page').then( m => m.RELEASE_NOTES_ROUTES)
	},
	{
		path: 'sandbox',
		loadChildren: () => import('./sandbox/sandbox.module').then( m => m.SandboxPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AppPagesRoutingModule {}
