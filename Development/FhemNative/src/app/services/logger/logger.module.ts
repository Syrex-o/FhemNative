import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';


import { LoggerService } from './logger.service';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [],
    declarations: [],
    providers: [
        {
      		provide: ErrorHandler,
      		useClass: LoggerService,
    	}
    ]
})
export class LoggerModule { }
