import { Component, Input } from '@angular/core';

@Component({
	selector: 'fhem-native-text-line',
	templateUrl: './line.component.html'
})

export class TextLineComponent{
    // text bold
    @Input() bold = false;

	// use header font
	@Input() asHeader = false;

	// text of label
	@Input() text = '';

	// shorten text with ...
	@Input() shorten = false;
	
	// prevent/allow line breaks
	@Input() wrap = true;

	// defined label color
	@Input() color: string|undefined;
}