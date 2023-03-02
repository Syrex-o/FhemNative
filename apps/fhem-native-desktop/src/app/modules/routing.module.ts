import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('@fhem-native/pages').then( m => m.AppPagesModule)
	},
	{ path: '', redirectTo: '', pathMatch: 'full' },
	{ path: '**', redirectTo: ''}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class RoutingModule {}