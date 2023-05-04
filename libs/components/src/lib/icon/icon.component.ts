import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';

import { IconService } from '@fhem-native/services';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'fhem-native-icon',
	templateUrl: './icon.component.html',
	styleUrls: ['./icon.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent implements OnChanges{
    // get the icon input
	@Input() icon!: string;
	@Input() ionFallback = false;
	// determine if icon should have ripple effect
	@Input() ripple = false;

    // actual icon to display
	icon$ = new BehaviorSubject<{type: string, icon: any}>({type: 'ion', icon: 'home-outline'});

    constructor(public iconService: IconService){}

    ngOnChanges(changes: SimpleChanges){
		if(!('icon' in changes)) return;
		const current: string|undefined = changes['icon'].currentValue;

		if(!current) return;
		this.icon$.next( this.iconService.findIcon(current) || {type: 'ion', icon: this.ionFallback ? current : 'home'} );
	}
}