import { Component, Input, HostListener, ElementRef } from '@angular/core';

import { SettingsService } from '../../services/settings.service';
import { UndoRedoService } from '../../services/undo-redo.service';

import { Subscription } from 'rxjs';

@Component({
	selector: 'button-container',
	template: `
		<ng-container *ngIf="settings.modes.roomEdit">
			<div class="container" [ngClass]="settings.app.theme" [class.moveRight]="moveToRight">
				<div class="btn-container">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" (click)="cancelChanges()">
						<ion-icon class="close-icon bigger" name="close-circle-outline"></ion-icon>
					</button>
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" (click)="saveChanges()">
						<ion-icon class="save-icon bigger" name="checkmark-circle-outline"></ion-icon>
					</button>
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" *ngIf="settings.app.enableUndoRedo" (click)="showUndoManager()">
						<ion-icon class="bigger change" name="more"></ion-icon>
					</button>
				</div>
				<div class="undo-manager" *ngIf="showUndo">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" *ngIf="settings.app.enableUndoRedo" (click)="undoManager.redoChange()">
						<ion-icon class="bigger change" name="redo"></ion-icon>
					</button>
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round" (click)="undoManager.undoChange()">
						<ion-icon class="bigger change" name="undo"></ion-icon>
					</button>
				</div>
			</div>
		</ng-container>
	`,
	styles: [`
		.container{
			position: fixed;
		    top: 5px;
		    right: 0px;
		    z-index: 1000;
		    width: 160px;
		    height: 55px;
		}
		.moveRight.container{
			right: 62px;
		}
		.btn-container{
			position: relative;
		}
		.undo-manager{
			padding-top: 5px;
			position: absolute;
		    width: 115px;
		    height: 55px;
		    z-index: 100;
		    background: #fff;
		    transform: translate(-35px, 50px);
		    border-top-left-radius: 5px;
		    border-top-right-radius: 5px;
		    border-bottom-left-radius: 5px;
		    border-bottom-right-radius: 5px;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		}
		.undo-manager:before {
		    position: absolute;
		    content: "";
		    display:block;
		    width:0;
		    height:0;
		    left:50%;
		    margin-left: -10px;
		    margin-top: -20px;
		    border: 10px solid transparent;
		    border-bottom: 10px solid #fff;
		}
		.btn-round{
			position: relative;
			float: right;
			margin-right: 8px;
			width: 45px;
		    height: 45px;
		    border-radius: 50%;
		    border: none;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		    z-index: 100;
		}
		.btn-round ion-icon{
			font-size: 25px;
		}
		.btn-round ion-icon.bigger{
			font-size: 32px;
		}
		button:focus{
			outline: 0px;
		}
		.btn-round .change{
			color: var(--btn-blue);
		}
		.btn-round .save-icon{
			color: var(--btn-green);
		}
		.btn-round .close-icon{
			color: var(--btn-red);
		}
		.dark .btn-round,
		.dark .undo-manager{
			background: var(--dark-bg);
		}
		.dark .undo-manager:before{
			border-bottom: 10px solid var(--dark-bg);
		}
	`]
})
export class ButtonContainerComponent {
	@Input() moveToRight: boolean = false;

	public showUndo: boolean = false;

	constructor(
		public settings: SettingsService,
		public undoManager: UndoRedoService,
		private ref: ElementRef) {
	}

	@HostListener('document:mousedown', ['$event.target'])
	@HostListener('document:touchstart', ['$event.target']) 
	onClick(target) {
    	if (!this.ref.nativeElement.contains(target) && this.showUndo) {
      		this.showUndo = false;
    	}
  	}

	public cancelChanges(){
		this.settings.modeSub.next({roomEdit: false});
		this.undoManager.cancelChanges();
	}

	public saveChanges() {
		this.settings.modeSub.next({roomEdit: false});
		this.undoManager.applyChanges();
	}

	public showUndoManager(){
		this.showUndo = !this.showUndo;
	}
}