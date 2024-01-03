import { Inject, Injectable } from '@angular/core';

// websocket 
import { Subject, BehaviorSubject, timeout, take, tap, ReplaySubject, takeUntil, timer, share, toArray, distinct, switchMap, of, Observable, concat, delay, merge, map, filter } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

// Services
import { LoggerService } from './logger.service';
import { SettingsService } from './settings.service';
import { ToastService, ToastStyle } from './toast.service';

import { ComponentLoaderService } from './component-loader.service';
import { StructureService } from './structure.service';

import { APP_CONFIG, AppConfig } from '@fhem-native/app-config';

import { getRawVersionCode, IsJsonString } from '@fhem-native/utils';

import { SharedConfig } from '@fhem-native/types/room';
import { ConnectionProfile, FhemDevice, ListenDevice } from '@fhem-native/types/fhem';

@Injectable({providedIn: 'root'})
export class FhemService {
    public connectionInProgress = false;
	public connected = new BehaviorSubject<boolean|null>(null);

    // device subscriptions
	public deviceGetSub: Subject<FhemDevice> = new Subject<FhemDevice>();
	public deviceUpdateSub: Subject<FhemDevice> = new Subject<FhemDevice>();

    // Fhem device list
	public devices: Array<FhemDevice> = [];
	// list of devices to listen for changes
	public listenDevices: Array<ListenDevice> = [];

	// list for device requests --> send multiple devices at once, to reduce calls
	private deviceGetter!: Observable<FhemDevice|null>;
	private deviceRequestCombiner: Subject<{deviceName: string, readingName: string}>|null = null;

    // connection
	public blockReConnect = false;
	private preventConnect = false;
	private socket!: WebSocketSubject<any>|null;

	private awaitConnTimeout: any;
	private trialTimeout: any;
	private maxTrialTimeout: any;

	// connection tries
	private currConnProfileIndex = 0;
	private tries = 0;
	private readonly maxTries = 10;
	private readonly timeouts = {
		CONNECT: 5_000,
		TRIAL_WAIT: 2_000,
		MAX_TRIAL_WAIT: 5_000,
		TEST_SOCKET_CONNECT: 5_000
	}

	private readonly sharedConfigUID = 'SHARED_CONFIG_DEVICE';

    constructor(
		protected toast: ToastService,
		protected logger: LoggerService,
		protected settings: SettingsService,
		protected structure: StructureService,
		protected compLoader: ComponentLoaderService,
		@Inject(APP_CONFIG) protected appConfig: AppConfig){
		
		let timeout: any;
		let toastDevices: string[] = [];

		this.deviceUpdateSub.subscribe((fhemDevice)=>{
			toastDevices.push(fhemDevice.device);

			for(const listenDevice of this.listenDevices){
				if(listenDevice.device === fhemDevice.device && listenDevice.handler) listenDevice.handler(fhemDevice);
			}

			if(timeout) clearInterval(timeout);
			timeout = setTimeout(()=>{
				const uniqueDevices = [...new Set(toastDevices)];
				this.fhemToaster(`Update received for device${uniqueDevices.length > 1 ? 's' : ''}: ${uniqueDevices.join(', ')}`, 'info');
				toastDevices = [];
			}, 300);
		});
	}

	/**
	 * Toast messages to user
	 * includes logging
	 * @param message toast message
	 * @param level toast/log level
	 * @returns
	 */
	private fhemToaster(message: string, level: ToastStyle): void{
		if(this.settings.app.allowToasts) return this.toast.addToast('FHEM', message, level);
		// just log if no toasts are allowd
		this.logger[level](message);
	}

	private sharedConfigToaster(message: string, level: ToastStyle): void{
		if(this.settings.app.allowToasts) return this.toast.addToast('Shared Config', message, level);
		// just log if no toasts are allowd
		this.logger[level](message);
	}

	/*
		Pre connection routine
		Check for existing profiles and valid data
	*/
    public checkPreConnect(): boolean{
		if(this.settings.connectionProfiles.length > 0){
			const initialProfile = this.settings.connectionProfiles[0];
			if(initialProfile && initialProfile.IP !== '') return true;
		}
		return false;
	}

