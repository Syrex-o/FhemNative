import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  	{ path: '', redirectTo: '/', pathMatch: 'full' },
	{ path: '**', redirectTo: '/'}
];

@NgModule({
  	imports: [ 
  		RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  	],
  	exports: [RouterModule]
})
export class AppRoutingModule {}
