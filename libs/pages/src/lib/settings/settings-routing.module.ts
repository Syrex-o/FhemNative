import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
		path: 'login',
		loadChildren: () => import('./login/login.page').then( m => m.LOGIN_ROUTES)
	},
	{
		path: 'support',
		loadChildren: () => import('./support/support.page').then( m => m.SUPPORT_ROUTES)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SettingsPageRoutingModule {}