	/**
	 * Get currently selected connection profile
	 */
	public getCurrentConnectionProfile(): ConnectionProfile{
		return this.settings.connectionProfiles[this.currConnProfileIndex];
	}

	/*
		Create the connection URL of the current Profile
	*/
	private getConnectionUrl(connectionProfile: ConnectionProfile): string{
		let url = '';

		if(connectionProfile.type.toLocaleLowerCase().match(/websocket|fhemweb/)){
			url = 
				// Secure / unsecure websocket
				(connectionProfile.WSS ? 'wss://' : 'ws://') + 
				// Login data for basicAuth
				(connectionProfile.basicAuth ? `${encodeURIComponent(decodeURIComponent(connectionProfile.USER))}:${encodeURIComponent(decodeURIComponent(connectionProfile.PASSW))}@` : '' );

			// add ip
			url += connectionProfile.IP;
			// add port
			url += (connectionProfile.PORT !== '' ? `:${connectionProfile.PORT}` : '');

			if(connectionProfile.type === 'fhemweb') url += '?XHR=1&inform=type=status;filter=.*;fmt=JSON' + '&timestamp=' + Date.now();
		}
		return url;
	}

	/**
		Reset all data associated to connection tries
	*/
	public resetConnectionTries(): void{
		this.tries = 0;
		this.currConnProfileIndex = 0;
	}

	/**
	 * 
	 * @param profile ConnectionProfile
	 * @returns connected / error as boolean
	 */
	public async testConnectionProfile(profile: ConnectionProfile): Promise<boolean>{
		return new Promise((resolve)=>{
			const testSocket = new WebSocketSubject({
				url: this.getConnectionUrl(profile),
				protocol: profile.type === 'websocket' ? 'json' : '',
				serializer: v => v as ArrayBuffer, deserializer: v=> v,
				openObserver: {
					next: ()=>{
						testSocket.complete();
						resolve(true);
					}
				},
				closeObserver: {
					next: ()=>{
						testSocket.complete();
						resolve(false);
					}
				},
			})

			testSocket.pipe( take(1), timeout(this.timeouts.TEST_SOCKET_CONNECT) ).subscribe({
				error: ()=> resolve(false)
			});
		});
	}

	/*
		Try to establish a connection
	*/
    public connect(): void {
        if((!this.socket || this.socket.closed) && this.checkPreConnect()){
            this.connectionInProgress = true;

			const currentConnectionProfile = this.getCurrentConnectionProfile();
			this.fhemToaster(`Try connecting with profile: ${this.currConnProfileIndex} - trial: ${this.tries}`, 'info');

			// create socket
			this.socket = new WebSocketSubject({
				url: this.getConnectionUrl(currentConnectionProfile),
				protocol: currentConnectionProfile.type === 'websocket' ? 'json' : '',
				serializer: v => v as ArrayBuffer,
				deserializer: v=> v,
				openObserver: { next: ()=> this.onConnectionOpened() }
			});

			// connection awaiter
			if(this.awaitConnTimeout) clearTimeout(this.awaitConnTimeout);
			this.awaitConnTimeout = setTimeout(()=> this.onConnectionError(`Timeout reached for profile: ${this.currConnProfileIndex}.`), this.timeouts.CONNECT);

			this.socket.asObservable().subscribe({
				next: (data)=> this.onConnectionData(data),
				error: ()=> this.onConnectionError(`Connection to profile: ${this.currConnProfileIndex} failed.`),
				complete: ()=> this.onConnectionComplete()
			});
        }
    }

	/*
		Disconnect and don´t reconnect
	*/
	public disconnect(): void{
		if(this.socket){
			this.preventConnect = true;
			this.socket.complete();
		}
	}

	/*
		Reconnect handler
	*/
	public reconnect(): void{
		if(this.blockReConnect) return;

		this.preventConnect = false;
		this.disconnect();
		this.connect();
	}

