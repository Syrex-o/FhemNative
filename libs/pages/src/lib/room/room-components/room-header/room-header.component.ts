import { Component, Input, Output, EventEmitter } from '@angular/core';

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

	toggleMenu(){
		this.expandState = !this.expandState;
		this.burgerClick.emit(this.expandState);
	}
}