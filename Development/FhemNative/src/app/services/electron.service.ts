import { Injectable } from '@angular/core';

import * as Electron from 'electron';

interface ElectronWindow extends Window {
    require(module: string): Electron.RendererInterface;
}

declare let window: ElectronWindow;

@Injectable({
	providedIn: 'root'
})

export class ElectronService {
	private _electron: Electron.RendererInterface;

	private get electron(): Electron.RendererInterface {
        if (!this._electron) {
            if (window && window.require) {
                this._electron = window.require('electron');
                return this._electron;
            }
            return null;
        }
        return this._electron;
    }

    public get remote(): Electron.Remote {
        return this.electron ? this.electron.remote : null;
    }

    public get clipboard(): Electron.Clipboard {
        return this.electron ? this.electron.clipboard : null;
    }

    public get process(): any {
        return this.remote ? this.remote.process : null;
    }
}