	/**
	 * Reconnect handler for intermediate interrupts
	 * 
	*/
	private retry(): void{
		if(this.preventConnect) return;
		// update profile
		this.currConnProfileIndex += this.settings.connectionProfiles[this.currConnProfileIndex + 1] ? 1 : 0;
		// update tries
		this.tries ++;

		if(this.tries < this.maxTries){
			if(this.trialTimeout) clearTimeout(this.trialTimeout);
			this.trialTimeout = setTimeout(()=> this.connect(), this.timeouts.TRIAL_WAIT);
		}else{
			this.tries = 0;
			this.connected.next(null);
			this.fhemToaster(`Maximum Trials reached. Trying to reconnect in ${this.timeouts.MAX_TRIAL_WAIT / 1000}sek`, 'error');

			if(this.maxTrialTimeout) clearTimeout(this.maxTrialTimeout);
			this.maxTrialTimeout = setTimeout(()=> this.connect(), this.timeouts.MAX_TRIAL_WAIT);
		}
	}


	/*
		Connection Events:
			Open: onConnectionOpened
			Data: onConnectionData
			Closed: onConnectionComplete
			Error: onConnectionError
	*/

	/*
		Connection Established
	*/
	private onConnectionOpened(): void{
		this.connected.next(true);
		this.connectionInProgress = false;
		this.tries = 0;

		this.fhemToaster(`Connection established with profile: ${this.currConnProfileIndex}`, 'success');
		if(this.awaitConnTimeout) clearTimeout(this.awaitConnTimeout);

		// check for shared config
		this.initializeSharedConfig();
	}

	private reset(): void{
		this.socket = null;
		this.devices = [];
	}

	/*
		Connection completed
		happens intentionally by calling complete
		happen unententionally sometimes
	*/
	private onConnectionComplete(): void{
		this.connected.next(null);
		this.fhemToaster('Connection closed', 'info');

		this.reset();
		this.retry();
	}

	/*
		Connection Error
	*/
	private onConnectionError(err: string): void{
		this.connected.next(false);
		this.fhemToaster(err, 'error');

		this.reset();
		this.retry();
	}

	/*
		Connection Data
	*/
	private onConnectionData(e: MessageEvent): void{
		let msg = e.data;
		const type = this.getCurrentConnectionProfile().type;

		// handle fhemweb
		if (type === 'fhemweb') {
			const lines: string[] = msg.split(/\n/).filter((s: string) => s !== '' && s !== '[""]');
			if (lines.length > 0) {
				// evaluation for: get all devices
				if (lines.length === 1) {
					msg = JSON.parse(msg);
					if(IsJsonString(msg)) {
						msg = JSON.parse(msg);
						msg.Results.forEach((result:any)=> this.deviceGetSub.next(this.deviceTransformer(result, true)) );
					}else{
						// used for: readingProxy
						// evaluation of changes
						// device got an update
						const [device, value, html] = JSON.parse(lines[0]);
						if(!this.listenDevices.find(x=> x.device === device)) return;

						const change: Record<string, string> = {};
						const prop = device.slice(device.length + 1) || 'state';
						change[prop] = value;

						this.updateListenDevice(device, change);
					}
				}else{
					// evaluation of changes
					// device got an update
					const device: string = JSON.parse(lines[0])[0];
					if(!this.listenDevices.find(x=> x.device === device)) return;

					const change: Record<string, string> = {};
					for (let i = 1; i < lines.length; i += 2) {
						const line = lines[i];
						if(line !== undefined && line !== '' && line.endsWith(']')){
							const [id, value, html] = JSON.parse(line);
							// remove device from id
							const prop = id.slice(device.length + 1) || 'state';
							change[prop] = value;
						}
					}
					this.updateListenDevice(device, change);
				}
			}
		}
		// external websocket handling
		if (type === 'websocket'){
			msg = JSON.parse(msg);
			// request deivce
			if(msg.type === 'listentry') {
				if(msg.payload.attributes) this.deviceGetSub.next(this.deviceTransformer(msg.payload, false));
			}
			// update device
			if (msg.type === 'event') {
				if(this.listenDevices.find(x=> x.device === msg.payload.name)){
					this.updateListenDevice(msg.payload.name, msg.payload.changed);
				}
			}
		}
	}

