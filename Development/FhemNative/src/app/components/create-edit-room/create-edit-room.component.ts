import { Component, Input, NgModule, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { ComponentsModule } from '../components.module';

// Services
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

// Translate
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'create-edit-room',
	templateUrl: './create-edit-room.component.html',
  	styleUrls: ['./create-edit-room.component.scss'],
  	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEditRoomComponent implements OnInit {
	// type (create/edit)
	@Input() type: string;
	@Input() ID: any;
	// popup state
	popupState: boolean = false;

	// Room Parameters
	roomName: string;
	roomIcon: string = 'home';
	useRoomAsGroup: boolean = false;
	roomToGroup: boolean = false;

	groupRooms: Array<any> = [];
	selectedGroup: string = '';

	ngOnInit(){
		this.groupRooms = this.structure.rooms.filter(room => room.useRoomAsGroup);
		// get the relevant information
		if(this.type === 'edit'){
			const room = this.structure.rooms.find(x=> x.ID === this.ID);
			this.roomName = room.name;
			this.roomIcon = room.icon;
			this.useRoomAsGroup = room.useRoomAsGroup || false;
			// detect grouping 
			const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> this.ID === el.ID));
			if(group.length > 0){
				this.roomToGroup = true;
				this.selectedGroup = group[0].name
			}
		}
		this.popupState = true;
	}

	grouper(scenario: string, event: boolean){
		if(event){
			if(scenario === 'useAsGroup'){
				this.roomToGroup = false;
			}else{
				this.useRoomAsGroup = false;
			}
		}
	}

	// check values
	private valueChecker(){
		if(this.roomName && this.roomName !== ''){
			return true;
		}else{
			this.toast.showAlert(
				this.translate.instant('GENERAL.CREATE_ROOM.NO_ROOM_NAME.TITLE'),
				this.translate.instant('GENERAL.CREATE_ROOM.NO_ROOM_NAME.INFO'),
				false
			);
			return false;
		}
	}

	// save room
	save(){
		if(this.valueChecker()){
			if(this.type === 'create'){
				this.structure.rooms.push({
					ID: this.structure.rooms.length,
					UID: '_' + Math.random().toString(36).substr(2, 9),
					name: this.roomName,
					icon: this.roomIcon,
					components: []
				});
				if(this.useRoomAsGroup){
					this.structure.rooms[this.structure.rooms.length -1]['useRoomAsGroup'] = true;
					if(!this.structure.rooms[this.structure.rooms.length -1]['groupRooms']){
						this.structure.rooms[this.structure.rooms.length -1]['groupRooms'] = [];
					}
				}
				if(this.roomToGroup && this.selectedGroup && this.selectedGroup !== ''){
					// check if group already has rooms inside
					const room = this.structure.rooms.find(x=> x.name === this.selectedGroup);
					if(!this.structure.rooms[room.ID]['groupRooms']){
						this.structure.rooms[room.ID]['groupRooms'] = [];
					}
					this.structure.rooms[room.ID]['groupRooms'].push({
						ID: this.structure.rooms[this.structure.rooms.length -1].ID,
						name: this.structure.rooms[this.structure.rooms.length -1].name
					});
				}
			}else{
				// Room edit
				this.structure.rooms[this.ID].name = this.roomName;
				this.structure.rooms[this.ID].icon = this.roomIcon;
				// check if room was moved out of group
				let outOfGroup = ()=>{
					const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some(el=> this.ID === el.ID));
					if(group.length > 0){
						const index = this.structure.rooms[group[0].ID].groupRooms.findIndex(x=> x.ID === this.ID);
						if(index > -1){
							this.structure.rooms[group[0].ID].groupRooms.splice(index, 1);
						}
					}
				}
				if(this.useRoomAsGroup){
					this.structure.rooms[this.ID]['useRoomAsGroup'] = true;
					if(!this.structure.rooms[this.ID]['groupRooms']){
						this.structure.rooms[this.ID]['groupRooms'] = [];
					}
				}else{
					if(this.structure.rooms[this.ID].useRoomAsGroup !== undefined){
						this.structure.rooms[this.ID].useRoomAsGroup = false;
						this.structure.rooms[this.ID]['groupRooms'] = [];
					}
				}
				outOfGroup();
				if(this.roomToGroup && this.selectedGroup && this.selectedGroup !== ''){
					// check if group already has rooms inside
					const room = this.structure.rooms.find(x=> x.name === this.selectedGroup);
					if(!this.structure.rooms[room.ID]['groupRooms']){
						this.structure.rooms[room.ID]['groupRooms'] = [];
					}
					this.structure.rooms[room.ID]['groupRooms'].push({
						ID: this.structure.rooms[this.ID].ID,
						name: this.structure.rooms[this.ID].name
					});
				}
			}
			this.structure.getStructuredRoomList();
			// inform undo manager
			this.undoManager.addChange();
			this.close();
		}
	}

	close(){
		this.componentLoader.removeDynamicComponent('CreateEditRoomComponent');
	}

	constructor(
		public settings: SettingsService,
		private translate: TranslateService,
		private structure: StructureService,
		private toast: ToastService,
		private undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService){}
}
@NgModule({
	imports: [ComponentsModule, TranslateModule],
  	declarations: [CreateEditRoomComponent]
})
class CreateEditRoomComponentModule {}