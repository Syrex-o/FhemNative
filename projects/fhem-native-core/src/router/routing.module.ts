import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// fake routes that get modified in structure service from FhemNative Core
const routes: Routes = [
	{ path: '', redirectTo: '/', pathMatch: 'full' },
	{ path: '**', redirectTo: '/'}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { 
			relativeLinkResolution: 'legacy', 
			scrollPositionRestoration: 'enabled' 
		})
	],
	exports: [RouterModule]
})
export class RoutingModule { }