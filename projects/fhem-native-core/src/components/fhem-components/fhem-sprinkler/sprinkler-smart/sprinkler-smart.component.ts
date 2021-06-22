import { Component, Input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Components
import { IonicModule } from '@ionic/angular';
import { SwitchComponentModule } from '../../../switch/switch.component';

// Services
import { TimeService } from '../../../../services/time.service';
import { FhemService } from '../../../../services/fhem.service';
import { ToastService } from '../../../../services/toast.service';
import { SettingsService } from '../../../../services/settings.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-smart',
	templateUrl: './sprinkler-smart.component.html',
	styleUrls: ['./sprinkler-smart.component.scss']
})

export class SprinklerSmartComponent {
	// smart sprinkler device
	@Input() smartSprinkler!: FhemDevice|null;
	// all sprinkler devices for time collide calculation
	@Input() sprinklers: any;

	// Values of selection boxes
	// values for rain off
	rainOffValues: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	// values for wind off
	windOffValues: number[] = [30, 35, 40, 45, 50];
	// values for max temp time adjustments
	maxTempValues: number[] = [25, 30];
	maxTempPercentages: number[] = [0, 10, 20, 30, 40];
	// values for min temp time adjustments
	minTempValues: number[] = [15, 10];
	minTempPercentages: number[] = [0, 10, 20, 30, 40];

	// change smart settings based on ionic selector
	changeSmartSettingIon(setting: string, event: any): void{
		const value: any = event.detail.value;
		this.changeSmartSetting(setting, value);
	}

	// change setting of smart sprinkler device
	changeSmartSetting(setting: string, value: any): void{
		if(this.smartSprinkler && this.smartSprinkler.device){
			this.fhem.setAttr(this.smartSprinkler.device, setting, value);
			// recalculate times, for smart settings --> some exceptions
			if( !['enabled', 'winterProtect', 'mail'].includes(setting) ){
				setTimeout(()=>{
					if(this.smartSprinkler && this.smartSprinkler.device){
						// trigger smartTime calculation
						this.fhem.setAttr(this.smartSprinkler.device, 'enabled', true);
					}
				}, 300);
			}
		}
	}

	// check for valid time for time adjustments in max direction
	adjustMaxPercentage(setting: string, event: any): void{
		const value: any = event.detail.value;
		if(this.sprinklers){
			this.checkCollide(setting, value);
		}
	}

	// get total sprinkler durations
	private checkCollide(setting: string, p: number){
		const times: {interval1: Array<any>, interval2: Array<any>, manual: Array<any>, next: Array<any>} = this.sprinklers.times;
		const start1: number = this.time.times(times.interval1[0].startTime).toMin;
		const start2: number = this.time.times(times.interval2[0].startTime).toMin;
		const end1: number = this.time.times(times.interval1[times.interval1.length -1].endTime).toMin;
		const end2: number = this.time.times(times.interval2[times.interval2.length -1].endTime).toMin;

		// get durations
		const duration1: number = this.time.duration(start1, end1).mins;
		const duration2: number = this.time.duration(start2, end2).mins;
		// adjustment based on percentage
		const percentage: number = 1 + (p / 100);
		// get calculated endings
		let adjustedEnd1: number = this.time.times( this.time.calcEnd(start1, Math.floor(duration1 * percentage)) ).toMin;
		let adjustedEnd2: number = this.time.times( this.time.calcEnd(start2, Math.floor(duration2 * percentage)) ).toMin;

		// get collider
		const collider: boolean = this.time.checkTimeCollide([{start: start1, end: adjustedEnd1}, {start: start2, end: adjustedEnd2}], false);
		if(collider){
			// times collide --> get best matching percentage
			const currentPercentageIndex: number = this.maxTempPercentages.findIndex(x=> x === p);
			// get relevant values of percentage array to test for
			// reverse list to find best fit first
			const relevantValues: number[] = this.maxTempPercentages.slice(0, currentPercentageIndex).reverse();
			// reverse search for first possible percentage
			let bestFit: number = 0;
			for(let i: number = 0; i < relevantValues.length; i++){
				const testPercentage: number = 1 + (relevantValues[i] / 100);
				const testAdjustedEnd1: number = this.time.times( this.time.calcEnd(start1, Math.floor(duration1 * testPercentage)) ).toMin;
				const testAdjustedEnd2: number = this.time.times( this.time.calcEnd(start2, Math.floor(duration2 * testPercentage)) ).toMin;

				const testCollider: boolean = this.time.checkTimeCollide([{start: start1, end: testAdjustedEnd1}, {start: start2, end: testAdjustedEnd2}], false);
				if(!testCollider){
					// found best match
					bestFit = relevantValues[i];
					break;
				}
			}
			// show optimal alert
			this.toast.showAlert(
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.COLLIDE_PERCENTAGE.TITLE'),
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.COLLIDE_PERCENTAGE.OPTIMAL') + bestFit + '%.\n' +
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.COLLIDE_PERCENTAGE.INFO'),
				[
					{
						text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
						role: 'cancel'
					},
					{
						text: this.translate.instant('GENERAL.BUTTONS.CONFIRM'),
						handler: ()=>{
							this.changeSmartSetting(setting, bestFit);
						}
					}
				]
			);
		}else{
			// no collide --> set valid value
			this.changeSmartSetting(setting, p);
		}
	}


	// edit winter protect mail
	editMail(text: string): void{
		if(this.smartSprinkler && this.smartSprinkler.readings){
			this.toast.showAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.CHANGE'), text, {
				inputs: [{
					name: 'newName',
					placeholder: this.smartSprinkler.readings.mail.Value
				}],
				buttons: [
					{
						text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
						role: 'cancel'
					},
					{
						text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
						handler: (data: any) => {
							if (!this.testMail(data.newName)) {
								this.editMail(
									this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.TITLE') + ' ' + 
									this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.MAIL.WRONG_FORMAT.INFO')
								);
							}else{
								this.changeSmartSetting('mail', data.newName);
							}
						}
					}
				]
			}, 'reduced');
		}
	}

	private testMail(mail: string): boolean {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return (re.test(String(mail).toLowerCase())) ? true : false;
	}

	constructor(public settings: SettingsService, private time: TimeService, private fhem: FhemService, private toast: ToastService, private translate: TranslateService){}
}
@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		IonicModule,
		TranslateModule,
		SwitchComponentModule
	],
	declarations: [SprinklerSmartComponent],
	exports: [SprinklerSmartComponent]
})
export class SprinklerSmartComponentModule {}