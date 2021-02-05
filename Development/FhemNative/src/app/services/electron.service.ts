import { Injectable } from '@angular/core';

import { ipcRenderer, remote, clipboard } from 'electron';

@Injectable({
	providedIn: 'root'
})

export class ElectronService {
	private get electron(): boolean {
		return !!(window && window.process && window.process.type);
	}

	public get remote(): Electron.Remote {
		return this.electron ? window.require('electron').remote : null;
	}

	public get ipcRenderer(): Electron.IpcRenderer {
		return this.electron ? window.require('electron').ipcRenderer : null;
	}

	public get clipboard(): Electron.Clipboard {
		return this.electron ? window.require('electron').clipboard : null;
	}

	public get process(): any {
		return this.remote ? this.remote.process : null;
	}
}