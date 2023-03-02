import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPageComponent } from './settings.page';

const routes: Routes = [
	{
		path: '',
		component: SettingsPageComponent,
	},
    {
		path: 'login',
		loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SettingsPageRoutingModule {}
