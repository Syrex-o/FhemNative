import { Component, Input, NgModule, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { IonicModule } from '@ionic/angular';
import { IconModule } from '../icon/icon.component';
import { SwitchComponentModule } from '../switch/switch.component';
import { SelectComponentModule } from '../select/select.component';
import { PopoverComponentModule } from '../popover/popover.component';

// Services
import { ToastService } from '../../services/toast.service';
import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { StructureService } from '../../services/structure.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ComponentLoaderService } from '../../services/component-loader.service';

// interfaces
import { Room, RoomParams } from '../../interfaces/interfaces.type';

@Component({
	selector: 'create-edit-room',
	templateUrl: './create-edit-room.component.html',
	styleUrls: ['./create-edit-room.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEditRoomComponent implements OnInit {
	// type (create/edit)
	@Input() type!: string;
	@Input() ID: any;
	// popup state
	popupState: boolean = false;

	// Room Parameters
	roomName!: string;
	roomIcon: string = 'home';
	roomColor: string = 'theme';
	selectableRoomColors: string[] = ['theme'].concat(this.settings.componentColors);

	// group values
	useRoomAsGroup: boolean = false;
	roomToGroup: boolean = false;

	groupRooms: Array<any> = [];
	selectedGroup: string = '';

	constructor(
		private toast: ToastService,
		private logger: LoggerService,
		public settings: SettingsService,
		private translate: TranslateService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private componentLoader: ComponentLoaderService){
	}

	ngOnInit(){
		this.groupRooms = this.structure.rooms.filter(room => room.useRoomAsGroup);
		// get the relevant information
		if(this.type === 'edit'){
			const room: Room|undefined = this.structure.rooms.find(x=> x.ID === this.ID);
			if(room){
				this.roomName = room.name;
				this.roomIcon = room.icon;
				// check for color
				if(room.color){
					this.roomColor = room.color
				}

				this.useRoomAsGroup = room.useRoomAsGroup || false;
				// detect grouping 
				const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some((el: any)=> this.ID === el.ID));
				if(group.length > 0){
					this.roomToGroup = true;
					this.selectedGroup = group[0].name
				}
			}
		}
		this.popupState = true;
	}

	grouper(scenario: string, event: boolean): void{
		if(event){
			if(scenario === 'useAsGroup'){
				this.roomToGroup = false;
			}else{
				this.useRoomAsGroup = false;
			}
		}
	}

	// check values
	private valueChecker(): boolean{
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
	save(): void{
		if(this.valueChecker()){
			if(this.type === 'create'){
				this.structure.rooms.push({
					ID: this.structure.rooms.length,
					UID: '_' + Math.random().toString(36).substr(2, 9),
					name: this.roomName,
					icon: this.roomIcon,
					color: this.roomColor,
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
					const room: Room|undefined = this.structure.rooms.find(x=> x.name === this.selectedGroup);
					if(room){
						if(!this.structure.rooms[room.ID]['groupRooms']){
							this.structure.rooms[room.ID]['groupRooms'] = [];
						}
						let groups: any[]|undefined = this.structure.rooms[room.ID]['groupRooms'];
						if(groups){
							groups.push({
								ID: this.structure.rooms[this.structure.rooms.length -1].ID,
								name: this.structure.rooms[this.structure.rooms.length -1].name
							});
						}
					}
				}
			}else{
				// Room edit
				this.structure.rooms[this.ID].name = this.roomName;
				this.structure.rooms[this.ID].icon = this.roomIcon;
				this.structure.rooms[this.ID].color = this.roomColor;
				// check if room was moved out of group
				let outOfGroup = ()=>{
					const group = this.groupRooms.filter(groupRoom=> groupRoom.groupRooms.some((el: any)=> this.ID === el.ID));
					if(group.length > 0){
						let innerGroup: any = this.structure.rooms[group[0].ID].groupRooms;
						if(innerGroup){
							const index = innerGroup.findIndex((x: any)=> x.ID === this.ID);
							if(index > -1){
								innerGroup.splice(index, 1);
							}
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
					const room: Room|undefined = this.structure.rooms.find(x=> x.name === this.selectedGroup);
					if(room){
						if(!this.structure.rooms[room.ID]['groupRooms']){
							this.structure.rooms[room.ID]['groupRooms'] = [];
						}
						let group: any[]|undefined = this.structure.rooms[room.ID]['groupRooms'];
						if(group){
							group.push({
								ID: this.structure.rooms[this.ID].ID,
								name: this.structure.rooms[this.ID].name
							});
						}
					}
				}
			}
			this.structure.getStructuredRoomList();
			// inform undo manager
			this.undoManager.addChange();
			this.close();
			// reload room/navigate to created room
			if(this.type === 'create'){
				// get created room
				const room: Room|undefined = this.structure.rooms.find((x: Room)=> x.ID === this.structure.rooms.length -1);
				if(room){
					const params: RoomParams = { name: room.name, ID: room.ID, UID: room.UID, reload: true, reloadID: this.settings.getUID() };
					this.navigator(params);
				}
			}else{
				const room: Room|undefined = this.structure.rooms[this.ID];
				if(room){
					const params: RoomParams = { name: room.name, ID: room.ID, UID: room.UID, reload: true, reloadID: this.settings.getUID() };
					this.navigator(params);
				}
			}
		}
	}

	private navigator(params: RoomParams): void{
		this.logger.info('Switch room to: ' + params.name + ' - trigger: ' + this.type);
		setTimeout(()=>{
			this.structure.navigateToRoom(params.name, params.ID, params);
		});
	}

	close(): void{
		this.componentLoader.removeDynamicComponent('CreateEditRoomComponent');
	}
}
@NgModule({
	imports: [
		IconModule,
		IonicModule,
		FormsModule,
		CommonModule,
		TranslateModule, 
		SwitchComponentModule,
		SelectComponentModule,
		PopoverComponentModule
	],
	declarations: [CreateEditRoomComponent]
})
class CreateEditRoomComponentModule {}