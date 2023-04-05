import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomePageComponent } from './home/home.page'; 

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },
    {
        path: 'docs',
        loadChildren: ()=> import('./docs/docs.page').then(mod=> mod.DOCS_ROUTES)
    },
	{
        path: 'sandbox',
        loadChildren: ()=> import('./playground/playground.page').then(mod=> mod.PLAYGROUND_ROUTES)
    },
    {
		path: '',
		redirectTo: '',
		pathMatch: 'full'
	}, 
	{
		path: '**',
        redirectTo: '', 
        pathMatch: 'full' 
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { 
			preloadingStrategy: PreloadAllModules,
			scrollPositionRestoration: 'enabled',
			anchorScrolling: 'enabled'
		})
	],
	exports: [RouterModule]
})
export class RoutingModule { }