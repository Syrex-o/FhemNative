import { Injectable, NgZone } from '@angular/core';
import { AlertController, ActionSheetController, AlertOptions, ActionSheetOptions } from '@ionic/angular';
// Plugins
import { ToastrService } from 'ngx-toastr';
// Services
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from './logger.service';

import { clone } from '@fhem-native/utils';
interface NotifyDefaults {
	tapToDismiss: boolean,
	timeOut: number,
	positionClass: string,
	toastClass: string,
	easing: string,
	progressBar?: boolean
}

export declare type ToastStyle = 'info'|'error'|'success';

@Injectable({providedIn: 'root'})
export class ToastService {
	// store current alert, to dismiss before creating a new one
	private currentAlert!: HTMLIonAlertElement;

	// default taost settings
	private toastSettings: NotifyDefaults = {
		tapToDismiss: true,
		timeOut: 1_500,
		progressBar: true,
		positionClass: 'toast-bottom-left',
		toastClass: 'toast',
		easing: 'ease-out'
	};
	// default notofy settings
	private notifySettings: NotifyDefaults = {
		tapToDismiss: true,
		timeOut: 3_000,
		positionClass: 'toast-top-center',
		toastClass: 'notify',
		easing: 'ease-out'
	};

	constructor(
		private zone: NgZone,
		private toast: ToastrService,
		private logger: LoggerService,
		private alertCtrl: AlertController,
		private translate: TranslateService,
		private actionCtrl: ActionSheetController){
	}

	// add a toast message
	// Toast Styles:
		// info
		// error
		// success
	public addToast(head: string, message: string, style: ToastStyle, stayTime?: number): void {
		this.zone.run(() => {
			const settings: NotifyDefaults = clone( this.toastSettings );
			if(stayTime) settings.timeOut = stayTime;

			this.toast[style](message, head, settings);
		});

		return this.logger[style]( `${head}: ${message}` );
	}

	// adds a toast message from translate keys
	public addTranslatedToast(head: string, message: string, style: ToastStyle, stayTime?: number): void{
		this.addToast( this.translate.instant(head), this.translate.instant(message), style, stayTime );
	}

	// add an alert message
	async showAlert(head: string, message: string, buttons: any, cssClass?: string) {
		const opts: AlertOptions = {
			header: head,
			message,
			mode: 'md',
			cssClass: cssClass ? cssClass : '',
			buttons: (buttons.buttons ? buttons.buttons : (buttons ? buttons : [{text: this.translate.instant('BUTTONS.OKAY'), role: 'cancel'}]))
		};
		const inputs = (buttons.inputs ? buttons.inputs : null);
		if (inputs) opts['inputs'] = inputs;

		// remove existing alert
		if (this.currentAlert) this.currentAlert.dismiss();
		// create new alert
		this.currentAlert = await this.alertCtrl.create(opts);
  		await this.currentAlert.present();
	}

	// adds an alert from translate keys
	async showTranslatedAlert(head: string, message: string, buttons: any, cssClass?: string) {
		await this.showAlert(this.translate.instant(head), this.translate.instant(message), buttons, cssClass);
	}

	async showAction(head: string, message: string, buttons: Array<any>, cssClass?: string) {
		const opts: ActionSheetOptions = {
			header: head,
			mode: 'md',
			subHeader: message,
			cssClass: cssClass ? cssClass : '',
			buttons: buttons
		};
		const action = await this.actionCtrl.create(opts);
		await action.present();
	}
}