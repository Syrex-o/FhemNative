import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { SettingsService } from '../settings.service';

@Injectable({
	providedIn: 'root'
})

export class LoggerService implements ErrorHandler {

	constructor(private injector: Injector) { }

	log(type: string, message: any) {
		const m = new Date().toISOString() + ' ' + type + ': ' + message;
		const settings = this.injector.get(SettingsService).app;
		const log = this.injector.get(SettingsService).log;
		if (settings.enableLog) {
			log.push(m);
		}
	}

	info(message: string){
		this.log('INFO', message);
	}

	error(message: string){
		this.log('ERROR', message);
	}

	handleError(error: Error) {
    	this.log('ERROR', error);
    	console.error(error);
  	}
}
