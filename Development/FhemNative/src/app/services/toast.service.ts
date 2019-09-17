import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from './settings.service';
import { AlertController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';

@Injectable({
	providedIn: 'root'
})

export class ToastService {

	private toastSettings = {
		tapToDismiss: true,
		timeOut: 1500,
		positionClass: 'toast-bottom-left',
		toastClass: 'toast',
		easing: 'ease-out'
	};

	private notifySettings = {
		tapToDismiss: true,
		timeOut: 3000,
		positionClass: 'toast-top-center',
		toastClass: 'notify',
		easing: 'ease-out'
	};

	constructor(
		private toast: ToastrService,
		private settings: SettingsService,
		private zone: NgZone,
		private alertController: AlertController,
		private translate: TranslateService) {
	}

	public addToast(head, message, style) {
		this.zone.run(() => {
			const styling = style.toLowerCase();
			if (this.settings.app.showToastMessages) {
				this.toast[styling](
					message,
					head,
					this.toastSettings
				);
			}
		});
		if (style === 'error') {
			throw new Error(head + ': ' + message);
		}
	}

	public addNotify(head, message, handle) {
		return new Promise((resolve) => {
			this.zone.run(() => {
				const t = this.toast.info(message, head, this.notifySettings);
				if (handle) {
					t.onTap.subscribe((action) => {
						resolve(true);
					});
					const time = setTimeout(() => {resolve(false); }, this.notifySettings.timeOut);
				} else {
					resolve(false);
				}
			});
		});
	}

	async showAlert(head, message, buttons) {
		const opts = {
			header: head,
			message,
			buttons: (buttons.buttons ? buttons.buttons : (buttons ? buttons : [{text: this.translate.instant('GENERAL.BUTTONS.OKAY'), role: 'cancel'}]))
		};
		const inputs = (buttons.inputs ? buttons.inputs : null);
		if (inputs) {
			opts['inputs'] = inputs;
		}


		const alert = await this.alertController.create(opts);
  await alert.present();
	}
}
