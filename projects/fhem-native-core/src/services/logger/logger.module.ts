import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoggerService } from './logger.service';

@NgModule({
	imports: [CommonModule],
	providers: [{
		provide: ErrorHandler,
		useClass: LoggerService,
	}]
})
export class LoggerModule { }