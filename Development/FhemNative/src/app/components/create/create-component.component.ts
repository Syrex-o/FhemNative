import { Component, Input } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { CreateComponentService } from '../../services/create-component.service';

@Component({
	selector: 'create-component',
	template: `
	<div class="create-container component" [ngClass]="settings.app.theme">
		<button matRipple [matRippleColor]="'#d4d4d480'" class="add-btn" (click)="this.showPopup = true;">
			<span class="line top"></span>
			<span class="line bottom"></span>
		</button>
	</div>
	<popup *ngIf="showPopup"
		[ngClass]="settings.app.theme"
		[customMode]="true"
		[headLine]="'GENERAL.CREATE_COMPONENT.POPUP_HEADER' | translate"
		[(ngModel)]="showPopup"
		[popupWidth]="'80%'"
		[popupHeight]="'80%'"
		[fixPosition]="true"
		(onClose)="cancel()">
		<div class="page-container create" [ngClass]="'page-'+pageIndex+'-active'">
			<div class="page page-1">
				<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_1_INFO' | translate }}</p>
				<div class="component-list">
					<ng-container *ngFor="let comp of createComponent.fhemComponents">
						<div
							*ngIf="validateComponentSelection(comp)"
							matRipple [matRippleColor]="'#d4d4d480'"
							class="item"
							(click)="selectComponent(comp)">
							<p>{{ 'COMPONENTS.'+[comp.name]+'.NAME' | translate }}</p>
						</div>

					</ng-container>
				</div>
			</div>
			<div class="page page-2">
				<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_2_INFO' | translate }}</p>
				<ng-template [ngIf]="componentSelection" [ngIfElse]="NO_COMP">
					<div class="config-container">
						<div class="config-data" *ngFor="let data of componentSelection.attr_data">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate }}</p>
							<input [(ngModel)]="data.value" placeholder="{{data.value}}">
		      				<span class="bar"></span>
						</div>
						<div class="config-data toggle" *ngFor="let data of componentSelection.attr_bool_data">
							<switch
								[customMode]="true"
								[(ngModel)]="data.value"
								[label]="'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate"
								[subTitle]="'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate"
								[padding]="false">
							</switch>
						</div>
						<div class="config-data" *ngFor="let data of componentSelection.attr_arr_data">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate }}</p>
							<ng-select [items]="data.value"
								[searchable]="false"
					            [(ngModel)]="data.value[0]">
					            <ng-template ng-option-tmp let-item="item" let-index="index">
					            	<span class="label">{{item}}</span>
					            </ng-template>
					        </ng-select>
						</div>
					</div>
				</ng-template>
			</div>
			<div class="page page-3">
				<ng-template [ngIf]="componentSelection" [ngIfElse]="NO_COMP">
					<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_3_INFO' | translate }}</p>
					<div class="config-container">
						<div *ngIf="componentSelection.attr_icon.length">
							<div class="config-data" *ngFor="let icon of componentSelection.attr_icon">
								<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[icon.attr]+'.name' | translate }}</p>
								<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[icon.attr]+'.info' | translate }}</p>
								<ng-select [items]="settings.icons"
									[searchable]="false"
						            placeholder="icon.value"
						            [(ngModel)]="icon.value">
						            <ng-template ng-option-tmp let-item="item" let-index="index">
						            	<ion-icon class="icon" [name]="item"></ion-icon>
					    				<span class="label">{{item}}</span>
						            </ng-template>
						        </ng-select>
							</div>
						</div>
						<div class="config-data" *ngFor="let style of componentSelection.attr_style">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
							<ng-select [items]="settings.componentColors"
					            placeholder="style.value"
					            [searchable]="false"
					            [(ngModel)]="style.value">
					            <ng-template ng-option-tmp let-item="item" let-index="index">
					            	<span class="color" [style.background]="item"></span>
					            	<span class="color-label">{{item}}</span>
					            </ng-template>
					        </ng-select>
						</div>
						<div class="config-data" *ngFor="let style of componentSelection.attr_arr_style">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
							<ng-select [items]="settings.componentColors"
					            placeholder="style.value"
					            [searchable]="false"
					            [multiple]="true"
					            [(ngModel)]="style.value">
					            <ng-template ng-option-tmp let-item="item" let-index="index">
					            	<span class="color" [style.background]="item"></span>
					            	<span class="color-label">{{item}}</span>
					            </ng-template>
					        </ng-select>
						</div>
					</div>
				</ng-template>
			</div>
			<div class="page page-4">
				<ng-template [ngIf]="componentSelection" [ngIfElse]="NO_COMP">
					<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_4_INFO' | translate }}</p>
					<div class="config-container" *ngIf="componentSelection.comp.type == 'fhem'">
						<div class="testing-data">
							<h3>Device</h3>
							<div class="success"  *ngIf="attrFinder('device', 'data_device')">
								<p>Device: {{attrFinder('device', 'data_device').device}} <ion-icon name="checkmark-circle-outline"></ion-icon></p>
							</div>
							<div class="error" *ngIf="!attrFinder('device', 'data_device')">
								<p>{{helper.find(componentSelection.attr_data, 'attr', 'data_device')?.item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
									<ion-icon name="close-circle-outline"></ion-icon>
								</p>
							</div>
							<h3>Reading</h3>
							<div *ngIf="attrFinder('device', 'data_device')?.readings">
								<div class="success"  *ngIf="helper.find(fhem.devices, 'device', helper.find(componentSelection.attr_data, 'attr', 'data_device').item.value).item.readings[helper.find(componentSelection.attr_data, 'attr', 'data_reading').item.value]">
									<p *ngIf="helper.find(componentSelection.attr_data, 'attr', 'data_reading')">
										Reading: {{helper.find(componentSelection.attr_data, 'attr', 'data_reading')?.item.value}}
										<ion-icon name="checkmark-circle-outline"></ion-icon>
									</p>
								</div>
								<div class="error"  *ngIf="!helper.find(fhem.devices, 'device', helper.find(componentSelection.attr_data, 'attr', 'data_device').item.value).item.readings[helper.find(componentSelection.attr_data, 'attr', 'data_reading').item.value]">
									<p *ngIf="helper.find(componentSelection.attr_data, 'attr', 'data_reading')">
										{{helper.find(componentSelection.attr_data, 'attr', 'data_reading')?.item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
										<ion-icon name="close-circle-outline"></ion-icon>
									</p>
								</div>
							</div>
							<div *ngIf="!attrFinder('device', 'data_device')?.readings">
								<div class="error">
									<p *ngIf="helper.find(componentSelection.attr_data, 'attr', 'data_reading')">
										{{helper.find(componentSelection.attr_data, 'attr', 'data_reading').item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
										<ion-icon name="close-circle-outline"></ion-icon>
									</p>
								</div>
							</div>
						</div>
					</div>
					<div class="config-container" *ngIf="componentSelection.comp.type === 'style'">
						<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_4_STYLE_COMPONENT' | translate }} {{componentSelection.comp.name}}</p>
					</div>
				</ng-template>
			</div>
			<div class="bottom-btns">
				<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="pageIndex === 1" class="prev" (click)="cancel()">
					{{ 'GENERAL.BUTTONS.CANCEL' | translate }}
				</button>
				<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="pageIndex !== 1" class="back" (click)="switchPage('prev')">
					{{ 'GENERAL.BUTTONS.BACK' | translate }}
				</button>
				<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="pageIndex !== 4" class="next" (click)="switchPage('next')">
					{{ 'GENERAL.BUTTONS.NEXT' | translate }}
				</button>
				<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="pageIndex === 4" class="next" (click)="addCompToRoom()">
					{{ 'GENERAL.BUTTONS.SAVE' | translate }}
				</button>
			</div>
		</div>
	</popup>

	<ng-template #NO_COMP>
		<div class="config-container">
			<p>{{ 'GENERAL.CREATE_COMPONENT.NO_COMPONENT_SELECTED' | translate }}</p>
		</div>
	</ng-template>
	`,
	styleUrls: ['./create-style.scss']
})
export class CreateComponentComponent {

