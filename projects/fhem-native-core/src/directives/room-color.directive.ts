import { Directive, Input, OnChanges, SimpleChanges, ElementRef, Renderer2, NgModule } from '@angular/core';

// Services
import { SettingsService } from '../services/settings.service';
import { StructureService } from '../services/structure.service';
// interfaces
import { Room } from '../interfaces/interfaces.type';

@Directive({ selector: '[roomColor]' })
export class RoomColorDirective implements OnChanges {
	// get room UID as input
	@Input() UID: string|undefined;
	@Input() roomColor: string|undefined;
	@Input() theme!: string;

	constructor(
		private ref: ElementRef, 
		private renderer: Renderer2,
		private settings: SettingsService,
		private structure: StructureService) {}

	// // detect input change
	ngOnChanges(changes: SimpleChanges){
		if( (changes.theme && changes.theme.currentValue !== undefined) || (changes.UID && changes.UID.currentValue !== undefined) || (changes.roomColor && changes.roomColor.currentValue !== undefined)){
			this.assignRoomColor(
				changes.UID ? changes.UID.currentValue : this.structure.currentRoom.UID
			);
		}
	}

	private assignRoomColor(UID: string): void{
		// search for room
		const room: Room|undefined = this.structure.rooms.find((x: Room)=> x.UID === UID);
		if(room){
			if(room.color){
				// assign color
				this.assignColor('color', room.color);
			}else{
				this.assignColor('color', 'theme');
			}
		}
	}

	private assignColor(attr: string, val: string): void{
		if(val !== 'theme'){
			this.ref.nativeElement.childNodes.forEach((elem: HTMLElement)=>{
				this.renderer.removeClass(elem, 'theme-text');
				elem.style[attr as any] = val;
			});
		}else{
			// assign theme style
			this.ref.nativeElement.childNodes.forEach((elem: HTMLElement)=>{
				this.renderer.addClass(elem, 'theme-text');
			});
		}
	}
}
@NgModule({
	declarations: [ RoomColorDirective ],
	exports: [ RoomColorDirective ]
})
export class RoomColorModule {}