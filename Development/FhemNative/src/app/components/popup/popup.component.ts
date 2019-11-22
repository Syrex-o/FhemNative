import { Component, Input, OnInit, OnDestroy, ViewChild, ViewContainerRef, Output, EventEmitter, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { StructureService } from '../../services/structure.service';
import { FhemService } from '../../services/fhem.service';
import { CreateComponentService } from '../../services/create-component.service';
import { BackButtonService } from '../../services/backButton.service';
import { HelperService } from '../../services/helper.service';

@Component({
	selector: 'popup',
	template: `
		<div
			*ngIf="!customMode"
			class="popup"
			[ngClass]="settings.app.theme"
			resize
			double-click
			[editingEnabled]="settings.modes.roomEdit"
			minimumWidth="35"
			minimumHeight="35"
			id="{{ID}}"
			[ngStyle]="{'width': width, 'height': height, 'top': top, 'left': left, 'z-index': zIndex}">
			<fhem-container [specs]="{'device': data_device, 'reading': data_reading, 'available': true, 'offline': true}">
				<button
				matRipple [matRippleColor]="'#d4d4d480'"
				class="popup-btn"
				(click)="openPopup()">
					<div class="icon-container">
						<ion-icon
							[name]="(fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? icon_iconOn : icon_iconOff) : icon_iconOn)"
							[ngStyle]="{'color': (fhemDevice ? (fhemDevice.readings[data_reading].Value === data_getOn ? style_iconColorOn : style_iconColorOff) : (showPopup ? style_iconColorOn : style_iconColorOff) ) }">
						</ion-icon>
					</div>
				</button>
			</fhem-container>
		</div>
		<div
			class="popup-container {{settings.app.theme}}"
			[ngClass]="showPopup ? 'popup-open' : 'popup-close'"
			[ngStyle]="{'position': (customMode ? (fixPosition ? 'fixed' : 'absolute') : 'fixed')}">
			<div class="popup-backdrop" (click)="closePopup()"></div>
			<div 
				class="popup-inner"
				[ngStyle]="{'width': data_width+'%', 'height': data_height+'%'}">
				<div class="popup-header" [ngClass]="newsSlide ? 'slide' : 'no-slide'">
					<button matRipple [matRippleColor]="'#d4d4d480'" class="btn-round right" *ngIf="!customMode && !settings.modes.roomEdit && settings.app.enableEditing" (click)="edit()">
		                <ion-icon class="edit" name="create"></ion-icon>
		            </button>
					<div class="headline-container">
						<h2>{{headLine}}</h2>
					</div>
					<ng-template [ngIf]="closeButton">
						<button class="close-container" (click)="closePopup()" matRipple [matRippleColor]="'#d4d4d480'">
							<div class="close">
								<span class="line top"></span>
								<span class="line bottom"></span>
							</div>
						</button>
					</ng-template>
				</div>
				<div class="popup-content" [attr.id]="'popup_'+(ID !== undefined ? ID : '-1')">
					<ng-content></ng-content>
					<ng-container #container></ng-container>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.popup{
			position: absolute;
			width: 40px;
			height: 40px;
		}
		.popup-btn{
			position: absolute;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background: #ffffff;
			border: none;
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%,0);
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		}
		.popup-btn:focus{
			outline: 0px;
		}
		.popup-btn ion-icon{
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate3d(-50%, -50%,0);
			width: 100%;
			height: 100%;
			transition: all .2s ease;
		}
		.popup-container{
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 20003;
			transition: all .3s linear;
			transform: scale3d(0,0,0);
			opacity: 0;
			will-change: transform;
		}
		.popup-backdrop{
			position: absolute;
			width: inherit;
			height: inherit;
			top: 0;
			left: 0;
			background: var(--dark-overlay);
		}
		.popup-container.popup-close{
			transform: scale3d(0,0,0);
			opacity: 0;
		}
		.popup-container.popup-open{
			transition: all .3s cubic-bezier(.17,.67,.54,1.3);
			opacity: 1;
			transform: scale3d(1,1,1);
		}
		.popup-inner{
			position: absolute;
			left: 50%;
			top: 50%;
			transition: all .3s linear;
			width: 80%;
			height: 80%;
			background: #fff;
			box-shadow: 0 25px 35px 0 rgba(0, 0, 0, 0.35);
			overflow: hidden;
			transform-origin: top left;
			transform: translate3d(-50%, -50%,0);
			border-radius: 5px;
		}
		.popup-header{
			height: 55px;
			position: relative;
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		}
		.close-container{
			position: absolute;
			top: 0;
			right: 0;
			width: 100px;
    		height: 40px;
    		transform: rotate(45deg) translate3d(20px,-30px,0);
    		background: #ddd;
		}
		.close{
			position: absolute;
			width: 30px;
			height: 30px;
			left: 50%;
			bottom: 0;
			background: transparent;
			transform: translate3d(-50%,0,0);
		}
		.close-container:focus,
		.btn-round:focus{
			outline: 0px;
		}
		.btn-round{
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 45px;
		    height: 45px;
		    border-radius: 50%;
		    border: none;
		    box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
		    z-index: 100;
		}
		.btn-round ion-icon{
			color: var(--btn-blue);
			font-size: 25px;
		}
		.btn-round.right{
			right: 60px;
		}
		.line{
			position: absolute;
			left: 50%;
			top: 50%;
			width: 80%;
			height: 3px;
			background: #000;
			border-radius: 5px;
			transition: all .3s ease;
		}
		.line.top{
			transform: translate3d(-50%, -50%,0);
		}
		.line.bottom{
			transform: translate3d(-50%, -50%,0) rotate(90deg);
		}
		.headline-container{
			position: absolute;
			top: 0;
			height: 100%;
			width: calc(100% - 40px);
			overflow: hidden;
		}
		.slide .headline-container h2{
			animation: ticker 15s ease infinite;
		}
		@keyframes ticker {
		  0% {
		    transform: translate3d(0, 0, 0);
		    visibility: visible;
		  }

		  50% {
		    transform: translate3d(-40%, 0, 0);
		  }
		  100% {
		    transform: translate3d(0%, 0, 0);
		  }
		}
		h2{
			position: absolute;
			margin: 0;
			white-space: nowrap;
			text-align: left;
			padding-top: 10px;
			margin-left: 20px;
			z-index: -1;
		}
		.popup-content{
			position: absolute;
			height: calc(100% - 55px);
			padding-top: 15px;
			padding-left: 10px;
			padding-right: 10px;
			padding-bottom: 10px;
			width: 100%;
			overflow-y: auto;
			overflow-x: hidden;
		}

		.dark .popup-btn,
		.dark .popup-inner,
		.dark .btn-round{
			background: var(--dark-bg);
		}
		.dark h2{
			color: var(--dark-p);
		}
		.dark .line{
			background: var(--dark-p);
		}
		.dark .close-container{
			background: var(--dark-bg-dark);
		}
		.dark .headline-container{
			box-shadow: inset 20px 0px 10px 0px rgba(24, 37, 43, 1);
		}
	`],
	providers: [{provide: NG_VALUE_ACCESSOR, useExisting: PopupComponent, multi: true}]
})

