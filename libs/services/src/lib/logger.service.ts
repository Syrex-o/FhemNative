import { ErrorHandler, Injectable, Injector } from '@angular/core';

import { ImportExportService } from './importExport.service';

@Injectable({providedIn: 'root'})
export class LoggerService {
    private readonly maxLogLength = 50;
    private currLogs: string[] = [];

    constructor(private injector: Injector) { }

    private addLogPoint(type: 'INFO'|'ERROR', message: string): void{
        const m = new Date().toISOString() + ' -- ' + type + ': ' + message;
        this.currLogs.push(m);

        // check for max length
        if(this.currLogs.length > this.maxLogLength) this.currLogs.splice(0, this.currLogs.length - this.maxLogLength);

        if(type === 'INFO') return console.log('%c' + message, 'color: #6495ED');
        if(type === 'ERROR') return console.error('%c' + message, 'color: #DC143C');
    }

    public exportLogs(): void{
        this.injector.get(ImportExportService).exportLogs(this.currLogs);
    }
    
    public info(error: any): void{
        this.addLogPoint('INFO',  error.message || error);
    }

    public error(error: any): void {
        this.addLogPoint('ERROR',  error.message || error);
    }
}

@Injectable()
export class ErrorHandlerService extends ErrorHandler {

    constructor(private logger: LoggerService) {
        super();
    }

    override handleError(error: any) {
        this.logger.error(error);
        super.handleError(error);
    }
}