	constructor(
		public fhem: FhemService,
		private structure: StructureService,
		public settings: SettingsService,
		public createComponent: CreateComponentService,
		public helper: HelperService) {
	}

	static key = 'CreateComponentComponent';
	public showPopup = false;
	public pageIndex = 1;

	public componentSelection: any;

	@Input() container;

	public selectComponent(comp) {
		this.pageIndex = 2;
		this.componentSelection = {};
		this.componentSelection.comp = comp;
		this.componentSelection.REF = comp.REF;
		this.componentSelection.dimensions = comp.dimensions;
		// build arrays
		this.componentSelection.attr_data = [];
		this.componentSelection.attr_bool_data = [];
		this.componentSelection.attr_arr_data = [];
		this.componentSelection.attr_style = [];
		this.componentSelection.attr_arr_style = [];
		this.componentSelection.attr_icon = [];

		for (const [key, value] of Object.entries(comp.component)) {
			if (`${key}`.substr(0, 4) === 'data') {
				this.componentSelection.attr_data.push({
					attr: `${key}`,
					value: `${value}`
				});
			}
			if (`${key}`.substr(0, 9) === 'bool_data') {
				this.componentSelection.attr_bool_data.push({
					attr: `${key}`,
					value: JSON.parse(`${value}`)
				});
			}
			if (`${key}`.substr(0, 8) === 'arr_data') {
				this.componentSelection.attr_arr_data.push({
					attr: `${key}`,
					value: this.strToArr(`${value}`)
				});
			}
			if (`${key}`.substr(0, 5) === 'style') {
				this.componentSelection.attr_style.push({
					attr: `${key}`,
					value: `${value}`
				});
			}
			if (`${key}`.substr(0, 9) === 'arr_style') {
				this.componentSelection.attr_arr_style.push({
					attr: `${key}`,
					value: this.strToArr(`${value}`)
				});
			}
			if (`${key}`.substr(0, 4) === 'icon') {
				this.componentSelection.attr_icon.push({
					attr: `${key}`,
					value: `${value}`
				});
			}
		}
	}

