import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/backButton.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'picker',
	template: `
		<div class="picker {{location}} {{settings.app.theme}}" *ngIf="show" [ngClass]="animate ? 'show' : 'hide'">
				<button class="picker-bg" (click)="closePicker(false)"></button>
				<div class="picker-inner" [ngStyle]="{'height': height, 'width': width}">
					<div class="picker-header">
							<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="showConfirmBtn" class="confirm btn" (click)="confirm()">{{confirmBtn}}</button>
							<button matRipple [matRippleColor]="'#d4d4d480'" *ngIf="showCancelBtn" class="cancel btn" (click)="closePicker(true)">{{cancelBtn}}</button>
					</div>
					<div class="picker-content">
							<ng-content></ng-content>
					</div>
				</div>
		</div>
	`,
	styles: [`
		.picker{
			width: 100%;
			height: 100%;
			position: fixed;
			overflow: hidden;
			top: 0;
			left: 0;
			z-index: 20005;
		}
		button:focus{
			outline: 0px;
		}
		.picker-bg{
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.2);
			will-change: opacity;
			opacity: 0;
			transition: all .2s ease-out;
		}
		.picker.show .picker-bg{
			opacity: 1;
		}
		.picker-inner{
			position: absolute;
			will-change: transform;
			background: #fff;
			transition: all .2s ease-out;
		}
		.picker.top .picker-inner{
			top: 0;
			transform: translate3d(0,-100%,0);
		}
		.picker.bottom .picker-inner{
			bottom: 0;
			transform: translate3d(0,100%,0);
		}
		.picker.bottom.show .picker-inner,
		.picker.top.show .picker-inner{
			transform: translate3d(0,0%,0);
		}
		.picker-header{
			width: 100%;
			height: 35px;
			padding-right: 8px;
		}
		.btn{
			min-width: 50px;
			height: 100%;
			font-size: 16px;
			font-weight: 500;
			background: transparent;
			color: #14a9d5;
			float: right;
		}
		.picker-content{
			position: absolute;
			width: 100%;
			height: calc(100% - 45px);
			bottom: 0;
			overflow-y: auto;
		}
		.dark .picker-inner{
			background: var(--dark-bg);
		}
	`],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: PickerComponent, multi: true}]
})

export class PickerComponent implements ControlValueAccessor {
		public show = false;
		public animate = false;

		@Input() width = '100%';
		@Input() height = '250px';

		@Input() confirmBtn: string;
		@Input() showConfirmBtn = true;
		@Input() cancelBtn: string;
		@Input() showCancelBtn = true;

		@Input() priority = 2;

		@Output() onOpen: EventEmitter<any> = new EventEmitter();
		@Output() onClose: EventEmitter<any> = new EventEmitter();
		@Output() onConfirm: EventEmitter<any> = new EventEmitter();
		@Output() onCancel: EventEmitter<any> = new EventEmitter();

		@Input() location = 'bottom';

		onTouched: () => void = () => {};
		onChange: (_: any) => void = (_: any) => {};
		updateChanges() {this.onChange(this.show); }
		registerOnChange(fn: any): void {this.onChange = fn; }
		registerOnTouched(fn: any): void {this.onTouched = fn; }

		writeValue(value) {
			this.show = value;
			if (value) {
				this.onOpen.emit();
				this.backBtn.handle(this.priority).then(() => {
					this.closePicker(false);
				});
				this.updateChanges();
				setTimeout(() => {this.animate = true; });
			}
		}

		constructor(
			public settings: SettingsService,
			private backBtn: BackButtonService,
			private translate: TranslateService) {
			this.confirmBtn = this.confirmBtn ? this.confirmBtn : this.translate.instant('GENERAL.BUTTONS.CONFIRM');
			this.cancelBtn = this.cancelBtn ? this.cancelBtn : this.translate.instant('GENERAL.BUTTONS.CANCEL');
		}

		public closePicker(emit) {
			this.animate = false;
			this.backBtn.removeHandle(this.priority);
			if (emit) { this.onCancel.emit(); }
			setTimeout(() => {
					this.show = false;
					this.updateChanges();
					this.onClose.emit();
			}, 200);
		}

		public confirm() {
			this.onConfirm.emit();
			this.closePicker(false);
		}
}
