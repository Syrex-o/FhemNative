import { Injectable } from '@angular/core';

import { Remote, IpcRenderer } from 'electron';

interface ElectronWindow extends Window {
    require(module: string): any;
}

declare let window: ElectronWindow;

@Injectable({providedIn: 'root'})

export class ElectronService {

	private get isElectron(): boolean {
		if (window && window.require('electron')) {
			return true;
		}
		return false;
	}

	public get remote(): Remote|null {
		return this.isElectron ? window.require('electron').remote : null;
	}

	public get ipcRenderer(): IpcRenderer|null {
		return this.isElectron ? window.require('electron').ipcRenderer : null;
	}
}