export class PopupComponent implements OnInit, OnDestroy, ControlValueAccessor {

	constructor(
		public settings: SettingsService,
		private structure: StructureService,
		private fhem: FhemService,
		private createComponent: CreateComponentService,
		private ref: ElementRef,
		private backBtn: BackButtonService,
		private helper: HelperService) {}
	@ViewChild('container', { static: true, read: ViewContainerRef }) container: ViewContainerRef;

	// Popup Settings
    public newsSlide = false;

    // Custom Popup Settings
    // used for usage outside of fhem
    @Input() customMode = false;
    // headline of the popup
    @Input() headLine: string;
    // show/hide close button
    @Input() closeButton = true;
    // back button priority
    @Input() priority = 1;

    public showPopup = false;

    @Output() onOpen = new EventEmitter();
    @Output() onClose = new EventEmitter();

    // popup properties
    @Input() fixPosition = false;

	// Component ID
	@Input() ID: number;
	// room ID
	private roomID: number;

	@Input() data_device: string;
	@Input() data_reading: string;
	@Input() data_getOn: string;
	@Input() data_getOff: string;
	@Input() data_headline: string;
	@Input() data_width: string = '80';
    @Input() data_height: string = '80';
	@Input() bool_data_openOnReading: boolean;

	// Icons
	@Input() icon_iconOn: string;
	@Input() icon_iconOff: string;

	// Styling
	@Input() style_iconColorOn: string;
	@Input() style_iconColorOff: string;

	// position information
	@Input() width: number;
	@Input() height: number;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	public fhemDevice: any;
	// fhem event subscribtions
    private deviceChange: Subscription;
    private modeSubscriber: Subscription;

    // popup edit mode
    public editingEnabled: boolean = false;

