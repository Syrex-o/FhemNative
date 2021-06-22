import { Component, Input, NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Translator
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Components
import { IonicModule } from '@ionic/angular';
import { PickerComponentModule } from '../../../picker/picker.component';
import { TimepickerComponentModule } from '../../../timepicker/timepicker.component';

// Services
import { FhemService } from '../../../../services/fhem.service';
import { TimeService } from '../../../../services/time.service';
import { ToastService } from '../../../../services/toast.service';
import { SettingsService } from '../../../../services/settings.service';
import { ComponentLoaderService } from '../../../../services/component-loader.service';

// Interfaces
import { FhemDevice } from '../../../../interfaces/interfaces.type';

@Component({
	selector: 'sprinkler-config',
	templateUrl: './sprinkler-config.component.html',
	styleUrls: ['./sprinkler-config.component.scss']
})

export class SprinklerConfigComponent implements OnDestroy {
	@Input() config!: {interval: number, index: number};
	@Input() sprinklers: any;
	@Input() sprinklerColor!: string;
	@Input() smartSprinkler!: FhemDevice|null;

	showMenu: boolean = true;

	// remove component
	removeConfig(): void{
		// timeout to show animation
		setTimeout(()=>{
			this.componentLoader.removeDynamicComponent('SprinklerConfig');
		}, 300);
	}

	// edit sprinkler name
	editName(): void{
		this.toast.showAlert(this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.NAME.CHANGE'),'',{
			inputs: [{
				name: 'newName',
				placeholder: this.sprinklers.names[this.config.index]
			}],
			buttons: [{text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),role: 'cancel'},
				{
					text: this.translate.instant('GENERAL.BUTTONS.SAVE'),
					handler: (data: any) => {
						let naming: string = data.newName;
						naming = (naming === '') ? this.sprinklers.names[this.config.index] : naming;
						if (naming !== this.sprinklers.names[this.config.index]) {
							this.fhem.setAttr(
								this.sprinklers.times['interval' + this.config.interval][this.config.index].device, 
								'name', naming
							);
						}
					}
				}
			]
		}, 'reduced');
	}

	// change weekdays
	public changeWeekdays(event:any, index: number, inter: number) {
		const days: string[] = event.detail.value;
		const joinedDays: string = days.join('');
		const interval: string = 'interval' + inter;
		// check for similarity
		if(joinedDays !== this.sprinklers.times[interval][index].days.fhemDays){
			const sprinklerDevice: string = this.sprinklers.times.interval1[index].device;
			// translate command, to enable no given days
			const command: string = joinedDays === '' ? 'blank' : joinedDays;
			this.fhem.setAttr(sprinklerDevice, 'days' + inter, command);
		}
	}

	// change sprinkler runtimes / start time
	changeSprinklerTime(device: string, index: number, start: any, duration: any, inter: number): void{
		const endTime: string = this.time.minToTime(this.time.times(start).toMin + this.time.times(duration).toMin);
		const wrongSorting: boolean = this.checkWrongSorting(start, inter);
		if(!wrongSorting){
			const collider: boolean = this.checkCollide(start, endTime, inter);
			if(!collider){
				const interval: string = 'interval' + inter;
				this.fhem.setAttr(device, interval, start + '-' + endTime);
			}
		}
	}

	// check if intervals are wrong sorted
	private checkWrongSorting(start: string, interval: number): boolean{
		const start1: number = (interval === 1) ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval1[0].startTime).toMin;
		const start2: number = (interval === 2) ? this.time.times(start).toMin : this.time.times(this.sprinklers.times.interval2[0].startTime).toMin;
		if (start2 <= start1) {
			this.toast.showAlert(
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.TITLE'),
				this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.WRONG_SORTING.INFO'),
				false
			);
			return true;
		}else{
			return false;
		}
	}

	private checkCollide(start: string, end: string, interval: number): boolean{
		const sprinkler = this.sprinklers.times;
		// get end
		let predictEnd = (): number =>{
			// adding durations of user to start of interval to return endTime
			let totalDuration = 0;
			for (let i = 0; i < sprinkler.interval1.length; i++) {
				let dur: number = 0;
				// detect changed time
				if(i === this.config.index){
					dur = this.time.duration(start, end).mins;
				}else{
					dur = (interval === 1) ? this.time.times(sprinkler.interval1[i].duration).toMin : this.time.times(sprinkler.interval2[i].duration).toMin;
				}
				totalDuration = totalDuration + dur;
			}
			// add minute placeholder
			totalDuration = totalDuration + (sprinkler.interval1.length - 1);
			return (interval === 1) ? this.time.times(this.time.minToTime(start1 + totalDuration)).toMin : this.time.times(this.time.minToTime(start2 + totalDuration)).toMin;
		}
		// times
		const start1: number = interval === 1 ? this.time.times(start).toMin : this.time.times(sprinkler.interval1[0].startTime).toMin;
		const start2: number = interval === 2 ? this.time.times(start).toMin : this.time.times(sprinkler.interval2[0].startTime).toMin;
		const end1: number = interval === 1 ? predictEnd() : this.time.times(sprinkler.interval1[sprinkler.interval1.length - 1].endTime).toMin;
		const end2: number = interval === 2 ? predictEnd() : this.time.times(sprinkler.interval2[sprinkler.interval2.length - 1].endTime).toMin;

		// get adjusted time from weather prolonging
		let adjustedEnd1: number|null = null;
		let adjustedEnd2: number|null = null;
		if(this.smartSprinkler && this.smartSprinkler.readings.enabled.Value){
			// adjustment based on percentage
			const percentage: number = 1 + (this.smartSprinkler.readings.highPercentage.Value / 100);
			// get total durations
			const duration1: number = this.time.duration(start1, end1).mins;
			const duration2: number = this.time.duration(start2, end2).mins;
			// get calculated endings
			adjustedEnd1 = this.time.times( this.time.calcEnd(start1, Math.floor(duration1 * percentage)) ).toMin;
			adjustedEnd2 = this.time.times( this.time.calcEnd(start2, Math.floor(duration2 * percentage)) ).toMin;
		}
		// get relevant endings
		adjustedEnd1 = adjustedEnd1 !== null ? adjustedEnd1 : end1;
		adjustedEnd2 = adjustedEnd2 !== null ? adjustedEnd2 : end2;
		// get time collider
		const collider: number[] = this.time.checkTimeCollide([{start: start1, end: adjustedEnd1}, {start: start2, end: adjustedEnd2}], true);
		if (collider[0] > 0) {
			this.optimalStart(interval, collider[0], (interval === 1 ? start1 : start2), (interval === 1 ? 1 : 0), 'start2end1');
			return true;
		}else if(collider[1] > 0){
			this.optimalStart(interval, collider[1], (interval === 1 ? start1 : start2), (interval === 1 ? 1 : 0), 'end2start1');
			return true;
		}else{
			return false;
		}
	}

	// suggest optimal start
	private optimalStart(interval: number, val: number, startMin: number, index: number, condition: string): void {
		let optimalStart: string = '';
		if (condition === 'start2end1') {
			optimalStart = interval === 1 ? this.time.minToTime(startMin - val - 1) : this.time.minToTime(startMin + val + 1);
		}
		if (condition === 'end2start1') {
			optimalStart = interval === 1 ? this.time.minToTime(startMin + val + 1) : this.time.minToTime(startMin - val - 1);
		}
		const prefix: string = 'COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.OPTIMAL.INTERVAL_';

		this.toast.showAlert(
			this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.TITLE'),
			this.translate.instant(prefix + interval) + optimalStart +
			'.\n' + this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.INFO'),
			[
				{
					text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
					role: 'cancel'
				},
				{
					text: this.translate.instant('COMPONENTS.Sprinkler.TRANSLATOR.COLLIDE.BUTTONS.CONFIRM'),
					handler: ()=>{
						this.changeSprinklerTime(
							this.sprinklers.times['interval' + interval][0].device,
							0,
							optimalStart,
							this.sprinklers.times['interval' + interval][0].duration,
							interval
						);
					}
				}
			]
		);
	}

	ngOnDestroy(){
		this.removeConfig();
	}

	constructor(
		private fhem: FhemService,
		private time: TimeService,
		private toast: ToastService,
		public settings: SettingsService,
		private translate: TranslateService,
		private componentLoader: ComponentLoaderService){}
}
@NgModule({
	imports: [
		FormsModule,
		IonicModule,
		CommonModule,
		TranslateModule,
		PickerComponentModule,
		TimepickerComponentModule
	],
	declarations: [SprinklerConfigComponent],
	exports: [SprinklerConfigComponent]
})
class SprinklerConfigComponentModule {}