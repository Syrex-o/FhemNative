import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { interval, map, Observable, shareReplay } from 'rxjs';

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
    digitalClock$: Observable<{HH: string, mm: string, ss: string}> = this.date$.pipe(
		map(t=> { return {HH: t.hour, mm: t.minute, ss: t.second } })
	);
	analogClock$: Observable<{HH: number, mm: number, ss: number}> = this.date$.pipe(
		map(t=> { 
			return {
				HH: parseInt(t.hour) * 30 + parseInt(t.minute) * (360/720),
				mm: parseInt(t.minute) * 6 + parseInt(t.second) * (360/3600),
				ss: (360 / 60) * parseInt(t.second)
			}
		})
	);
	

    displayValue(str: string): boolean{
		const re = new RegExp(str, 'g');
		const match: RegExpMatchArray|null = this.format.match(re);
		return match !== null ? true : false;
	}
}