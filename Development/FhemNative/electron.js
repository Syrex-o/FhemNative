const electron = require('electron');
const { ipcMain, screen } = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

let win, serve
const args = process.argv.slice(1)
serve = args.some(val => val === '--serve')

function createWindow() {
	const size = screen.getPrimaryDisplay().workAreaSize;


	win = new BrowserWindow({
		x: 0,
		y: 0,
		width: size.width,
		height: size.height,
		useContentSize: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	})
	if (serve) {
		win.webContents.openDevTools();

		require('electron-reload')(__dirname, {
			electron: require(`${__dirname}/node_modules/electron`)
		})
		win.loadURL('http://localhost:4200')
	} else {
		win.loadURL(
			url.format({
				pathname: path.join(__dirname, 'www/index.html'),
				protocol: 'file:',
				slashes: true
			})
		);
	}
	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store window
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null
	});

	// dynamic window resize
	ipcMain.on('resize-window', (event, dimensions)=>{
		win.setSize(dimensions.width, dimensions.height);
	});
}
try {
	// allow self signed certificate
	app.commandLine.appendSwitch('ignore-certificate-errors');
	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.on('ready', () => setTimeout(createWindow, 400));

	// Quit when all windows are closed.
	app.on('window-all-closed', () => {
		// On OS X it is common for applications and their menu bar
		// to stay active until the user quits explicitly with Cmd + Q
		if (process.platform !== 'darwin') {
			app.quit()
		}
	});
	app.on('activate', () => {
		// On OS X it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (win === null) {
			createWindow()
		}
	});
} catch (e) {
	// Catch Error
	// throw e;
}