	// device updater
	// update fhem devices and look for listen device
	// only update devices, that FhemNative listens to
	public updateListenDevice(deviceName: string, change: any): void{
		const index: number = this.devices.findIndex(x=> x.device === deviceName);
		if(index === -1) return;

		change = this.objResolver(change, 2);
		for (const key in this.devices[index].readings) {
			if (key in this.devices[index].readings) {
				// STATE exception
				if(change.STATE) {
					const val = change.STATE;
					this.devices[index].readings['state'].Value = val;
					this.devices[index].readings['state'].Time = new Date;
				}
				if (change[key] !== undefined) {
					const val = change[key];
					this.devices[index].readings[key].Value = val;
					this.devices[index].readings[key].Time = new Date;
				}
			}
		}
		this.deviceUpdateSub.next(this.devices[index]);
	} 

	public deviceExists(deviceName: string, readingName: string): FhemDevice|undefined{
		if(readingName.split(' ').join('') !== '') return this.devices.find(x=> x.device === deviceName && x.readings[readingName] !== undefined);
		// only device is relevant
		return this.devices.find(x=> x.device === deviceName);
	}

	public getDevice(componentUID: string, deviceName: string, readingName: string, deviceUpdateCb: (fhemdevice: FhemDevice) => void, preventListening?: boolean): Observable<FhemDevice|null>{
		// add device listener list
		if(!preventListening) this.addListenDevice(componentUID, deviceName, deviceUpdateCb);

		if(!this.deviceRequestCombiner){
			this.deviceRequestCombiner = new ReplaySubject();
			this.deviceGetter = this.deviceRequestCombiner.pipe(
				takeUntil( timer(50).pipe( take(1) ) ),
				// build unique array of device and reading
				// important for requests, where device is already in app, but new reading was requested, that wasn´t present in device before
				distinct(x=> x.deviceName + x.readingName), toArray(),
				// get list of non existing devices
				map(deviceReadingArr=> deviceReadingArr.filter(x=> !this.deviceExists(x.deviceName, x.readingName) )),
				// get unique device name list for request
				map(deviceReadingArr=> [...new Set( deviceReadingArr.map(x=> x.deviceName) )] ),
				// request devices, if needed
				tap((requestArr)=> {
					if(!requestArr.length) return;

					// send request
					const type = this.getCurrentConnectionProfile().type;
					const deviceList = requestArr.length > 1 ? '('+requestArr.join('|')+')' : requestArr.join();

					if(type === 'fhemweb') this.sendCommand({ command: `jsonlist2 ${deviceList}` });
					if(type === 'websocket') this.sendCommand({ command: 'list', arg: deviceList });

					// reset request combiner
					this.deviceRequestCombiner = null;
				}),
				// check if request was send 
				// return relevant stream
				switchMap(requestArr=> requestArr.length ? this.deviceGetSub : of(null) ),
				share()
			);
		}
		this.deviceRequestCombiner.next({deviceName, readingName});

		// create timeout merge 
		// - Case 1: getDevice request includes valid devices --> deviceGetter return filtered devices or timeout
		// - Case 2: getDevice request includes no valid devices --> no deviceGetter response --> trigger merge timeout
		return merge(
			this.deviceGetter.pipe(
				switchMap(x=>{
					// no request send --> grap local device
					if(!x) return of( this.deviceExists(deviceName, '') || null );
					
					// check if device and reading exists
					// wait for response on no match
					// switchmap might receive deviceGetSub, but not all devices are in requestList
						// Exp. copy of multiple components, where some need request from server and others are already fully defined
						// occours on copy of multiple components with missing reading in one/some of them
					const relDevice = this.deviceExists(deviceName, readingName);
					if(relDevice){
						// listen to device changes for type of websocket
						const type = this.getCurrentConnectionProfile().type;
						if(type === 'websocket') this.sendCommand({
							type: '.*',
							changed: '.*',
							command: 'subscribe',
							arg: relDevice.id, 
							name: relDevice.device
						});
						
						return of(relDevice);
					}
					
					return concat(
						of(x).pipe( filter(x=> x.device === deviceName) ),
						of(null).pipe( delay(5_000) )
					);
				}),
				take(1)
			),
			of(null).pipe( delay(5_000) ),
		).pipe( take(1) );
	}