	public cancel() {
		this.showPopup = false;
		this.pageIndex = 1;
	}

	public switchPage(direction) {
		this.pageIndex = (direction === 'next') ? this.pageIndex + 1 : this.pageIndex - 1;
		if (this.pageIndex > 4) {
			this.pageIndex = 4;
		}
		if (this.pageIndex < 1) {
			this.pageIndex = 1;
		}
	}

	private strToArr(str) {
		return str.split(',');
	}

	public attrFinder(fhemAttr, userAttr) {
		if (this.helper.find(this.componentSelection.attr_data, 'attr', userAttr)) {
			const res = this.helper.find( this.fhem.devices, fhemAttr, this.helper.find(this.componentSelection.attr_data, 'attr', userAttr).item.value);
			if (res) {
				return res.item;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	public addCompToRoom() {
		this.pushComp(this.structure.roomComponents(this.container));
	}

	private pushComp(place) {
		place.push({
			ID: this.helper.UIDgenerator(),
			name: this.componentSelection.comp.name,
			REF: this.componentSelection.REF,
			attributes: {
				data: this.componentSelection.attr_data,
				bool_data: this.componentSelection.attr_bool_data,
				arr_data: this.componentSelection.attr_arr_data,
				style: this.componentSelection.attr_style,
				arr_style: this.componentSelection.attr_arr_style,
				icon: this.componentSelection.attr_icon
			},
			position: {
				top: 0,
				left: 0,
				width: this.componentSelection.dimensions.minX,
				height: this.componentSelection.dimensions.minY,
				zIndex: 1
			},
			createScaler: {
				width: window.innerWidth,
				height: window.innerHeight
			}
		});
		// check if selected component is a popup container
		if (this.componentSelection.comp.name.match(/(Popup|Swiper)/)) {
			place[place.length - 1].attributes.components = [];
		}
		// check if selected component is a swiper container
		if (this.componentSelection.comp.name.match(/(Swiper)/)) {
			// data_pages is the unique way to define multiple container components
			let pages = parseInt(this.componentSelection.attr_data.find(x => x.attr === 'data_pages').value);
			// ensure, that pages are positive and not 0
			pages = Math.abs(pages) === 0 ? 1 : Math.abs(pages);
			for (let i = 0; i < pages; i++) {
				place[place.length - 1].attributes.components.push({
					components: []
				});
			}
		}
		this.structure.saveRooms().then(() => {
			// adding the new component to the current view
			this.createComponent.loadRoomComponents([place[place.length - 1]], this.container, false);
		});

		// resetting the component creator
		this.showPopup = false;
		this.componentSelection = null;
		this.pageIndex = 1;
	}

	public validateComponentSelection(comp) {
		if (!this.container.element.nativeElement.parentNode.id.match(/(popup|swiper)/)) {
			return true;
		} else {
			return !comp.name.match(/(Popup|Swiper)/);
		}
	}
}
