import { Component, Input } from '@angular/core';

import { FhemService } from '../../services/fhem.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { CreateComponentService } from '../../services/create-component.service';
import { UndoRedoService } from '../../services/undo-redo.service';

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
		[fixPosition]="true"
		(onClose)="cancel()">
		<div class="page-container create" [ngClass]="'page-'+pageIndex+'-active'">
			<div class="page page-1">
				<p>{{ 'GENERAL.CREATE_COMPONENT.PAGE_1_INFO' | translate }}</p>
				<div class="component-list">
					<ng-container *ngFor="let comp of createComponent.fhemComponents">
						<div
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
						<div class="config-data" *ngFor="let data of componentSelection.attributes.attr_data">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate }}</p>
							<input [(ngModel)]="data.value" placeholder="{{data.value}}">
		      				<span class="bar"></span>
						</div>
						<div class="config-data toggle" *ngFor="let data of componentSelection.attributes.attr_bool_data">
							<switch
								[customMode]="true"
								[(ngModel)]="data.value"
								[label]="'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.name' | translate"
								[subTitle]="'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[data.attr]+'.info' | translate"
								[padding]="false">
							</switch>
						</div>
						<div class="config-data" *ngFor="let data of componentSelection.attributes.attr_arr_data">
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
						<div *ngIf="componentSelection.attributes.attr_icon?.length">
							<div class="config-data" *ngFor="let icon of componentSelection.attributes.attr_icon">
								<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[icon.attr]+'.name' | translate }}</p>
								<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[icon.attr]+'.info' | translate }}</p>
								<ng-select [items]="settings.icons"
									[searchable]="false"
									bindLabel="icon"
									bindValue="icon"
									placeholder="icon.value"
									[(ngModel)]="icon.value">
									<ng-template ng-option-tmp let-item="item" let-index="index">
									    <ion-icon *ngIf="item.type === 'ion'" [name]="item.icon"></ion-icon>
									    <fa-icon *ngIf="item.type != 'ion'" [icon]="[item.type, item.icon]"></fa-icon>
									    <span class="label">{{item.icon}}</span>
									</ng-template>
								</ng-select>
							</div>
						</div>
						<div class="config-data" *ngFor="let style of componentSelection.attributes.attr_style">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
							<ng-select [items]="settings.componentColors"
					            [addTag]="true"
					            [(ngModel)]="style.value">
					            <ng-template ng-option-tmp let-item="item" let-index="index">
					            	<span class="color" [style.background]="item"></span>
					            	<span class="color-label">{{item}}</span>
					            </ng-template>
					        </ng-select>
						</div>
						<div class="config-data" *ngFor="let style of componentSelection.attributes.attr_arr_style">
							<p>{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.name' | translate }}</p>
							<p class="des">{{ 'COMPONENTS.'+[componentSelection.comp.name]+'.INPUTS.'+[style.attr]+'.info' | translate }}</p>
							<ng-select [items]="settings.componentColors"
					            [multiple]="true"
					            [addTag]="true"
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
					<div class="config-container" *ngIf="componentSelection.comp.type == 'fhem' && pageIndex === 4">
						<div class="testing-data">
							<h3>Device</h3>
							<div class="success"  *ngIf="attrFinder('device', 'data_device')">
								<p>Device: {{attrFinder('device', 'data_device').device}} <ion-icon name="checkmark-circle-outline"></ion-icon></p>
							</div>
							<div class="error" *ngIf="!attrFinder('device', 'data_device')">
								<p>{{helper.find(componentSelection.attributes.attr_data, 'attr', 'data_device')?.item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
									<ion-icon name="close-circle-outline"></ion-icon>
								</p>
							</div>
							<h3>Reading</h3>
							<div *ngIf="attrFinder('device', 'data_device')?.readings && helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')">
								<div class="success"  *ngIf="helper.find(fhem.devices, 'device', helper.find(componentSelection.attributes.attr_data, 'attr', 'data_device').item.value).item.readings[helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading').item.value]">
									<p *ngIf="helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')">
										Reading: {{helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')?.item.value}}
										<ion-icon name="checkmark-circle-outline"></ion-icon>
									</p>
								</div>
								<div class="error"  *ngIf="!helper.find(fhem.devices, 'device', helper.find(componentSelection.attributes.attr_data, 'attr', 'data_device').item.value).item.readings[helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading').item.value]">
									<p *ngIf="helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')">
										{{helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')?.item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
										<ion-icon name="close-circle-outline"></ion-icon>
									</p>
								</div>
							</div>
							<div *ngIf="!attrFinder('device', 'data_device')?.readings">
								<div class="error">
									<p *ngIf="helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading')">
										{{helper.find(componentSelection.attributes.attr_data, 'attr', 'data_reading').item.value }} {{ 'GENERAL.CREATE_COMPONENT.PAGE_4_NOT_FOUND' | translate }}
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
		public helper: HelperService,
		private undoManager: UndoRedoService) {
	}

	static key = 'CreateComponentComponent';
	public showPopup = false;
	public pageIndex = 1;

	public componentSelection: any;

	@Input() container;

	public selectComponent(comp) {
		this.pageIndex = 2;
		this.componentSelection = {
			attributes: this.createComponent.seperateComponentValues(comp.component),
			comp: comp,
			REF: comp.REF,
			dimensions: comp.dimensions
		};
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
		// detect missing devices
		if(this.pageIndex === 4 && this.componentSelection.attributes.attr_data && this.helper.find(this.componentSelection.attributes.attr_data, 'attr', 'data_device')){
			const device = this.helper.find(this.componentSelection.attributes.attr_data, 'attr', 'data_device').item.value;
			if(device !== '' && !this.helper.find(this.fhem.devices, 'device', device)){
				// device is not in list
				this.fhem.listDevices(device);
			}
		}
	}

	public attrFinder(fhemAttr, userAttr) {
		if (this.helper.find(this.componentSelection.attributes.attr_data, 'attr', userAttr)) {
			const res = this.helper.find( this.fhem.devices, fhemAttr, this.helper.find(this.componentSelection.attributes.attr_data, 'attr', userAttr).item.value);
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
		this.settings.findNewColors([this.componentSelection.attributes.attr_style, this.componentSelection.attributes.attr_arr_style]);
		const place = this.structure.getComponentContainer(this.container);
		// push comp
		this.createComponent.pushComponentToPlace(place, this.componentSelection);
		// adding the new component to the current view
		this.createComponent.loadRoomComponents([place[place.length - 1]], this.container, false);
		// add to change stack
		this.undoManager.addChange();

		// resetting the component creator
		this.showPopup = false;
		this.componentSelection = null;
		this.pageIndex = 1;
	}
}
