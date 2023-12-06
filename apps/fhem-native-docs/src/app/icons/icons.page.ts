import { Component } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { Route, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { IconModule, LoaderModule } from "@fhem-native/components";
import { DocItemListComponent } from "@fhem-native/docs";

import { IconService, ICON_CATEGORIES, IconType } from "@fhem-native/services";
import { CommonModule } from "@angular/common";

@Component({
	standalone: true,
	selector: 'fhem-native-website-icons',
	template: `
		<div class="full-container mt-5">
			<div class="button-container">
				<p class="size-c color-a no-margin center bold">{{ 'WEB.ICONS.HEAD' | translate }}</p>
				<p class="size-f color-b no-margin center">{{ 'WEB.ICONS.INFO' | translate }}</p>
			</div>
			<ng-container *ngFor="let iconMap of iconsMapped">
				<div class="icon-map-container mt-1-5 mb-1-5">
					<a class="icon-ref" [href]="iconMap.ref" target="_blank">
						<ion-icon class="color-b size-e" name="link-outline"></ion-icon>
						<p class="color-a size-e bold center">{{ iconMap.name }}</p>
					</a>
					<div class="icons-container">
						<ng-container *ngFor="let icon of iconMap.icons">
							<div class="icon">
								<fhem-native-icon [icon]="icon.icon"/>
							</div>
						</ng-container>
					</div>
				</div>
			</ng-container>
		</div>
	`,
	styleUrls: ['icons.page.scss'],
	imports: [
		IonicModule,
		CommonModule,
		RouterModule,
		TranslateModule,

		IconModule,
		LoaderModule,
		DocItemListComponent
	]
})
export class ConfigConverterPageComponent {
	iconCategories = ICON_CATEGORIES;
	iconsMapped = this.mapIcons();

	constructor(private icons: IconService){}

	private mapIcons(iconFilter?: string){
		const filterString = iconFilter?.toLocaleLowerCase();

		let filteredItems = this.icons.icons;
		if(filterString) filteredItems = this.icons.icons.filter((x)=> x.icon.toLowerCase().indexOf( filterString ) > -1 );

		return Object.values(this.iconCategories).map((x, i)=>{
			const category = Object.keys(this.iconCategories)[i] as IconType;
			return {
				category: category,
				name: x.name,
				ref: x.ref,
				icons: filteredItems.filter(y=> y.type === category)
			};
		});
	}
}

export const ICON_ROUTES: Route[] = [
	{
		path: '',
		component: ConfigConverterPageComponent
	}
];