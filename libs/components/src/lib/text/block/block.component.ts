import { Component, Input } from '@angular/core';
import { tap } from 'rxjs';

import { ThemeService } from '@fhem-native/services';

import { Theme } from '@fhem-native/types/common';

@Component({
	selector: 'fhem-native-text-block',
	templateUrl: './block.component.html',
	styleUrls: ['./block.component.scss']
})

export class TextBlockComponent{
    // label --> short description of the setting
    @Input() label = '';

	// info --> detailed description of the setting
	@Input() info = '';

	@Input() labelColor: string|undefined;
	@Input() infoColor: string|undefined;

	theme$ = this.theme.getTheme().pipe( tap(x=> this.colorMapper(x)) );
	_labelColor: string|undefined;
	_infoColor: string|undefined;

	constructor(private theme: ThemeService){}

	private colorMapper(theme: Theme): void{
		this._labelColor = this.labelColor || theme.properties['--text-a'];
		this._infoColor = this.infoColor || theme.properties['--text-b'];
	}
}