import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { interval, map, shareReplay } from 'rxjs';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { NgIfOnceModule } from '@fhem-native/directives';
import { FhemComponentModule } from '../_fhem-component/fhem-component.module';

import { ComponentPosition } from '@fhem-native/types/components';
import { local } from '@fhem-native/utils';

@UntilDestroy()
@Component({
	standalone: true,
	imports: [ FhemComponentModule, NgIfOnceModule ],
	selector: 'fhem-native-component-clock',
	templateUrl: './fhem-clock.component.html',
	styleUrls: ['./fhem-clock.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FhemClockComponent{
	// meta
	@Input() UID!: string;
	@Input() position!: ComponentPosition;
	
	// Data
	@Input() info!: string;

	// Selections
	@Input() style!: string;
	@Input() digitalStyle!: string;
	@Input() format!: string;

	// Styling
	@Input() color!: string;
	@Input() hourColor!: string;
	@Input() minuteColor!: string;
	@Input() secondColor!: string;

	// Gradient Styling
	@Input() gradientBackgroundColor!: string[];

	// Bool
	@Input() showTicks!: boolean;

	private date$ = interval(250).pipe( untilDestroyed(this), map(()=> local()), shareReplay() );

	digitalClockStandard$ = this.date$.pipe(
		map(t=> { return {HH: t.hour, mm: t.minute, ss: t.second } })
	);

	digitalClockAlarm$ = this.date$.pipe(
		map(t=>{
			return {
				hours: [ this.getOpacity(parseInt(t.hour[0])), this.getOpacity(parseInt(t.hour[1])) ],
				minutes: [ this.getOpacity(parseInt(t.minute[0])), this.getOpacity(parseInt(t.minute[1])) ],
				seconds: [ this.getOpacity(parseInt(t.second[0])), this.getOpacity(parseInt(t.second[1])) ]
			};
		})
	);

	analogClock$ = this.date$.pipe(
		map(t=> { 
			return {
				HH: parseInt(t.hour) * 30 + parseInt(t.minute) * (360/720),
				mm: parseInt(t.minute) * 6 + parseInt(t.second) * (360/3600),
				ss: (360 / 60) * parseInt(t.second)
			}
		})
	);

	private getOpacity(n: number){
		const numbers = [
			[1, 1, 1, 0, 1, 1, 1], // 0
			[0, 0, 1, 0, 0, 1, 0], // 1
			[1, 0, 1, 1, 1, 0, 1], // 2
			[1, 0, 1, 1, 0, 1, 1], // 3
			[0, 1, 1, 1, 0, 1, 0], // 4
			[1, 1, 0, 1, 0, 1, 1], // 5
			[1, 1, 0, 1, 1, 1, 1], // 6
			[1, 0, 1, 0, 0, 1, 0], // 7
			[1, 1, 1, 1, 1, 1, 1], // 8
			[1, 1, 1, 1, 0, 1, 1]  // 9
		];

		const res = [];
		for(let i = 0; i < numbers[n].length; i++){
			res.push( numbers[n][i] === 0 ? 0.125 : 1 );
		}
		return res;
	}

	displayValue(str: string): boolean{
		const re = new RegExp(str, 'g');
		const match: RegExpMatchArray|null = this.format.match(re);
		return match !== null ? true : false;
	}
}