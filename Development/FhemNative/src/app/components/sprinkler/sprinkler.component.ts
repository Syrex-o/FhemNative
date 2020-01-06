import { Component, Input, OnDestroy, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';

import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { TimeService } from '../../services/time.service';
import { StorageService } from '../../services/storage.service';
import { ToastService } from '../../services/toast.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'fhem-sprinkler',
	template: `
		<div
			[ngClass]="settings.app.theme"
			class="sprinkler" double-click
			[editingEnabled]="settings.modes.roomEdit"
			resize
			[minimumWidth]="minimumWidth"
			[minimumHeight]="minimumHeight"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}" >
			<fhem-container [specs]="{ID: ID, device: data_device, reading: null, available: true}">
				<div class="sprinkler-page-container" *ngIf="sprinklers.states?.length > 0">
					<div class="btn-box">
						<button *ngIf="sprinklers.smart.winterMode" matRipple [matRippleColor]="'#d4d4d480'" class="btn-icon left" (click)="openSettings('winterMode')">
							<ion-icon name="snow" class="snow" [ngClass]="sprinklers.smart.winterMode.Value ? 'on' : 'off'"></ion-icon>
						</button>
						<button *ngIf="sprinklers.smart.enabled" matRipple [matRippleColor]="'#d4d4d480'" class="btn-icon left" (click)="openSettings('smartSprinkler')">
							<ion-icon name="sunny" class="sun" [ngClass]="sprinklers.smart.enabled.Value ? 'on' : 'off'"></ion-icon>
						</button>
						<button matRipple [matRippleColor]="'#d4d4d480'" class="btn timeline center" (click)="showTimeline()">Timeline</button>
						<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-icon right" (click)="openSettings('settings')"><ion-icon name="cog"></ion-icon></button>
						<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-icon right" (click)="openSettings('colorMenu')"><ion-icon name="color-palette"></ion-icon></button>
					</div>
					<div class="sprinkler-switch-container" *ngIf="sprinklers.smart.runInterval">
						<div class="sprinkler-switch">
							<switch
								[customMode]="true"
								[(ngModel)]="sprinklers.smart.runInterval.Value"
								[label]="'COMPONENTS.Sprinkler.TRANSLATOR.RUN_INTERVAL.TITLE' | translate"
								[subTitle]="'COMPONENTS.Sprinkler.TRANSLATOR.RUN_INTERVAL.INFO' | translate"
								[actOnCallback]="true"
								(onToggle)="toggleAll($event)">
							</switch>
						</div>
						<div class="sprinkler-switch" *ngFor="let sprinkler of sprinklers.callbacks; let i = index">
							<switch
								[customMode]="true"
								[(ngModel)]="sprinkler.state"
								[label]="sprinklers.names[i]"
								[actOnCallback]="true"
								(onToggle)="toggle($event, i)"
								[subTitle]="subTitleResolver(i)">
							</switch>
						</div>
					</div>
				</div>
			</fhem-container>
		</div>
		<popup *ngIf="popupMode === 'colorMenu'"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[headLine]="'COMPONENTS.Sprinkler.TRANSLATOR.COLORS.TITLE' | translate"
			[(ngModel)]="openPopup"
			[data_width]="'90'"
			[data_height]="'90'"
			(onClose)="popupClose()"
			[fixPosition]="true">
			<div class="page">
				<div class="colorSet" *ngFor="let item of sprinklers.names; let i = index">
					<p>{{item}}</p>
					<table class="color-table">
						<tr [ngClass]="sprinklerColors.color[i].val">
							<td *ngFor="let elem of sprinklerColors.color; let j = index">
								<button class="color-item" [ngClass]="colorSelect[j]" (click)="setColor(colorSelect[j], i)" [style.background]="colorSelect[j]"></button>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</popup>
		<popup *ngIf="popupMode === 'smartSprinkler'"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[headLine]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.TITLE' | translate"
			[(ngModel)]="openPopup"
			[data_width]="'90'"
			[data_height]="'90'"
			(onClose)="popupClose()"
			[fixPosition]="true">
			<div class="page">
				<p>{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.INFO' | translate}}</p>
				<div class="category">
					<switch
						[customMode]="true"
						[actOnCallback]="true"
						[(ngModel)]="sprinklers.smart.enabled.Value"
						[label]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.ENABLE.TITLE' | translate"
						[subTitle]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.ENABLE.INFO' | translate"
						(onToggle)="changeSmartSetting('enabled', !sprinklers.smart.enabled.Value)">
					</switch>
				</div>
				<div *ngIf="sprinklers.smart.enabled.Value">
					<div class="category">
						<switch
							[customMode]="true"
							[actOnCallback]="true"
							[(ngModel)]="sprinklers.smart.rain.Value"
							[label]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.RAIN.TITLE' | translate"
							[subTitle]="('COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.RAIN.INFO' | translate)+sprinklers.smart.rainOff.Value+'l/&#13217;.'"
							(onToggle)="changeSmartSetting('rain', !sprinklers.smart.rain.Value)">
						</switch>
						<div class="options" *ngIf="sprinklers.smart.rain.Value">
							<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.RAIN_VALUE.TITLE' | translate}}</p>
							<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.RAIN_VALUE.INFO' | translate}}</p>
	                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
	                			[(ngModel)]="sprinklers.smart.rainOff.Value" (ionChange)="changeSmartSetting('rainOff', $event.detail.value)">
				                <ion-select-option [value]="5">5 l/m2</ion-select-option>
				                <ion-select-option [value]="10">10 l/m2</ion-select-option>
				                <ion-select-option [value]="15">15 l/m2</ion-select-option>
				            </ion-select>
						</div>
					</div>
					<div class="category">
						<switch
							[customMode]="true"
							[actOnCallback]="true"
							[(ngModel)]="sprinklers.smart.wind.Value"
							[label]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WIND.TITLE' | translate"
							[subTitle]="('COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WIND.INFO' | translate)+sprinklers.smart.windOff.Value+' km/h.'"
							(onToggle)="changeSmartSetting('wind', !sprinklers.smart.wind.Value)">
						</switch>
						<div class="options" *ngIf="sprinklers.smart.wind.Value">
							<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WIND_VALUE.TITLE' | translate}}</p>
							<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WIND_VALUE.INFO' | translate}}</p>
	                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
	                			[(ngModel)]="sprinklers.smart.windOff.Value" (ionChange)="changeSmartSetting('windOff', $event.detail.value)">
				                <ion-select-option [value]="30">30 km/h</ion-select-option>
				                <ion-select-option [value]="35">35 km/h</ion-select-option>
				                <ion-select-option [value]="40">40 km/h</ion-select-option>
				                <ion-select-option [value]="45">45 km/h</ion-select-option>
				                <ion-select-option [value]="50">50 km/h</ion-select-option>
				            </ion-select>
						</div>
					</div>
					<div class="category">
						<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAX_TEMP.TITLE' | translate}}</p>
                		<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAX_TEMP.INFO' | translate}}{{sprinklers.smart.highTemp.Value}}&#8451;.</p>
                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
                			[(ngModel)]="sprinklers.smart.highTemp.Value" (ionChange)="changeSmartSetting('highTemp', $event.detail.value)">
			                <ion-select-option [value]="25">25&#8451;</ion-select-option>
			                <ion-select-option [value]="30">30&#8451;</ion-select-option>
			            </ion-select>
			        	<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAX_TEMP_VALUE.TITLE' | translate}}</p>
                		<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAX_TEMP_VALUE.INFO' | translate}}</p>
                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
                			[(ngModel)]="sprinklers.smart.highPercentage.Value" (ionChange)="changeSmartSetting('highPercentage', $event.detail.value)">
			                <ion-select-option [value]="10">10%</ion-select-option>
		                    <ion-select-option [value]="20">20%</ion-select-option>
		                    <ion-select-option [value]="30">30%</ion-select-option>
		                    <ion-select-option [value]="40">40%</ion-select-option>
			            </ion-select>
			        </div>
			        <div class="category">
						<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MIN_TEMP.TITLE' | translate}}</p>
                		<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MIN_TEMP.INFO' | translate}}{{sprinklers.smart.lowTemp.Value}}&#8451;.</p>
                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
                			[(ngModel)]="sprinklers.smart.lowTemp.Value" (ionChange)="changeSmartSetting('lowTemp', $event.detail.value)">
			                <ion-select-option [value]="15">15&#8451;</ion-select-option>
			                <ion-select-option [value]="10">10&#8451;</ion-select-option>
			            </ion-select>
			            <p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MIN_TEMP_VALUE.TITLE' | translate}}</p>
                		<p class="des_small">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MIN_TEMP_VALUE.INFO' | translate}}</p>
                		<ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
                			[(ngModel)]="sprinklers.smart.lowPercentage.Value" (ionChange)="changeSmartSetting('lowPercentage', $event.detail.value)">
			                <ion-select-option [value]="10">10%</ion-select-option>
		                    <ion-select-option [value]="20">20%</ion-select-option>
		                    <ion-select-option [value]="30">30%</ion-select-option>
		                    <ion-select-option [value]="40">40%</ion-select-option>
			            </ion-select>
					</div>
					<div class="category">
						<switch
							[customMode]="true"
							[actOnCallback]="true"
							[(ngModel)]="sprinklers.smart.winterProtect.Value"
							[label]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAIL.TITLE' | translate"
							[subTitle]="('COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAIL.INFO' | translate)+'5&#8451;'"
							(onToggle)="changeSmartSetting('winterProtect', !sprinklers.smart.winterProtect.Value)">
						</switch>
						<div class="options" *ngIf="sprinklers.smart.winterProtect.Value">
							<button class="mail" (click)="editMail('')">
								<p class="mail-des">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.MAIL_VALUE.TITLE' | translate}}
									<span class="icon-container">
										<ion-icon ios="md-create" md="md-create"></ion-icon>
									</span>
								</p>
							</button>
							<p class="mail-label">{{formatMail(sprinklers.smart.mail.Value, 'display')}}</p>
						</div>
					</div>
				</div>
			</div>
		</popup>
		<popup *ngIf="popupMode === 'winterMode'"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[headLine]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WINTER.TITLE' | translate"
			[(ngModel)]="openPopup"
			[data_width]="'90'"
			[data_height]="'90'"
			(onClose)="popupClose()"
			[fixPosition]="true">
			<div class="page">
				<p>{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WINTER.INFO' | translate}}</p>
				<div class="category">
					<switch
						[customMode]="true"
						[actOnCallback]="true"
						[(ngModel)]="sprinklers.smart.winterMode.Value"
						[label]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WINTER.BUTTONS.TITLE' | translate"
						[subTitle]="'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WINTER.BUTTONS.INFO' | translate"
						(onToggle)="changeSmartSetting('winterMode', !sprinklers.smart.winterMode.Value)">
					</switch>
				</div>
			</div>
		</popup>
		<popup *ngIf="popupMode === 'settings'"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[headLine]="'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.TITLE' | translate"
			[(ngModel)]="openPopup"
			[data_width]="'100'"
			[data_height]="'100'"
			(onClose)="popupClose()"
			[fixPosition]="true">
			<ion-slides *ngIf="arr_data_settingsStyle[0] === 'slider'">
				<ion-slide *ngFor="let j of [1,2]">
					<ng-container *ngIf="sprinklers.states?.length > 0">
						<div class="sprinkler-interval" [ngClass]="'interval'+j">
							<div *ngIf="j === 2" class="overlay-interval2"
									[ngStyle]="{'transform': (!sprinklers.smart.enableInterval2.Value ? 'translate3d(0,0,0)' : 'translate3d(100%, 0, 0)')}">
							</div>
							<div class="start-time">
								<h5>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.TITLE' | translate}} {{j}}</h5>
								<button *ngIf="j === 1" matRipple [matRippleColor]="'#d4d4d480'" class="btn timeline" (click)="showWeather()">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WEATHER' | translate}}</button>
								<button *ngIf="j === 2" matRipple [matRippleColor]="'#d4d4d480'" class="btn timeline" [ngStyle]="{'z-index': 11}" (click)="changeSmartSetting('enableInterval2', !sprinklers.smart.enableInterval2.Value)">
									{{sprinklers.smart.enableInterval2.Value ? ('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL_2.DISABLE' | translate) : ('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL_2.ENABLE' | translate)}}
								</button>
								<timepicker
									[customMode]="true"
									[actOnCallback]="true"
									[label]="'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.START_TIME' | translate"
									[(ngModel)]="sprinklers.times['interval'+j][0].startTime"
									(onTimeChange)="setEnd(sprinklers.times['interval'+j][0].device, 0, $event, sprinklers.times['interval'+j][0].duration, 'inter'+j)">
								</timepicker>
								<div class="summary category">
	                            	<h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.TOTAL_RUNTIME' | translate}}</h4>
	                            	<p class="runtime">{{sprinklers.totalDuration['start'+j]}} - {{sprinklers.totalDuration['end'+j]}}</p>
	                           	</div>
							</div>
							<div class="singleSprinkler category" *ngFor="let item of sprinklers.times['interval'+j]; let i = index">
								<h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.CYCLE' | translate}}</h4>
								<div class="naming" (click)="editName(i)">
									<span class="color" [style.background]="sprinklerColors.color[i].val"></span>
		                           	<ion-label class="sprinklerName">{{sprinklers.names[i]}}</ion-label>
		                           	<ion-icon class="edit" ios="md-create" md="md-create"></ion-icon>
		                        </div>
		                        <div class="sprinklerDuration">
		                           	<timepicker
										[customMode]="true"
										[actOnCallback]="true"
										[label]="'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME' | translate"
										[maxHours]="'4'"
										[(ngModel)]="sprinklers.times['interval'+j][i].duration"
										(onTimeChange)="setEnd(sprinklers.times['interval'+j][i].device, i, sprinklers.times['interval'+j][i].startTime, $event, 'inter'+j)">
									</timepicker>
	                           	</div>
	                           	<button matRipple [matRippleColor]="'#d4d4d480'" (click)="select.open()" class="select-btn">
	                           		<ion-label class="weekday">{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.WEEKDAYS' | translate}}</ion-label>
	                           		<ion-select #select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
			                        	multiple="true" [(ngModel)]="sprinklers.times['interval'+j][i].days.days" (ionChange)="changeWeekdays($event, i, 'inter'+j)">
			                            <ion-select-option value="1">{{'GENERAL.DICTIONARY.WEEKDAYS.MONDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="2">{{'GENERAL.DICTIONARY.WEEKDAYS.TUESDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="3">{{'GENERAL.DICTIONARY.WEEKDAYS.WEDNESDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="4">{{'GENERAL.DICTIONARY.WEEKDAYS.THURSDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="5">{{'GENERAL.DICTIONARY.WEEKDAYS.FRIDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="6">{{'GENERAL.DICTIONARY.WEEKDAYS.SATURDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="0">{{'GENERAL.DICTIONARY.WEEKDAYS.SUNDAY' | translate}}</ion-select-option>
			                        </ion-select>
	                           	</button>
			                    <div class="summary">
			                        <h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.SUMMARY' | translate}}</h4>
			                        <p class="runtime">
			                            {{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME' | translate}} {{sprinklers.times['interval'+j][i].startTime}} - {{sprinklers.times['interval'+j][i].endTime}} ({{sprinklers.times['interval'+j][i].duration}})<br>
			                            {{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.WEEKDAYS' | translate}} <span *ngIf="sprinklers.times['interval'+j][i].days.allDays === true">{{'GENERAL.DICTIONARY.WEEKDAYS.DAILY' | translate}}.</span>
			                            <span *ngIf="sprinklers.times['interval'+j][i].days.allDays === false"><span *ngFor="let day of sprinklers.times['interval'+j][i].days.textDays; let j = index">{{ day }}</span></span>
			                        </p>
			                    </div>
							</div>
						</div>
					</ng-container>
				</ion-slide>
			</ion-slides>
			<div class="page list" *ngIf="arr_data_settingsStyle[0] === 'list'">
				<div *ngFor="let j of [1,2]">
					<ng-container *ngIf="sprinklers.states?.length > 0">
						<div class="sprinkler-interval" [ngClass]="'interval'+j">
							<div *ngIf="j === 2" class="overlay-interval2"
									[ngStyle]="{'transform': (!sprinklers.smart.enableInterval2.Value ? 'translate3d(0,0,0)' : 'translate3d(100%, 0, 0)')}">
							</div>
							<div class="start-time">
								<h5>Bewässerungs-Zyklus {{j}}</h5>
								<button *ngIf="j === 1" matRipple [matRippleColor]="'#d4d4d480'" class="btn timeline" (click)="showWeather()">{{'COMPONENTS.Sprinkler.TRANSLATOR.SMART_SPRINKLER.CONFIG.WEATHER' | translate}}</button>
								<button *ngIf="j === 2" matRipple [matRippleColor]="'#d4d4d480'" class="btn timeline" [ngStyle]="{'z-index': 11}" (click)="changeSmartSetting('enableInterval2', !sprinklers.smart.enableInterval2.Value)">
									{{sprinklers.smart.enableInterval2.Value ? ('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL_2.DISABLE' | translate) : ('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL_2.ENABLE' | translate)}}
								</button>
								<timepicker
									[customMode]="true"
									[actOnCallback]="true"
									[label]="'Start Zeit:'"
									[(ngModel)]="sprinklers.times['interval'+j][0].startTime"
									(onTimeChange)="setEnd(sprinklers.times['interval'+j][0].device, 0, $event, sprinklers.times['interval'+j][0].duration, 'inter'+j)">
								</timepicker>
								<div class="summary category">
	                            	<h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.SUMMARY' | translate}}</h4>
	                            	<p class="runtime">{{sprinklers.totalDuration['start'+j]}} - {{sprinklers.totalDuration['end'+j]}}</p>
	                           	</div>
							</div>
							<div class="singleSprinkler category" *ngFor="let item of sprinklers.times['interval'+j]; let i = index">
								<h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.CYCLE' | translate}}</h4>
								<div class="naming" (click)="editName(i)">
									<span class="color" [style.background]="sprinklerColors.color[i].val"></span>
		                           	<ion-label class="sprinklerName">{{sprinklers.names[i]}}</ion-label>
		                           	<ion-icon class="edit" ios="md-create" md="md-create"></ion-icon>
		                        </div>
		                        <div class="sprinklerDuration">
		                           	<timepicker
										[customMode]="true"
										[actOnCallback]="true"
										[label]="'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME' | translate"
										[maxHours]="'4'"
										[(ngModel)]="sprinklers.times['interval'+j][i].duration"
										(onTimeChange)="setEnd(sprinklers.times['interval'+j][i].device, i, sprinklers.times['interval'+j][i].startTime, $event, 'inter'+j)">
									</timepicker>
	                           	</div>
	                           	<ion-item>
			                        <ion-label class="weekday">Wochentage:</ion-label>
			                        <ion-select [okText]="'GENERAL.BUTTONS.CONFIRM' | translate" [cancelText]="'GENERAL.BUTTONS.CANCEL' | translate"
			                        	multiple="true" [(ngModel)]="sprinklers.times['interval'+j][i].days.days" (ionChange)="changeWeekdays($event, i, 'inter'+j)">
			                            <ion-select-option value="1">{{'GENERAL.DICTIONARY.WEEKDAYS.MONDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="2">{{'GENERAL.DICTIONARY.WEEKDAYS.TUESDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="3">{{'GENERAL.DICTIONARY.WEEKDAYS.WEDNESDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="4">{{'GENERAL.DICTIONARY.WEEKDAYS.THURSDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="5">{{'GENERAL.DICTIONARY.WEEKDAYS.FRIDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="6">{{'GENERAL.DICTIONARY.WEEKDAYS.SATURDAY' | translate}}</ion-select-option>
			                            <ion-select-option value="0">{{'GENERAL.DICTIONARY.WEEKDAYS.SUNDAY' | translate}}</ion-select-option>
			                        </ion-select>
			                    </ion-item>
			                    <div class="summary">
			                        <h4>{{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.SUMMARY' | translate}}</h4>
			                        <p class="runtime">
			                            {{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME' | translate}} {{sprinklers.times['interval'+j][i].startTime}} - {{sprinklers.times['interval'+j][i].endTime}} ({{sprinklers.times['interval'+j][i].duration}})<br>
			                            {{'COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.WEEKDAYS' | translate}} <span *ngIf="sprinklers.times['interval'+j][i].days.allDays === true">{{'GENERAL.DICTIONARY.WEEKDAYS.DAILY' | translate}}.</span>
			                            <span *ngIf="sprinklers.times['interval'+j][i].days.allDays === false"><span *ngFor="let day of sprinklers.times['interval'+j][i].days.textDays; let j = index">{{ day }}</span></span>
			                        </p>
			                    </div>
							</div>
						</div>
					</ng-container>
				</div>
			</div>
		</popup>
		<picker
			[ngClass]="settings.app.theme"
			[height]="'100%'"
			[showConfirmBtn]="false"
			[cancelBtn]="'GENERAL.BUTTONS.CLOSE' | translate"
			[(ngModel)]="timeline">
			<div class="page">
				<table class="calendar">
			        <tr class="weekdays">
			            <td *ngFor="let item of [
			            '',
			            ('GENERAL.DICTIONARY.WEEKDAYS.MONDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.TUESDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.WEDNESDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.THURSDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.FRIDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.SATURDAY' | translate),
			            ('GENERAL.DICTIONARY.WEEKDAYS.SUNDAY' | translate)
			            ]"><p>{{item.substr(0,2)}}</p></td>
			        </tr>
			    </table>
			    <div class="content_calendar" [ngClass]="local.today" *ngIf="sprinklerColors?.color">
			    	<span class="local-percentage" [ngStyle]="{'top': local.percentage}"></span>
			      	<div class="timeContainer">
	                    <p class="day-time" *ngFor="let item of ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']">{{item}}:00</p>
	                </div>
	                <div class="calendarDay" *ngFor="let day of ['1', '2', '3', '4', '5', '6', '7']; let i = index">
	                  	<div *ngFor="let values of timeArr; let j = index" class="times_calendar">
	                  		<span class="time-elem" *ngFor="let k of [1,2]"
	                  			[ngClass]="(sprinklers.smart.tooRainy || sprinklers.smart.tooWindy) || (k === 2 && !sprinklers.smart.enableInterval2.Value) ? 'disabled' : 'enabled'"
	                   			[ngStyle]="{'top': timeArr[j]['startP_'+k+'_'+day], 'height': timeArr[j]['heightP_'+k+'_'+day], 'background-color': sprinklerColors.color[j].val}"
	                  			(click)="showRuntime(j)">
	                   		</span>
	                   		<span class="time-elem" *ngFor="let k of [1,2]"
	                   			[ngClass]="(sprinklers.smart.tooRainy || sprinklers.smart.tooWindy) || (k === 2 && !sprinklers.smart.enableInterval2.Value) ? 'disabled' : 'enabled'"
	                   			[ngStyle]="{'top': timeArr[j]['startFromNullP_'+k+'_'+day], 'height': timeArr[j]['heightFromNullP_'+k+'_'+day], 'background-color': sprinklerColors.color[j].val}"
	                   			(click)="showRuntime(j)">
	                   		</span>
	                   	</div>
	                </div>
			    </div>
			</div>
		</picker>
		<picker
			[ngClass]="settings.app.theme"
			[height]="'60%'"
			[showConfirmBtn]="false"
			[cancelBtn]="'Schließen'"
			[(ngModel)]="weather">
			<div class="page" *ngIf="sprinklers.weather.wind">
				<p>
					{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.FORECAST' | translate}}
				</p>
				<div class="category">
					<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.MAX_TEMP_TODAY' | translate}}{{sprinklers.weather.maxTemp.Value}}&#8451;</p>
				</div>
				<div class="category">
					<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.MIN_TEMP_TODAY' | translate}}{{sprinklers.weather.minTemp.Value}}&#8451;</p>
				</div>
				<div class="category">
					<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.WIND_TODAY' | translate}}{{sprinklers.weather.wind.Value}} km/h</p>
					<p class="des_small" *ngIf="sprinklers.weather.tooWindy.Value">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.WIND_TODAY_OFF' | translate}}</p>
				</div>
				<div class="category">
					<p class="des">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.RAIN_TODAY' | translate}}{{sprinklers.weather.rain.Value}} l/m2</p>
					<p class="des_small" *ngIf="sprinklers.weather.tooRainy.Value">{{'COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.RAIN_TODAY_OFF' | translate}}</p>
				</div>
			</div>
		</picker>
	`,
	styles: [`
		.sprinkler{
			position: absolute;
			width: 400px;
			height: 600px;
		}
		.sprinkler-page-container{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		.btn-box{
			width: 100%;
			height: 50px;
		}
		.btn-icon{
			position: relative;
			width: 45px;
			height: 45px;
			border-radius: 50%;
			background: #ffffff;
			border: none;
			z-index: 10;
			top: 10px;
			margin-left: 5px;
			margin-right: 5px;
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
			display: inline-block;
		}
		.btn{
			font-family: "Roboto", sans-serif;
			text-transform: uppercase;
			outline: 0;
			min-width: 100px;
			border: 0;
			padding: 12px;
			color: #FFFFFF;
			font-size: 14px;
			cursor: pointer;
			background: var(--btn-blue);
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		}
		.btn.center{
			position: absolute;
			left: 50%;
			transform: translate3d(-50%,0,0);
			top: 12px;
		}
		.btn-icon.right{
			float: right;
		}
		.btn-icon.left{
			float: left;
		}
		ion-icon{
			width: 100%;
			height: 100%;
		}
		button:focus{
			outline: 0px;
		}
		.sprinkler-switch-container{
			margin-top: 15px;
		}
		.sprinkler-switch{
			margin-bottom: 10px;
			margin-left: 8px;
			margin-right: 8px;
			border-bottom: var(--dark-border-full);
		}
		.sun.on{
			color: #efe70d;
		}
		.snow.on{
			color: #14a9d5;
		}
		.sun.off,
		.snow.off{
			color: #000;
		}
		.page{
			height: 100%;
			width: 100%;
			overflow-y: scroll;
			padding: 8px;
		}
		.colorSet{
			margin-bottom: 20px;
			height: 70px;
			position: relative;
			border-bottom: var(--dark-border-full);
		}
		.colorSet p{
			text-align: center;
		}
		.color-table{
			width: 100%;
		}
		.color-table td{
			position: relative;
		}
		.color-item{
			width: 25px;
			height: 25px;
			border-radius: 25px;
			top: 0;
			position: absolute;
			left: 0;
			right: 0;
			margin: auto;
		}
		.color-item::after{
			content: '';
			position: absolute;
			width: 120%;
			height: 120%;
			border-radius: 50%;
			border: 2px solid var(--dark-border);
			transform: translate3d(-50%, -50%,0);
			opacity: 0;
			transition: all .3s ease;
		}
		.red .color-item.red::after,
		.green .color-item.green::after,
		.blue .color-item.blue::after,
		.orange .color-item.orange::after,
		.yellow .color-item.yellow::after,
		.purple .color-item.purple::after,
		.white .color-item.white::after,
		.gray .color-item.gray::after{
			opacity: 1;
		}
		.category{
			margin-bottom: 10px;
			border-bottom: var(--dark-border-full);
		}
		.des{
			margin-bottom: 2px;
			font-size: 16px;
			margin-left: 8px;
			margin-top:0px;
			font-weight: 500;
		}
		.des_small{
			font-size: 0.8em;
			color: var(--p-small) !important;
			margin: 0;
			margin-left: 8px;
		}
		.mail{
			background: transparent;
			width: 100%;
			position: relative;
			font-size: 16px;
			font-weight: 500;
			text-align: left;
			margin-top: -10px;
		}
		.mail-label{
			margin-left: 8px;
			margin-top: -10px;
		}
		.icon-container{
			width: 20px;
			height: 20px;
			position: absolute;
			margin-left: 10px;
		}
		ion-slides{
			position: relative;
			height: 100%;
			overflow-y: scroll;
		}
		.sprinkler-interval{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			padding-left: 8px;
			padding-right: 8px;
		}
		.list .sprinkler-interval{
			position: relative;
			text-align: center;
			padding: 0px;
			overflow-x: hidden;
		}
		.overlay-interval2{
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			z-index: 10;
			transition: all .3s ease;
			background: var(--dark-overlay);
		}
		.runtime{
			font-family: "Roboto", sans-serif;
			font-size: .9em;
			font-weight: 300;
			margin-top: 0;
			margin-bottom: 5px;
		}
		.color{
			position: absolute;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			transform: translate3d(-25px,0,0);
		}
		.edit{
			position: absolute;
			height: 20px;
			width: 20px;
			transform: translate3d(5px,0,0);
		}
		ion-item{
			--padding-start: 8px;
			font-weight: 500;
		}
		.calendar{
			width: 100%;
			height: 60px;
			border-bottom: var(--dark-border-full);
			position: fixed;
			z-index: 2;
			margin-top: -10px;
			left: 0;
			background: #fff;
		}
		.calendar .weekdays td{
			width: 12.5%;
			height: 40px;
			top: -1px;
			border-right: $border-bottom;
		}
		.calendar .weekdays p{
			text-align: center;
		}
		.content_calendar{
			position: relative;
			height: 1440px;
			top: 50px;
			overflow-x: hidden;
			width: calc(100% + 8px);
		}
		.timeContainer{
			width: 12.5%;
			height: 100%;
			border-right: var(--dark-border-full);
		}
		.day-time{
			height: 60px;
			line-height: 100px;
			margin: 0px;
			position: relative;
		}
		.day-time::after{
			content: "";
			position: absolute;
			width: 100vw;
			height: 1px;
			background: var(--dark-border);
			bottom: 9.5px;
		}
		.times_calendar{
			position: absolute;
			width: 100%;
			height: 100%;
		}
		.time-elem{
			position: absolute;
			width: 100%;
			margin-top: -10px;
			overflow: hidden;
			z-index: 1;
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
		}
		.time-elem.disabled:before,
		.time-elem.disabled:after{
			content: '';
			position: absolute;
			width: 100%;
			height: 1px;
			background-color: var(--dark-bg);
			transform: rotate(-45deg);
		}
		.time-elem.disabled:after{
			left: 40%;
		}
		.calendarDay{
			position: absolute;
			top: 0;
			height: 1440px;
			width: 12.5%;
			left: 12.5%;
			border-right: var(--dark-border-full);
		}
		.calendarDay:nth-child(3){
			left: 12.5%;
		}
		.calendarDay:nth-child(4){
			left: 25%;
		}
		.calendarDay:nth-child(5){
			left: 37.5%;
		}
		.calendarDay:nth-child(6){
			left: 50%;
		}
		.calendarDay:nth-child(7){
			left: 62.5%;
		}
		.calendarDay:nth-child(8){
			left: 75%;
		}
		.calendarDay:nth-child(9){
			left: 87.5%;
		}
		.local-percentage{
			position: absolute;
		    width: 100%;
		    height: 1px;
		    background: var(--btn-green);
		    opacity: 0.5;
		    margin-top: -10px;
		}
		.select-btn{
			width: 100%;
			position: relative;
			background: transparent;
			display: inline-flex;
			font-size: 16px;
			font-weight: 500;
		}
		.select-btn ion-select{
			max-width: 200px;
			position: absolute;
			right: 0;
			height: 45px;
		}
		.select-btn ion-label{
			line-height: 40px;
		}


		.dark .calendar{
			background: var(--dark-bg);
		}
		.dark .btn-icon{
			background: var(--dark-bg-dark);
		}
		.dark ion-item{
			--background: transparent;
		}
		.dark .sun.off,
		.dark .snow.off,
		.dark p,
		.dark h5,
		.dark ion-datetime,
		.dark ion-select,
		.dark h3,
		.dark h4,
		.dark .right ion-icon,
		.dark ion-label,
		.dark ion-icon.edit{
			color: var(--dark-p);
		}
	`],
})
export class SprinklerComponent implements OnInit, OnDestroy {