	// remove device from listener list
	public removeDevice(componentUID: string): void{
		const index = this.listenDevices.findIndex(x=> x.id === componentUID);
		if(index > -1) this.listenDevices.splice(index, 1);
	}

	protected addListenDevice(componentUID: string, deviceName: string, deviceUpdateCb: (fhemdevice: FhemDevice) => void): void{
		const device = this.listenDevices.find(x=> x.id === componentUID);
		if(device){
			// update 
			device.device = deviceName;
			device.handler = deviceUpdateCb;
		}else{
			this.listenDevices.push({id: componentUID, device: deviceName, handler: deviceUpdateCb});
		}
	}

	// device listener
	// add the device to listen list and call callback, if needed
	public sendCommand(cmd: any): void{
		const type = this.getCurrentConnectionProfile().type;

		if(!this.socket) return;
		if (type === 'websocket') this.socket.next(JSON.stringify({ type: 'command', payload: cmd }));
		if (type === 'fhemweb') this.socket.next(cmd.command);
	}

	// set command
	public set(device: string, value: any): void {
		this.sendCommand({ command: 'set ' + device + ' ' + value });
	}

	// set reading
	public setReading(device: string, reading: string, value: any): void {
		this.sendCommand({ command: 'setReading ' + device + ' ' + reading + ' ' + value });
	}

	// set attr
	public setAttr(device: string, prop: string, value: any): void {
		this.sendCommand({ command: 'set ' + device + ' ' + prop + ' ' + value });
	}

	// device transformer
	// determines already found devices and creates unique standard
	private deviceTransformer(device: any, capital: boolean): FhemDevice{
		const deviceName: string = capital ? device.Name : device.name;
		const readings = this.objResolver( (capital ? device.Readings : device.readings), 1);
		const push: FhemDevice = {
			id: capital ? device.Internals.NR : device.internals.NR,
			device: deviceName,
			readings: readings,
			internals: capital ? device.Internals : device.internals,
			attributes: capital ? device.Attributes : device.attributes
		};
		// determine, if device is already present
		const index: number = this.devices.findIndex(x => x.device === deviceName);
		if(index > -1){
			// device already found
			this.devices[index].readings = readings;
		}else{
			// new device
			this.devices.push(push);
		}
		return push;
	}

	// websocket reply transformer
	private objResolver(obj: any, level: number): any {
		const keys = Object.keys(obj);
		const result: any = {};
		// validate type of data
		function transformRaw(value: any): any{
			// transform string booleans
			if(value === 'true' || value === 'false' || IsJsonString(value)){
				// test for leading zero and containing string values
				const test = JSON.parse(value);
				if(value.toString() !== JSON.stringify(test)) return value;
				return JSON.parse(value)
			}
			// check for actual boolean
			if(typeof value === 'boolean') return value;
			// check for leading zeros and containing string values
			if(value.toString().substring(0, 1) === '0' || value.toString().match(/[a-zA-Z]/) ) return value;
			// check for numbers
			if(!isNaN(value)) return parseFloat(value);
			return value;
		}

		for (let i = 0; i < keys.length; i++) {
			const val = (level === 1 ? obj[keys[i]].Value : obj[keys[i]]);
			if (level === 1) {
				result[keys[i]] = {Value: '', Time: ''};
				result[keys[i]].Time = obj[keys[i]].Time;
				result[keys[i]].Value = transformRaw(val);
			} else {
				result[keys[i]] = transformRaw(val);
			}
		}
		return result;
	}

