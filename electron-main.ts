import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow|null = null;
const args = process.argv.slice(1), serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

	const electronScreen = screen;
	const size = electronScreen.getPrimaryDisplay().workAreaSize;

	// Create the browser window.
	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});
	// remove header menu
	win.removeMenu();
	
	if (serve) {

		win.webContents.openDevTools();

		require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/node_modules/electron`)
		});
		win.loadURL('http://localhost:4200');

	} else {
		win.loadURL(url.format({
			pathname: path.join(__dirname, 'dist/FhemNativeDesktop/index.html'),
			protocol: 'file:',
			slashes: true
		}));

		// fix reload
		win.webContents.on('did-fail-load', () => {
			if(win){
				win.loadURL(url.format({
					pathname: path.join(__dirname, 'dist/FhemNativeDesktop/index.html'),
					protocol: 'file:',
					slashes: true
				}));
			}
		});
	}

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});

	// dynamic window resize
	ipcMain.on('resize-window', (event, dimensions)=>{
		if(win){
			win.setSize(dimensions.width, dimensions.height);
		}
	});

	return win;
}

try {
	// allow self signed certificate
	app.commandLine.appendSwitch('ignore-certificate-errors');
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	// Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
	app.on('ready', () => setTimeout(createWindow, 400));

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow();
		}
	});

} catch (e) {
	// Catch Error
	// throw e;
}