	static getSettings() {
		return {
			name: 'Popup',
			component: 'PopupComponent',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_reading', default: 'state'},
				{variable: 'data_getOn', default: 'on'},
				{variable: 'data_getOff', default: 'off'},
				{variable: 'data_headline', default: 'Popup'},
				{variable: 'data_width', default: '80'},
				{variable: 'data_height', default: '80'},
				{variable: 'bool_data_openOnReading', default: false},
				{variable: 'icon_iconOn', default: 'add-circle'},
				{variable: 'icon_iconOff', default: 'add-circle'},
				{variable: 'style_iconColorOn', default: '#86d993'},
				{variable: 'style_iconColorOff', default: '#86d993'}
			],
			dimensions: {minX: 40, minY: 40}
		};
	}

    onTouched: () => void = () => {};
	onChange: (_: any) => void = (_: any) => {};
	updateChanges() {this.onChange(this.showPopup); }
	registerOnChange(fn: any): void {this.onChange = fn; }
	registerOnTouched(fn: any): void {this.onTouched = fn; }

	writeValue(value) {
		this.showPopup = value;
		if (value) {
  			this.onOpen.emit();
  			// Back button
  			this.backBtn.handle(this.priority).then(() => {
  				this.closePopup();
  			});
  			this.updateChanges();
  			if (this.ref.nativeElement.querySelector('.headline-container')) {
  				const headLineContainer = this.ref.nativeElement.querySelector('.headline-container').clientWidth;
	  			const headline = this.ref.nativeElement.querySelector('h2').clientWidth;
				  if (headline >= headLineContainer - 20) {
					this.newsSlide = true;
				}
  			}
  		}
	}

	ngOnInit() {
		if (!this.customMode) {
			this.fhem.getDevice(this.data_device, this.data_reading).then((device) => {
				this.fhemDevice = device;
				if (device) {
					this.headLine = this.fhemDevice.device;
					this.deviceChange = this.fhem.devicesSub.subscribe(next => {
						  this.listen(next);
					});
				} else {
					this.headLine = this.data_headline;
				}
			});
			// detecting mode changes in room edit
			this.modeSubscriber = this.settings.modeSub.subscribe(next => {
				if(next.hasOwnProperty('roomEdit') || next.hasOwnProperty('roomEditFrom')){
					if(!this.settings.modes.roomEdit){
						this.createComponent.removeSingleComponent('GridComponent', this.container);
					}else{
						if(!this.customMode && this.showPopup && this.editingEnabled && this.structure.canEdit(this.ID)){
							this.createComponent.createSingleComponent('GridComponent', this.container, {
								container: this.container
							});

							this.createComponent.createSingleComponent('CreateComponentComponent', this.createComponent.currentRoomContainer, {
								container: this.container
							});
						}
						if(!this.structure.canEdit(this.ID)){
							this.createComponent.removeSingleComponent('GridComponent', this.container);
						}
					}
				}
			});
			// getting the spawn room ID, to remove components after OnDestroy
			this.roomID = this.structure.currentRoom.ID;
		}
	}

	private listen(update) {
		if (update.found.device === this.data_device) {
			if (update.change.changed[this.data_reading]) {
				const reading = update.change.changed[this.data_reading];
				if (reading === this.data_getOn && this.bool_data_openOnReading) {
					this.openPopup();
  				}
  		if (reading === this.data_getOff && this.bool_data_openOnReading) {
  					this.closePopup();
  				}
			}
		}
	}

	public edit() {
		if (!this.customMode) {
			this.editingEnabled = true;
			this.settings.modeSub.next({
				roomEdit: true,
				roomEditFrom: this.ID
			});
		}
	}

	public openPopup() {
		this.showPopup = true;
		this.backBtn.handle(this.priority).then(() => {
			this.closePopup();
		});
		if (!this.customMode) {
			setTimeout(() => {
				this.createComponent.loadRoomComponents(
					this.structure.getComponentContainer(this.container),
					this.container,
					false
				);
			});
		}
	}

	public closePopup() {
		if (this.customMode) {
			this.showPopup = false;
			this.updateChanges();
			this.onClose.emit();
		} else {
			if (!this.settings.modes.roomEdit) {
				// only close popup in fhem mode, if editing mode is not active
				this.showPopup = false;
				this.editingEnabled = false;
				this.backBtn.removeHandle(this.priority);

				this.removeFhemComponents();
			}
		}
	}

	private removeFhemComponents() {
		// removing fhem components in popup from view
		const popupComponents = this.structure.getComponentContainer(this.container);
		for (let i = 0; i < popupComponents.length; i++) {
			this.createComponent.removeFhemComponent(popupComponents[i].ID);
		}
		this.container.clear();
	}

	ngOnDestroy() {
		if (this.fhemDevice) {
			if (this.deviceChange !== undefined) {
				this.deviceChange.unsubscribe();
			}
		}
		if (!this.customMode) {
			if (this.modeSubscriber !== undefined) {
				this.modeSubscriber.unsubscribe();
			}
			this.removeFhemComponents();
		}
	}
}
