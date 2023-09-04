import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { map } from 'rxjs';

import { EditorService } from '@fhem-native/services';

import { Room } from '@fhem-native/types/room';

@Component({
	selector: 'fhem-native-room-header',
	templateUrl: './room-header.component.html',
	styleUrls: ['./room-header.component.scss']
})

export class RoomHeaderComponent{
	@Input() room!: Room;
	@Input() expandState = false;

	@Output() burgerClick: EventEmitter<boolean> = new EventEmitter<boolean>();

	editMode$ = inject(EditorService).core.getMode().pipe( map(x=> x.edit) );

	toggleMenu(){
		this.expandState = !this.expandState;
		this.burgerClick.emit(this.expandState);
	}
}