import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { SettingsService } from '../settings.service';

@Injectable({providedIn: 'root'})
export class LoggerService implements ErrorHandler {
	constructor(private injector: Injector) { }

	// log message and save to log
	log(type: string, message: any) {
		const m: string = new Date().toISOString() + ' ' + type + ': ' + message;
		const log: string[] = this.injector.get(SettingsService).log;
		log.push(m);
	}

	// Logger Info Message
	info(message: string){
		this.log('INFO', message);
	}

	// Logger Error Message
	error(message: string){
		this.log('ERROR', message);
	}

	handleError(error: Error) {
		this.log('ERROR', error);
		console.error(error);
	}
}