	/**
	 * Test for state values, true or false decisions
	 * @param device 
	 * @param reading 
	 * @param compareTo 
	 * @returns result of readign value check
	 */
	public deviceReadingActive(device: FhemDevice|null, reading: string, compareTo: any): boolean{
		if(device && device.readings[reading]){
			const value = device.readings[reading].Value.toString().toLowerCase();
			compareTo = compareTo.toString().toLowerCase();
			if(value === compareTo) return true;
		}
		return false;
	}

	/**
	 * Get shared config device 
	 * apply config on messages
	 */
	public initializeSharedConfig(): Promise<void>{
		return new Promise((resolve)=>{
			if(!this.settings.app.sharedConfig.enabled) return resolve();

			this.sharedConfigToaster('Try to load shared config', 'info');
				
			this.getDevice(
				this.sharedConfigUID,
				this.settings.app.sharedConfig.device,
				this.settings.app.sharedConfig.reading,
				(d)=> this.applySharedConfig(d)
			).pipe( take(1) ).subscribe({
				next: (d)=> {
					this.applySharedConfig(d),
					resolve();
				}
			});
		})
	}

	public removeSharedConfig(): void{
		this.removeDevice(this.sharedConfigUID);
	}

	public async getSharedConfig(): Promise<SharedConfig> {
		if(this.structure.rooms.length == 0) await this.structure.loadRooms();

		const compressedRooms = await this.structure.getCompressedRooms();
		return {
			versionCode: getRawVersionCode(this.appConfig.versionCode),
            rooms: compressedRooms
		}
	}

	public async updateSharedConfig(): Promise<void>{
		const sharedConf = this.structure.settings.app.sharedConfig;
		if(sharedConf.enabled && sharedConf.device !== '' && sharedConf.reading !== ''){
			const sharedConfig = await this.getSharedConfig();

            this.setAttr(sharedConf.device, sharedConf.reading, JSON.stringify(sharedConfig));
		}
	}

	public validateSharedConfig(testObj: any): boolean{
		// test for valid object
		if(typeof testObj !== 'object' || Array.isArray(testObj) || testObj === null) return false;
		// test config
		if(!('versionCode' in testObj)) return false;
		if(!('rooms' in testObj)) return false;
		if(testObj.rooms.length === 0) return false;

		return true;
	}

	/**
	 * initialize/update shared config based on incoming server messages
	 * @param device 
	 */
	private async applySharedConfig(device: FhemDevice|null): Promise<void>{
		if(!device || !device.readings[this.settings.app.sharedConfig.reading]) return;

		const testConfig = device.readings[this.settings.app.sharedConfig.reading].Value;
		if(!this.validateSharedConfig(testConfig)) return this.sharedConfigToaster('Received invalid shared config', 'error');

		this.sharedConfigToaster('Received valid shared config', 'success');
		
		const relevantConfig: SharedConfig = testConfig;
		this.structure.rooms = relevantConfig.rooms;

		if(!this.structure.currentRoom){
			this.structure.currentRoom = this.structure.rooms[0];
		}else{
			// check if current room still exists
			const foundRoom = this.structure.rooms.find(x=> x.UID === this.structure.currentRoom?.UID);

			// room does not exist --> change to initial room
			if(!foundRoom) return this.structure.changeRoom(this.structure.rooms[0]);

			// room exists --> update components in room
			// get container
			const containerRegistry = this.compLoader.getContainerRegistry(foundRoom.UID);
			if(containerRegistry){
				const compUIDs = containerRegistry.components.map(x=> x.componentUID);
				for(const compUID of compUIDs){
					// get relevant component
					const component = this.structure.getComponent(compUID);
					if(!component) continue;

					// remove selected components from view
					const componentRegistry = this.compLoader.getComponentFromRegistry(component.UID);
					if(!componentRegistry) continue;

					this.compLoader.destroyComponent(componentRegistry);
				}

				// load container components
				this.compLoader.loadContainerComponents(foundRoom.components, containerRegistry);
			}
		}
		// overwrite rooms with shared config
		await this.structure.saveRooms();
	}
}