    constructor(
		private fhem: FhemService,
		public settings: SettingsService,
		private time: TimeService,
		private translate: TranslateService,
		private storage: StorageService,
		private toast: ToastService) {
    	this.storage.setAndGetSetting({
    		name: 'sprinklerColors',
    		default: '{"color": [{"val": "gray"}, {"val": "gray"}, {"val": "gray"}, {"val": "gray"}, {"val": "gray"}, {"val": "gray"}, {"val": "gray"}, {"val": "gray"}]}'
    	}).then((res: any) => {
    		this.sprinklerColors = res;
    	});
	}
	public minimumWidth = 200;
	public minimumHeight = 200;

	// Component ID
	@Input() ID: number;

	// needed devices
	@Input() data_device: string|string[];
	@Input() data_weather: string;
	@Input() data_smartSprinkler: string;
	@Input() arr_data_settingsStyle: string|string[];

	// position information
	@Input() width: any;
	@Input() height: any;
	@Input() top: any;
	@Input() left: any;
	@Input() zIndex: number;

	// fhem event subscribtions
	private deviceChange: Subscription;

	// Sprinkler Definition
	public deviceList: Array<any>;
	public sprinklers: any = {
        times: {interval1: [], interval2: [], manual: [], next: []},
        states: [],
        callbacks: [],
        names: [],
        smart: {},
        weather: {},
        totalDuration: {start1: '', end1: '', start2: '', end2: '', duration1: '', duration2: ''}
    };

