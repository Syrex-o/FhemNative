import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { DemoModeGuard } from '@fhem-native/guards';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('@fhem-native/pages').then( m => m.AppPagesModule)
	},
	{
		path: 'settings',
		loadChildren: () => import('../pages/settings/settings.page').then( m => m.DESKTOP_SETTINGS_ROUTES),
		providers: [DemoModeGuard],
		canActivate: [ DemoModeGuard ]
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