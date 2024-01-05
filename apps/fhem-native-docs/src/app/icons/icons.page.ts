import { Component, ViewEncapsulation } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { Route, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { BehaviorSubject, map } from "rxjs";

import { IconModule, LoaderModule, PickerComponent } from "@fhem-native/components";
import { DocItemListComponent } from "@fhem-native/docs";

import { IconService, ICON_CATEGORIES, IconType, Icon } from "@fhem-native/services";

@Component({
	standalone: true,
	selector: 'fhem-native-website-icons',
	template: `
		<div class="full-container mt-5">
			<div class="button-container">
				<p class="size-c color-a no-margin center bold">{{ 'WEB.ICONS.HEAD' | translate }}</p>
				<p class="size-f color-b no-margin center">{{ 'WEB.ICONS.INFO' | translate }}</p>
			</div>
			@for (iconMap of iconsMapped; track $index) {
				<div class="icon-map-container mt-1-5 mb-1-5">
					<a class="icon-ref" [href]="iconMap.ref" target="_blank">
						<ion-icon class="color-b size-e" name="link-outline"></ion-icon>
						<p class="color-a size-e bold center">{{ iconMap.name }}</p>
					</a>
					<div class="icons-container">
						@for (icon of iconMap.icons; track $index) {
							<div class="icon" (click)="selectedIcon.next({icon: icon, show: true})">
								<fhem-native-icon [icon]="icon.icon"/>
							</div>
						}
					</div>
				</div>
			}
		</div>

		<fhem-native-picker *ngIf="selectedIconData$ | async as selectedIconData"
			[(ngModel)]="selectedIcon.value.show"
			[height]="10"
			[width]="90"
			[headerAnimation]="false"
			cssClass="icon-select-picker"
			[modalHeader]="selectedIconData.icon?.icon || ''">
			<div content class="flex-container" *ngIf="selectedIconData.icon">
				<fhem-native-icon [icon]="selectedIconData.icon.icon"/>
				<div class="block">
					<p class="size-e color-a bold no-margin">in FhemNative:</p>
					<p class="right-side size-e color-a no-margin">{{selectedIconData.icon.icon}}</p>
				</div>
				<div class="block">
					<p class="size-e color-a bold no-margin">Library:</p>
					<a class="right-side size-e no-margin" [href]="selectedIconData.category.ref" target="_blank">{{selectedIconData.category.name}}</a>
				</div>
			</div>
		</fhem-native-picker>
	`,
	styleUrls: ['icons.page.scss'],
	imports: [
		FormsModule,
		IonicModule,
		CommonModule,
		RouterModule,
		TranslateModule,

		IconModule,
		LoaderModule,
		PickerComponent,
		DocItemListComponent
	],
	encapsulation: ViewEncapsulation.None
})
export class ConfigConverterPageComponent {
	iconCategories = ICON_CATEGORIES;
	iconsMapped = this.mapIcons();
	
	selectedIcon = new BehaviorSubject<{icon: Icon|null, show: boolean}>({icon: null, show: false});
	selectedIconData$ = this.selectedIcon.pipe(
		map(x=> ({ icon: x.icon, category: this.iconCategories[x.icon ? x.icon.type : 'ion'] }))
	);

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