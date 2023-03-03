import { ErrorHandler, Inject, Injectable } from '@angular/core';

import { exportToJson, getRawVersionCode } from '@fhem-native/utils';
import { APP_CONFIG } from '@fhem-native/app-config';

declare type LogType = 'SUCCESS'|'INFO'|'ERROR';

@Injectable({providedIn: 'root'})
export class LoggerService {
    private readonly maxLogLength = 50;
    private currLogs: string[] = [];

    constructor(@Inject(APP_CONFIG) private appConfig: any) { }

    private addLogPoint(type: LogType, message: string): void{
        const m = new Date().toISOString() + ' -- ' + type + ': ' + message;
        this.currLogs.push(m);

        // check for max length
        if(this.currLogs.length > this.maxLogLength) this.currLogs.splice(0, this.currLogs.length - this.maxLogLength);

        if(type === 'SUCCESS') return console.log('%c' + message, 'color: #198754');
        if(type === 'INFO') return console.log('%c' + message, 'color: #6495ED');
        if(type === 'ERROR') return console.error('%c' + message, 'color: #DC143C');
    }

    public exportLogs(): void{
        exportToJson( { type: 'Logs', versionCode: getRawVersionCode(this.appConfig.versionCode), data: this.currLogs }, 'Logs' );
    }

    public success(success: any): void{
        this.addLogPoint('SUCCESS', success?.message || success);
    }
    
    public info(info: any): void{
        this.addLogPoint('INFO', info?.message || info);
    }

    public error(error: any): void {
        this.addLogPoint('ERROR',  error?.message || error);
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