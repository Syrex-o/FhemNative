import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { SettingsService } from '../settings.service';

@Injectable({
	providedIn: 'root'
})

export class LoggerService implements ErrorHandler {

	constructor(private injector: Injector) { }

	private addToLog(type, message) {
		const m = new Date + ' ' + type + ': ' + message;
		const log = this.injector.get(SettingsService).log;
		if (log.isActive) {
			log.events.push(m);
		}

	}

	handleError(error: Error) {
    	this.addToLog('ERROR', error);
    	console.error(error);
  	}
}
