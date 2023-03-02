import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { getUID } from '@fhem-native/utils';

@Component({
	selector: 'fhem-native-info-btn',
	templateUrl: './info-btn.component.html',
	styleUrls: ['./info-btn.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class InfoBtnComponent {
	// get UID for trigger of info
	// needed, when multiple inputs are on same page
	public infoTriggerID = getUID();

	// display text
	@Input() label = '';

	// info bubble content
	@Input() info = '';
}