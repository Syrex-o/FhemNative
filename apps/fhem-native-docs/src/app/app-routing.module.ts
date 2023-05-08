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
        path: 'components',
        loadChildren: ()=> import('./comps/comps.page').then(mod=> mod.COMPS_ROUTES)
    },
    {
        path: 'guides',
        loadChildren: ()=> import('./guides/guides.page').then(mod=> mod.GUIDES_ROUTES)
    },
	{
        path: 'sandbox',
        loadChildren: ()=> import('./playground/playground.page').then(mod=> mod.PLAYGROUND_ROUTES)
    },
    {
        path: 'config-converter',
        loadChildren: ()=> import('./configConverter/configConverter.page').then(mod=> mod.CONFIG_CONVERTER_ROUTES)
    },
    {
        path: 'rights',
        loadChildren: ()=> import('./rights/rights-routes').then(mod=> mod.RIGHTS_ROUTES)
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