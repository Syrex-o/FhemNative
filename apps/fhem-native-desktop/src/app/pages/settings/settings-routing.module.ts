import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DesktopSettingsPageComponent } from './settings.page';

const routes: Routes = [
	{
		path: '',
		component: DesktopSettingsPageComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DesktopSettingsPageRoutingModule {}