    public colorSelect: Array<any> = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'white', 'gray'];
    public sprinklerColors: any;

    public popupMode: string;
    public openPopup = false;

    // weather
    public weather = false;
    // Timeline
    public timeline = false;
    public local: any = {
    	today: this.time.local().weekdayText,
    	percentage: 0
    };
    public timeArr: Array<any> = [];

	static getSettings() {
		return {
			name: 'Sprinkler',
			component: 'SprinklerComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: 'Sprinkler1,Sprinkler2,Sprinkler3,Sprinkler4,Sprinkler5,Sprinkler6'},
				{variable: 'arr_data_settingsStyle', default: 'slider,list'},
				{variable: 'data_weather', default: 'WetterInfo'},
				{variable: 'data_smartSprinkler', default: 'SmartSprinkler'}
			],
			dimensions: {minX: 200, minY: 200}
		};
	}


    public openSettings(mode) {
    	this.popupMode = (!this.openPopup) ? mode : '';
    	this.openPopup = !this.openPopup;
    }

    public popupClose() {
    	this.openPopup = false;
    	setTimeout(() => {
    		this.popupMode = '';
    	}, 300);
    }

    public showTimeline() {this.timeline = !this.timeline; }
	public showWeather() {this.weather = !this.weather; }

	ngOnInit() {
		if (this.data_device) {
			this.data_device = (typeof this.data_device === 'string') ? this.data_device.split(',') : this.data_device;
			// reset arrays
			this.deviceList = [];
			this.sprinklers.times.interval1 = [];
	  this.sprinklers.times.interval2 = [];
	  this.sprinklers.times.manual = [];
	  this.sprinklers.states = [];
	  this.sprinklers.callbacks = [];
	  this.sprinklers.names = [];

	  for (let i = 0; i < this.data_device.length; i++) {
	        	this.fhem.getDevice(this.data_device[i], false).then((device: any) => {
	        		if (device) {
						const reading = device.readings;
						for (let j = 1; j <= 2; j++) {
							this.sprinklers.times['interval' + j].push({
								device: device.device,
								startTime: reading['interval' + j].Value.match(/(^.{5})/)[0],
								endTime: reading['interval' + j].Value.match(/.{5}$/)[0],
								smartStart: reading['smartStart' + j].Value,
								smartEnd: reading['smartEnd' + j].Value,
								smartDuration: this.time.duration(reading['smartStart' + j].Value, reading['smartEnd' + j].Value).time,
								duration: this.time.duration(reading['interval' + j].Value.match(/(^.{5})/)[0], reading['interval' + j].Value.match(/.{5}$/)[0]).time,
								days: this.days(reading['days' + j].Value)
							});
						}
						this.sprinklers.states.push({state: JSON.parse(reading.state.Value)});
						this.sprinklers.callbacks.push({state: JSON.parse(reading.callbackState.Value)});
						this.sprinklers.names.push(reading.name.Value.replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/Ã/g, 'ß'));
						this.sprinklers.times.manual.push({
			                startTime: reading.manualTime.Value.match(/(^.{5})/)[0],
			                endTime: reading.manualTime.Value.match(/(.{5}$)/)[0]
			            });

			   this.deviceList.push(device);
			   if (i === this.data_device.length - 1) {
			            	this.fhem.getDevice(this.data_weather, false).then((weather: any) => {
			            		if (weather) {
			            			this.sprinklers.weather = weather.readings;
			            		}
					        	   this.fhem.getDevice(this.data_smartSprinkler, false).then((smart: any) => {
						        	if (smart) {
						        		this.sprinklers.smart = smart.readings;
						        		this.totalDurations();
				        				this.initTimeLine();
				        				this.detectNextTimes();
				        				this.deviceChange = this.fhem.devicesSub.subscribe(next => {this.listen(next); });
						        	}
						        });
					        });
			        	}
	        		}
	        	});
	        }
		}
	}

	private listen(update) {
		for (let i = 0; i < this.deviceList.length; i++) {
			if (update.found.device === this.deviceList[i].device) {
				for (let j = 1; j <= 2; j++) {
					if (update.change.changed['interval' + j]) {
						this.sprinklers.times['interval' + j][i].startTime = update.change.changed['interval' + j].match(/(^.{5})/)[0];
						this.sprinklers.times['interval' + j][i].endTime = update.change.changed['interval' + j].match(/.{5}$/)[0];
						this.sprinklers.times['interval' + j][i].duration = this.time.duration(update.change.changed['interval' + j].match(/(^.{5})/)[0], update.change.changed['interval' + j].match(/.{5}$/)[0]).time;
					}
					if (update.change.changed['days' + j]) {
						this.sprinklers.times['interval' + j][i].days = this.days(update.change.changed['days' + j]);
					}
					if (update.change.changed['smartStart' + j] && update.change.changed['smartEnd' + j]) {
						this.sprinklers.times['interval' + j][i].smartStart = update.change.changed['smartStart' + j];
						this.sprinklers.times['interval' + j][i].smartEnd = update.change.changed['smartEnd' + j];
						this.sprinklers.times['interval' + j][i].smartDuration = this.time.duration(this.sprinklers.times['interval' + j][i].smartStart, this.sprinklers.times['interval' + j][i].smartEnd).time;
					}
				}
				if (update.found.device.indexOf('Sprinkler') !== -1) {
					if (update.change.changed.manualTime) {
						this.sprinklers.times.manual[i].startTime = update.change.changed.manualTime.match(/(^.{5})/)[0];
						this.sprinklers.times.manual[i].endTime = update.change.changed.manualTime.match(/.{5}$/)[0];
					}
					if (update.change.changed.name) {
						this.sprinklers.names[i] = update.change.changed.name;
					}
					if (Object.keys(update.change.changed).includes('callbackState')) {
						this.sprinklers.callbacks[i].state = update.change.changed.callbackState;
					}
				}
			}
		}
		if (update.found.device === this.data_smartSprinkler) {
			this.sprinklers.smart = this.fhem.replyHandler(this.sprinklers.smart, update.change.changed);
		}
		if (update.found.device === this.data_weather) {
			this.sprinklers.weather = this.fhem.replyHandler(this.sprinklers.weather, update.change.changed);
		}
		this.totalDurations();
		this.initTimeLine();
		this.detectNextTimes();
	}

	private days(weekdays) {
        let days = [], arr = [], allDays = false;
        weekdays = typeof weekdays === 'number' ? weekdays.toString() : weekdays;
        for (let i = 0; i < weekdays.length; i++) {
            days.push(weekdays.slice(i, i + 1));
            if (weekdays[i] === '1') {
                arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.MONDAY'));
            }
            if (weekdays[i] === '2') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.TUESDAY'));
            }
            if (weekdays[i] === '3') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.WEDNESDAY'));
            }
            if (weekdays[i] === '4') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.THURSDAY'));
            }
            if (weekdays[i] === '5') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.FRIDAY'));
            }
            if (weekdays[i] === '6') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.SATURDAY'));
            }
            if (weekdays[i] === '0') {
                 arr.push(this.translate.instant('GENERAL.DICTIONARY.WEEKDAYS.SUNDAY'));
            }
        }
        for (let k = 0; k < arr.length - 2; k++) {
            arr[k] = arr[k] + ', ';
        }
        arr[arr.length - 2] = arr[arr.length - 2] + ' ' + this.translate.instant('GENERAL.DICTIONARY.AND') + ' ';
        if (weekdays.length === 7) {allDays = true; }
        return {
            days,
            textDays: arr,
            fhemDays: weekdays,
            allDays
        };
    }

    private totalDurations() {
    	this.sprinklers.totalDuration.start1 = this.sprinklers.times.interval1[0].startTime;
    	this.sprinklers.totalDuration.end1 = this.sprinklers.times.interval1[this.sprinklers.times.interval1.length - 1].endTime;
    	this.sprinklers.totalDuration.start2 = this.sprinklers.times.interval2[0].startTime;
     this.sprinklers.totalDuration.end2 = this.sprinklers.times.interval2[this.sprinklers.times.interval2.length - 1].endTime;
     this.sprinklers.totalDuration.duration1 = this.time.duration(this.sprinklers.totalDuration.start1, this.sprinklers.totalDuration.end1).time;
     this.sprinklers.totalDuration.duration2 = this.time.duration(this.sprinklers.totalDuration.start2, this.sprinklers.totalDuration.end2).time;
    }

    private initTimeLine() {
    	this.timeArr = [];
    	for (let i = 0; i < this.sprinklers.states.length; i++) {
    		this.timeArr.push({
    			start1: {min: this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin, time: this.sprinklers.times.interval1[i].smartStart},
    			end1: {min: this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin, time: this.sprinklers.times.interval1[i].smartEnd},
	  			duration1: {min: this.time.times(this.sprinklers.times.interval1[i].smartDuration).toMin, time: this.sprinklers.times.interval1[i].smartDuration},
	  			start2: {min: this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin, time: this.sprinklers.times.interval2[i].smartStart},
    			end2: {min: this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin, time: this.sprinklers.times.interval2[i].smartEnd},
	  			duration2: {min: this.time.times(this.sprinklers.times.interval2[i].smartDuration).toMin, time: this.sprinklers.times.interval2[i].smartDuration},
    		});
    		this.arrangeDays(this.timeArr[i].start1.min, this.timeArr[i].duration1.min, this.timeArr[i].end1.min, 'inter1', i);
  			 this.arrangeDays(this.timeArr[i].start2.min, this.timeArr[i].duration2.min, this.timeArr[i].end2.min, 'inter2', i);
    	}
    	this.local.percentage = ((this.time.local().timeMin / 1440) * 100) + '%';
    }

    private arrangeDays(start, duration, end, inter, index) {
		const interval = (inter === 'inter1') ? 1 : 2;
  const Interval = (inter === 'inter1') ? 'interval1' : 'interval2';
  const days = this.sprinklers.times[Interval][index].days.days;
  for (let i = 0; i < days.length; i++) {
  			let day: any = days[i];
  			// sunday = 0 fix
  			if (parseInt(day) === 0) { day = 7; }
  			this.calendarPercentage(start, end, duration, inter, index, day);
  		}
	}

	private calendarPercentage(start, end, duration, inter, index, dayPick) {
  		const interval = (inter === 'inter1') ? 1 : 2;
  		let day = parseInt(dayPick);
  		if (start > end) {
  			// sunday = 0 fix
  			if (day === 0) { day = 7; }
  			// from 00:00 is arranged to next day
  			let nextD = day + 1;
  			if (day === 7) {nextD = 1; }
  			this.timeArr[index]['startFromNullP_' + interval + '_' + nextD] = '0%';
  			this.timeArr[index]['heightFromNullP_' + interval + '_' + nextD] = ((duration - (1440 - start)) / 1440) * 100 + '%';
  		}
  		this.timeArr[index]['startP_' + interval + '_' + day] = ((start / 1440) * 100) + '%';
  		this.timeArr[index]['heightP_' + interval + '_' + day] = (duration / 1440) * 100 + '%';
  	}

  	async showRuntime(i) {
  		let message = '', head = '';
  		const time = this.timeArr[i];
  		if (this.sprinklers.smart.winterMode.Value) {
  			head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE');
  			message = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.INFO');
  		} else {
  			const inter2 = (this.sprinklers.smart.enableInterval2.Value) ? time.start2.time + ' - ' + time.end2.time + ' (' + time.duration2.time + ')' : this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.DEACTIVATED');
  			head = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.RUNTIME') + this.sprinklers.names[i];
  			message = '<h6>Interval 1:</h6><br>' + time.start1.time + ' - ' + time.end1.time + ' (' + time.duration1.time + ')<br>' + '<h6>Interval 2:</h6><br>' + inter2;
  		}

  		this.showAlert(head, message);
  	}

  	public toggleAll(state) {
  		if (!this.checkWinter()) {
  			if (!state) {
  				this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'true');
  			} else {
  				this.fhem.setAttr(this.data_smartSprinkler, 'runInterval', 'false');
  			}
  		}
  	}

  	public toggle(state, index) {
  		if (!this.checkWinter()) {
  			if (!state) {
  				if (this.sprinklers.smart.runInterval.Value) {
  					this.showAlert(
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.INFO')
  					);
  				} else {
  					// resetting other manual times
  					for (let i = 0; i < this.sprinklers.states.length; i++) {
  						if (this.sprinklers.times.manual[i].startTime !== '00:00') {
  							this.fhem.setAttr(this.data_device[i], 'manualTime', '00:00-00:00');
  						}
  					}
  					this.fhem.setAttr(this.data_device[index], 'manualTime', this.time.local().time + '-' + this.time.calcEnd(this.time.local().timeMin, 30));
  					this.fhem.setAttr(this.data_smartSprinkler, 'manualMode', 'true');
  				}
  			} else {
  				this.fhem.set(this.data_device[index], 'false');
  			}
  		}
  	}

  	private checkWinter() {
  		if (this.sprinklers.smart.winterMode.Value) {
    		this.showAlert(
    			this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.CAN_NOT_START.TITLE'),
    			this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE') + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.CAN_NOT_START.INFO')
    		);
    		return true;
    	} else {
    		return false;
    	}
  	}

  	private showAlert(head, para) {
  		this.toast.showAlert(head, para, false);
    }

    public subTitleResolver(i) {
    	const text = (this.sprinklers.callbacks[i].state ?
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.CURRENT') :
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.NEXT')
    	);
  		 let result;
  		 let smartCond = null;
  		 if (this.sprinklers.smart.enabled && this.sprinklers.smart.rain && this.sprinklers.weather.tooRainy && this.sprinklers.smart.wind && this.sprinklers.weather.tooWindy) {
  			smartCond = ( this.sprinklers.smart.enabled.Value ?
	  			( JSON.parse(this.sprinklers.smart.rain.Value) && JSON.parse(this.sprinklers.weather.tooRainy.Value) ?
	  				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_RAINY') :
	  				( JSON.parse(this.sprinklers.smart.wind.Value) && JSON.parse(this.sprinklers.weather.tooWindy.Value) ?
	  					this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WEATHER.TOO_WINDY')  : null
	  				)
	  			) : null
	  		);
  		}
  		 if (this.sprinklers.smart.winterMode.Value) {
  			result = this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.TITLE') + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WINTER_MODE.STATES.ACTIVE.CAN_NOT_START.INFO');
  		} else {
  			if (smartCond !== null) {
  				result = smartCond;
  				if (this.sprinklers.times.manual[i].startTime !== '00:00') {
  					result = text + this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:30)';
  				}
  			} else {
  				result = text + ( this.sprinklers.times.manual[i].startTime !== '00:00' ?
  					this.sprinklers.times.manual[i].startTime + ' - ' + this.sprinklers.times.manual[i].endTime + ' (00:30)' :
  					(this.sprinklers.times.next[i].startTime ?
  						this.sprinklers.times.next[i].startTime + ' - ' + this.sprinklers.times.next[i].endTime + ' (' + this.sprinklers.times.next[i].duration + ')' :
  						this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.RUNTIMES.INTERVAL.NOT_TODAY')
  					)
  				);
  			}
  		}
  		 return result;
    }

    private detectNextTimes() {
    	this.sprinklers.times.next = [];
    	const local = this.time.local().timeMin;
    	for (let i = 0; i < this.sprinklers.states.length; i++) {
    		this.sprinklers.times.next.push({
                startTime: '',
                endTime: '',
                duration: ''
            });
    		const start1 = this.time.times(this.sprinklers.times.interval1[i].smartStart).toMin;
    		const start2 = this.time.times(this.sprinklers.times.interval2[i].smartStart).toMin;
    		const end1 = this.time.times(this.sprinklers.times.interval1[i].smartEnd).toMin;
    		const end2 = this.time.times(this.sprinklers.times.interval2[i].smartEnd).toMin;
    		if (!this.sprinklers.smart.enableInterval2.Value) {
    			this.sprinklers.times.next[i].startTime = this.checkForDay(i, 1, this.sprinklers.times.interval1[i].smartStart);
       this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval1[i].smartEnd;
       this.sprinklers.times.next[i].duration = this.sprinklers.times.interval1[i].smartDuration;
    		} else {
    			if (local >= end1 ) {
    				this.sprinklers.times.next[i].startTime = this.checkForDay(i, 2, this.sprinklers.times.interval2[i].smartStart);
        this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval2[i].smartEnd;
        this.sprinklers.times.next[i].duration = this.sprinklers.times.interval2[i].smartDuration;
    			}
    			if (local >= end2 || local <= start1 || local >= start1 && local <= end1) {
                    this.sprinklers.times.next[i].startTime = this.checkForDay(i, 1, this.sprinklers.times.interval1[i].smartStart);
                	   this.sprinklers.times.next[i].endTime = this.sprinklers.times.interval1[i].smartEnd;
                	   this.sprinklers.times.next[i].duration = this.sprinklers.times.interval1[i].smartDuration;
                }
    		}
    	}
    }

    private checkForDay(index, interval, value) {
    	// check if current day is inserted
    	const currentDay = this.time.local().weekday;
    	const fhemDays = this.sprinklers.times['interval' + interval][index].days.fhemDays;
    	return (fhemDays.indexOf(currentDay.toString()) !== -1) ? value : false;
    }

    public setColor(selected, storageNum) {
    	this.sprinklerColors.color[storageNum].val = selected;
    	this.storage.changeSetting({
    		name: 'sprinklerColors',
    		change: JSON.stringify(this.sprinklerColors)
    	}).then((res: any) => {
    		this.sprinklerColors = res;
    	});
    }

    async editMail(text) {
    	this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.CHANGE'),
    		text,
    		{
    			inputs: [{
	    			name: 'newName',
	    			placeholder: this.formatMail(this.sprinklers.smart.mail.Value, 'display')
	    		}],
	    		buttons: [
	    			{
	    				text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
	    				role: 'cancel'
	    			},
	    			{
	                    text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
	                    handler: data => {
	                        // await this.inputMail(data.newName);
	                        if (!this.testMail(data.newName)) {
	                        	this.editMail(
	                        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.TITLE') + ' ' + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.INFO')
	                        	);
	                        } else {
	                        	this.changeSmartSetting('mail', this.formatMail(data.newName, 'fhem'));
	                        }
	                    }
	                }
	    		]
    		}
    	);
	}

	private testMail(mail) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return (re.test(String(mail).toLowerCase())) ? true : false;
	}

    public formatMail(mail, condition) {
        // formatting mail for fhem or for user display
        if (condition === 'display') {
            const index = mail.indexOf('\\');
            return this.replaceAt(mail, index, '');
        }
        if (condition === 'fhem') {
            const index = mail.indexOf('@');
            return this.replaceAt(mail, index, '\\@');
        }
    }

    private replaceAt(string, index, replacement) {
        return string.substr(0, index) + replacement + string.substr(index + 1);
    }

    public changeSmartSetting(setting, value) {
    	this.fhem.setAttr(this.data_smartSprinkler, setting, value);
    }

    public editName(index) {
    	this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.NAME.CHANGE'),
    		'',
    		{
    			inputs: [{
			      	name: 'newName',
			      	placeholder: this.sprinklers.names[index]
			    }],
			    buttons: [
			    	{
			      		text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
			      		role: 'cancel'
			      	},
			      	{
			      		text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
			      		handler: data => {
			      			let naming = data.newName.replace(/ä/g, 'Ã¤').replace(/ö/g, 'Ã¶').replace(/ü/g, 'Ã¼').replace(/ß/g, 'Ã');
			      			naming = (naming === '') ? this.sprinklers.names[index] : naming;
			      			if (naming !== this.sprinklers.names[index]) {
			      				this.fhem.setAttr(this.data_device[index], 'name', naming);
			      			}
			      		}
			      	}
			    ]
    		}
    	);
    }

    public changeWeekdays(values, index, inter) {
    	const i = (inter === 'inter1') ? '1' : '2';
     if (values.detail.value.join('') !== this.sprinklers.times['interval' + i][index].days.fhemDays) {
        	const sprinkler = (inter === 'inter1') ? this.sprinklers.times.interval1[index] : this.sprinklers.times.interval2[index];
        	this.fhem.setAttr(this.data_device[index], 'days' + i, values.detail.value.join(''));
        }
    }

    async setEnd(device, index, start, duration, inter) {
        const endTime = this.time.minToTime(this.time.times(start).toMin + this.time.times(duration).toMin);
        const testSorting = await this.checkWrongSorting(start, inter);
        if (!testSorting) {
        	const testCollide = await this.checkCollide(start, endTime, inter);
         if (!testCollide) {
                const sprinkler = (inter === 'inter1') ? this.sprinklers.times.interval1[index] : this.sprinklers.times.interval2[index];
                const interval = (inter === 'inter1') ? 'interval1' : 'interval2';
                this.fhem.setAttr(device, interval, start + '-' + endTime);
            }
        }
    }

    async checkWrongSorting(start, inter) {
        const start1 = (inter === 'inter1') ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval1[0].startTime).toMin;
        const start2 = (inter === 'inter2') ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval2[0].startTime).toMin;
        if (start2 <= start1) {
        	this.showAlert(
        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.TITLE'),
        		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.INFO')
        	);
         return true;
        } else {
            return false;
        }
    }

    async checkCollide(start, end, inter) {
        const Ythis = this;
        let collideSum = 0;
        const sprinkler = this.sprinklers.times;
        const start1 = (inter === 'inter1') ? this.time.times(start).toMin : this.time.times(sprinkler.interval1[0].startTime).toMin;
        const start2 = (inter === 'inter2') ? this.time.times(start).toMin : this.time.times(sprinkler.interval2[0].startTime).toMin;
        const end1 = (inter === 'inter1') ? predictEnd(inter) : this.time.times(sprinkler.interval1[sprinkler.interval1.length - 1].endTime).toMin;
        const end2 = (inter === 'inter2') ? predictEnd(inter) : this.time.times(sprinkler.interval2[sprinkler.interval2.length - 1].endTime).toMin;
        function predictEnd(inter) {
            // adding durations of user to start of interval, to return endTime (which will be setted)
            let totalDuration = 0;
            for (let i = 0; i < sprinkler.interval1.length; i++) {
                const dur = (inter === 'inter1') ? Ythis.time.times(sprinkler.interval1[i].duration).toMin : Ythis.time.times(sprinkler.interval2[i].duration).toMin;
                totalDuration = totalDuration + dur;
            }
            totalDuration = totalDuration + (sprinkler.interval1.length - 1);
            return (inter === 'inter1') ? Ythis.time.times(Ythis.time.minToTime(start1 + totalDuration)).toMin : Ythis.time.times(Ythis.time.minToTime(start2 + totalDuration)).toMin;
        }
        const collideVals = this.time.checkTimeCollide([
            {start: start1, end: end1},
            {start: start2, end: end2}
        ], true);
        for (let i = 0; i < collideVals.length; i++) {
            collideSum = collideSum + collideVals[i];
        }
        if (!this.sprinklers.smart.enableInterval2.Value) {
            return false;
        }
        if (collideVals[0] > 0) {
            if (inter === 'inter2') {
                this.optimalStart('inter2', collideVals[0], start2, 0, 'start2end1');
            } else {
                this.optimalStart('inter1', collideVals[0], start1, 1, 'start2end1');
            }
            return true;
        }
        if (collideVals[1] > 0) {
            if (inter === 'inter1') {
                this.optimalStart('inter1', collideVals[1], start1, 1, 'end2start1');
            } else {
                this.optimalStart('inter2', collideVals[1], start2, 0, 'end2start1');
            }
            return true;
        }
        if (collideSum === 0) {
            return false;
        }
    }

    private optimalStart(inter, val, startmin, index, condition) {
        let optimalStart;
        if (condition === 'start2end1') {
            optimalStart = (inter === 'inter1') ? this.time.minToTime(startmin - val - 1) : this.time.minToTime(startmin + val + 1);
        }
        if (condition === 'end2start1') {
            optimalStart = (inter === 'inter1') ? this.time.minToTime(startmin + val + 1) : this.time.minToTime(startmin - val - 1);
        }
        if (index === 0) {
            this.optimalAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.OPTIMAL.INTERVAL_2') + optimalStart, optimalStart, inter);
        }if (index === 1) {
            this.optimalAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.OPTIMAL.INTERVAL_1') + optimalStart, optimalStart, inter);
        }
    }

    async optimalAlert(message, start, inter) {
    	this.toast.showAlert(
    		this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.TITLE'),
    		message + ' ' + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.INFO'),
    		[
    			{
    				text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
    				role: 'cancel'
    			},
    			{
    				text: this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.BUTTONS.CONFIRM'),
    				handler: data => {
    					this.setEnd(
    						this.sprinklers.times[(inter === 'inter1' ? 'interval1' : 'interval2')][0].device, 0, start,
    						this.sprinklers.times[(inter === 'inter1' ? 'interval1' : 'interval2')][0].duration, inter
    					);
    				}
    			}
    		]
    	);
    }

	ngOnDestroy() {
		if (this.deviceChange !== undefined) {
			this.deviceChange.unsubscribe();
		}
	}
}
