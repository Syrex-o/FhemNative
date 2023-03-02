import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, tap } from 'rxjs';

import { EditorService, StructureService } from '@fhem-native/services';

import { pageTransition } from './animations';

@Component({
	selector: 'fhem-native-room',
	templateUrl: 'room.page.html',
	styleUrls: ['../pages.style.scss', 'room.page.scss']
})
export class RoomPageComponent implements OnInit{
	// room switch animation
	contentTransition = pageTransition;

	// keep track of router
	paramsTracker$ = this.route.queryParams.pipe( tap(x=> this.initRoom(x)) );
	// keep track of editors
	editComponents$ = this.editor.core.getMode().pipe( map(x=> x.editComponents) );
	componentEditor$ = this.editor.component.getMode().pipe( tap(x=> this.componentCreatorMenuState = x.edit) );

	@HostBinding('class.mobile') mobileMenus = false;
	@HostBinding('class.sidebar-expanded') sidebarMenuState = false;
	@HostBinding('class.component-creator-expanded') componentCreatorMenuState = false;
	@HostListener('window:resize') onResize(){ this.mobileMenus = window.innerWidth <= 900; }

	constructor(private route: ActivatedRoute, private editor: EditorService, public structure: StructureService){}

	ngOnInit() { this.onResize(); }

	// initialize room
	private initRoom(params: Params): void{
		// check for params
		if('UID' in params){
			// filling current room in structure
			this.structure.getCurrentRoom(params['UID']);
		}else{
			if(this.structure.currentRoom) return this.structure.getCurrentRoom(this.structure.currentRoom.UID);
			// fallback to first/initial room
			this.structure.getCurrentRoom(this.structure.rooms[0].UID);
		}
		// check editor and change container
		if(this.editor.core.getCurrentMode().edit){
			// check if currently editing component
			// reset component back to settings, cause no saving happened in between
			if(this.editor.component.getCurrentMode().componentUID){
				this.editor.revertComponent();
				this.editor.component.leaveEditMode();
			}
			if(this.structure.currentRoom) this.editor.core.updateEditMode(this.structure.currentRoom.UID, true, true);
		}
	}
}