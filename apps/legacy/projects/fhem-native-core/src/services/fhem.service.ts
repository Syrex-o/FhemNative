import { Injectable, NgZone } from '@angular/core';

// websocket 
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, Subscription } from 'rxjs';

// Services
import { ToastService } from './toast.service';
import { SettingsService } from './settings.service';
import { StructureService } from './structure.service';
import { LoggerService } from './logger/logger.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

// Interfaces
import { FhemDevice, Room, ComponentInStructure } from '../interfaces/interfaces.type';

interface ListenDevice {
	id: string,
	device: string,
	handler?: any
}

@Injectable({providedIn: 'root'})
export class FhemService {
	// fhem connection state
	public connectedSub = new Subject<boolean>();
	public connected: boolean = false;
	// shared config presence
	public sharedConfigPresence: any = {
		devicePresent: false,
		readingPresent: false
	};
	// device subscriptions
	public deviceListSub = new Subject<any>();
	public deviceUpdateSub = new Subject<any>();
	// public deviceGetSub = new Subject<any>();
	public sharedConfigUpdateSub = new Subject<any>();

	// Fhem device list
	public devices: Array<FhemDevice> = [];
	// list of devices to listen for changes
	public listenDevices: Array<ListenDevice> = [];

	// connection
	private socket$!: WebSocketSubject<any>;
	private awaitConnectionTimeout: any;
	private reconnectTimeout: any;
	// current connection profile
	// initial -1 to add
	private currentProfile: number = -1;

	// connection tries
	public tries: number = 0;
	private maxTries: number = 10;

	// no Reconnect
	public noReconnect: boolean = false;
	public connectionInProgress: boolean = false;

	constructor(
		private zone: NgZone,
		private toast: ToastService,
		private logger: LoggerService,
		private settings: SettingsService,
		private structure: StructureService,
		private translate: TranslateService) {
		// connection subscription
		this.connectedSub.subscribe((next: boolean) => { this.connected = next;});
		// device update subscription
		this.deviceUpdateSub.subscribe((device: FhemDevice)=>{ this.handleDeviceUpdate(device)});
	}

	// handle fhem device update
	private timerRuns: boolean = false;
	private toasterDevices: string[] = [];
	private handleDeviceUpdate(fhemDevice: FhemDevice): void {
		// inform logger
		this.logger.info('Value update received for: ' + fhemDevice.device);
		// match handles
		this.zone.run(()=>{
			this.listenDevices.forEach((listenDevice: ListenDevice)=>{
				if(listenDevice.device === fhemDevice.device && listenDevice.handler){
					listenDevice.handler(fhemDevice);
				}
				// check for shared config device
				if(listenDevice.device === fhemDevice.device && listenDevice.id === 'SHARED_CONFIG_DEVICE'){
					this.sharedConfigPresence.device = true;
					// check if reading was updated
					const relReading: string = this.settings.app.sharedConfig.reading;
					if(relReading in fhemDevice.readings){
						this.sharedConfigPresence.reading = true;
						const rooms: Room[] = fhemDevice.readings[relReading].Value;
						// validation of structure
						if(rooms[0] && 'ID' in rooms[0] && 'components' in rooms[0]){
							this.sharedConfigUpdateSub.next(rooms);
						}
					}
				}
			});
		});
		// inform abaout device update
		if (!this.toasterDevices.includes(fhemDevice.device)) {
			this.toasterDevices.push(fhemDevice.device);
			if (!this.timerRuns) {
				this.timerRuns = true;
				setTimeout(() => {
					if (this.toasterDevices.length > 0) {
						this.toast.addToast(
							this.translate.instant('GENERAL.FHEM.TITLE'),
							this.translate.instant('GENERAL.FHEM.DEVICE_UPDATE') + this.toasterDevices.join(', '),
							'info'
						);
					}
					this.toasterDevices = [];
					this.timerRuns = false;
				}, 300);
			}
		}
	}

	// seperate component devices into array
	// needs string of data_device
	public seperateDevices(device: string): string[]{
		return device.toString().replace(/\s/g, '').split(',');
	}

	// get the connection type
	public connectionType(): string{
		// currentProfile might be -1 due to timings
		if(this.currentProfile === -1){
			this.currentProfile = 0;
		}
		return this.settings.connectionProfiles[this.currentProfile].type.toLowerCase();
	}

	// get url for connection
	private getConnectionURL(): string{
		let url: string;
		// get the desired url for fhem connection
		const type: string = this.connectionType();
		// different websocket types
		if(type.match(/websocket|fhemweb/)){
			url = (this.settings.connectionProfiles[this.currentProfile].WSS ? 'wss://' : 'ws://') + 
				(this.settings.connectionProfiles[this.currentProfile].basicAuth ? this.settings.connectionProfiles[this.currentProfile].USER + ':' + this.settings.connectionProfiles[this.currentProfile].PASSW + '@' : '' ) + 
				this.settings.connectionProfiles[this.currentProfile].IP + ':' + this.settings.connectionProfiles[this.currentProfile].PORT;

			return ( type === 'websocket' ? url : url + '?XHR=1&inform=type=status;filter=.*;fmt=JSON' + '&timestamp=' + Date.now() )
		}
		return '';
	}

	// connect to FHEM
	public connectFhem(): void{
		if(!this.noReconnect && !this.connected && !this.connectionInProgress){
			this.connectionInProgress = true;
			// get profile
			this.currentProfile = this.settings.connectionProfiles[this.currentProfile + 1] ? this.currentProfile + 1 : 0;
			// build connection
			this.logger.info('Start connecting to Fhem');
			this.tries ++;
			this.logger.info('Connection try: ' + this.tries);
			this.logger.info('Try connecting with profile:  ' + this.currentProfile);
			// clearing device lists
			this.devices = [];
			// get url
			const url: string = this.getConnectionURL();
			const type: string = this.connectionType();
			if(['websocket', 'fhemweb'].includes(type)){
				// build socket
				this.socket$ = webSocket({
					url: url,
					protocol: type === 'websocket' ? 'json' : '',
					serializer: v => v as ArrayBuffer,
					deserializer: v=> v,
					openObserver: {
						next: () => { this.connectionOpenHandler(); }
					}
				});
				// build handler
				this.socket$.asObservable().subscribe(
					// message
					data => this.handleWebsocketEvents(data),
					// error
					error => this.connectionErrorHandler(error),
					// closed
					() => this.connectionCloseHandler()
				);

				// timeout
				if(this.awaitConnectionTimeout) clearTimeout(this.awaitConnectionTimeout);
				this.awaitConnectionTimeout = setTimeout(()=>{
					if(!this.connected){
						// profile timeout
						this.logger.info('Connection timeout for profile: ' + this.currentProfile);
						this.toast.addToast(
							this.translate.instant('GENERAL.FHEM.TITLE'), 
							'Profile: ' + this.currentProfile + ' ' + this.translate.instant('GENERAL.FHEM.TIMEOUT'), 
							'error'
						);
						this.socket$.complete();
						this.connectionCloseHandler();
					}
				}, 1000);
			}
		}
	}

	// handle connection open
	private connectionOpenHandler(): void{
		// open event handling
		this.connectedSub.next(true);
		// inform logger
		this.logger.info('Connected to Fhem');
		// reset blockers
		this.connectionInProgress = false;
		this.tries = 0;
		// check open listen devices
		this.listenDevices.forEach((listenDevice: ListenDevice)=>{
			this.getDevice(listenDevice.id, listenDevice.device, false, true).then((device: FhemDevice|null)=>{
				if(device) this.deviceUpdateSub.next(device);
			});
		});
		// get relevant devices
		this.listDevices(this.getRelevantDevices());
		// show success connection message
		this.toast.addToast(
			this.translate.instant('GENERAL.FHEM.TITLE'),
			this.translate.instant('GENERAL.FHEM.CONNECTED'),
			'success'
		);
		// check for shared config enablement
		if('sharedConfig' in this.settings.app && this.settings.app.sharedConfig.enable){
			// add shared config device to listen devices
			if(this.settings.app.sharedConfig.device !== ''){
				if(!this.listenDevices.find(x=> x.id === 'SHARED_CONFIG_DEVICE')){
					this.listenDevices.push({id: 'SHARED_CONFIG_DEVICE', device: this.settings.app.sharedConfig.device, handler: null});
				}
				// initially send request to get shared config
				this.getDevice('SHARED_CONFIG_DEVICE', this.settings.app.sharedConfig.device, false, true).then((device: FhemDevice|null)=>{
					this.deviceUpdateSub.next(device);
				});
			}
			this.toast.addToast(
				this.translate.instant('GENERAL.CONFIG.TITLE'),
				this.translate.instant('GENERAL.CONFIG.TRY_SHARED_CONFIG'),
				'info'
			);
		}
	}

	// handle connection close
	private connectionCloseHandler(): void {
		// inform logger
		this.logger.info('Fhem connection closed');
		clearTimeout(this.awaitConnectionTimeout);
		this.connectedSub.next(false);
		// reconnect try
		if(this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
		if(!this.noReconnect){
			this.connectionInProgress = false;
			// profile tries
			if(this.tries <= this.maxTries){
				// short timeouts in tries
				this.reconnectTimeout = setTimeout(()=>{
					this.connectFhem();
				}, 500);
			}else{
				this.tries = 0;
				this.toast.addToast(
					this.translate.instant('GENERAL.FHEM.TITLE'),
					this.translate.instant('GENERAL.FHEM.RETRY'),
					'info',
					5000
				);
				// longer timeout
				this.reconnectTimeout = setTimeout(()=>{
					this.connectFhem();
				}, 5000);
			}
		}
	}

	// handle connection error
	private connectionErrorHandler(e: any): void {
		// inform logger
		this.logger.error('An error occured during the connection process');
		this.logger.error('Connection could not be established. Please check the URL carefully.');
		this.logger.error(e);
	}

	// disconnect
	public disconnect(keepDevices?: boolean): void {
		if(this.socket$){
			this.socket$.complete();
			this.connectedSub.next(false);
			this.connectionInProgress = false;
			if(!keepDevices){
				this.devices = [];
				this.listenDevices = [];
			}
			this.currentProfile = -1;
			this.toast.addToast(
				this.translate.instant('GENERAL.FHEM.TITLE'),
				this.translate.instant('GENERAL.FHEM.DISCONNECT'),
				'error'
			);
		}
	}

	// reconnect
	public reconnect(): void {
		this.disconnect(true);
		this.connectFhem();
	}

	// get the list of relevant devices
	private getRelevantDevices(): string{
		let list: string[] = [];
		// loop rooms for components
		this.structure.getAllComponents().forEach((item: ComponentInStructure)=>{
			// check for devices in components
			if(item.component && item.component.attributes.attr_data && item.component.attributes.attr_data.find(x=> x.attr === 'data_device')){
				// device is present in component
				const relAttr: any = item.component.attributes.attr_data || [];
				if(relAttr){
					const devices: string[] = this.seperateDevices(relAttr.find((x: any) => x.attr === 'data_device').value);
					devices.forEach((device: string)=>{
						// check if device is already in list
						if(!list.includes(device)){
							list.push(device);
						}
					});
				}
			}
		});
		return list.length > 0 ? '('+list.join('|')+')' : '';
	}

	// webSocket event handler
	private handleWebsocketEvents(e: MessageEvent): void{
		const type: string = this.connectionType();
		// list of catched devices
		let listDevices: Array<FhemDevice> = [];
		// get message
		let msg = e.data;
		// handle external websocket
		if (type === 'websocket') {
			msg = JSON.parse(msg);
			if (msg.type === 'listentry') {
				if(msg.payload.attributes){
					listDevices.push(this.deviceTransformer(msg.payload, false));
					if(msg.payload.num === listDevices.length){
						this.deviceListSub.next(listDevices);
						listDevices = [];
					}
				}
			}
			if (msg.type === 'event') {
				// device update
				if(this.listenDevices.find(x=> x.device === msg.payload.name)){
					// device is in listen list
					this.updateListenDevice(msg.payload.name, msg.payload.changed);
				}
			}
		}
		// handle fhemweb
		if (type === 'fhemweb') {
			const lines: string[] = msg.split(/\n/).filter((s: string) => s !== '' && s !== '[""]');
			if (lines.length > 0) {
				// evaluation for: get all devices
				if (lines.length === 1) {
					msg = JSON.parse(msg);
					if (this.IsJsonString(msg)) {
						// normal reply
						msg = JSON.parse(msg);
						// keep track of new devices
						listDevices = [];
						msg.Results.forEach((result:any)=>{
							listDevices.push(this.deviceTransformer(result, true));
						});
						this.deviceListSub.next(listDevices);
					}
				}else{
					// evaluation of changes
					// device got an update
					const device: string = JSON.parse(lines[0])[0];
					const change: any = {};
					if(this.listenDevices.find(x=> x.device === device)){
						// listen to device
						for (let i = 1; i < lines.length; i += 2) {
							const prop = JSON.parse(lines[i])[0].match(/([^-]+(?=))$/)[0];
							const value = JSON.parse(lines[i])[1];
							change[prop] = value;
						}
						this.updateListenDevice(device, change);
					}
				}
			}
		}
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

	// device updater
	// update fhem devices and look for listen device
	// only update devices, that FhemNative listens to
	public updateListenDevice(deviceName: string, change: any): void{
		const index: number = this.devices.findIndex(x=> x.device === deviceName);
		if(index > -1){
			change = this.objResolver(change, 2);
			for (const key in this.devices[index].readings) {
				if (this.devices[index].readings.hasOwnProperty(key)) {
					// STATE exception
					if(change.STATE) {
						const val = change.STATE;
						this.devices[index].readings.state.Value = val;
						this.devices[index].readings.state.Time = new Date;
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
	}

	// get device from fhem
	// dirty allows to send fhem device list command even, if device is already present
	public getDevice(id: string, deviceName: string, callback?: any, dirty?: boolean): Promise<FhemDevice|null>{
		return new Promise((resolve) => {
			// check device presence
			if(deviceName && deviceName !== ''){
				if(!this.connected){
					let gotReply: boolean = false;
					// wait for connection
					const sub = this.connectedSub.subscribe((state: boolean)=>{
						gotReply = true;
						if(state){
							sub.unsubscribe();
							this.listen(id, deviceName, callback, dirty).then((device: FhemDevice|null)=> resolve(device));
						}else{
							if(this.noReconnect){
								sub.unsubscribe();
								resolve(null);
							}
						}
					});
					setTimeout(()=>{
						if(!gotReply){
							sub.unsubscribe();
							resolve(null);
						}
					}, 5000);
				}else{
					this.listen(id, deviceName, callback, dirty).then((device: FhemDevice|null)=> resolve(device));
				}
			}else{
				resolve(null);
			}
		});
	}

	// list for device requests --> send multiple devices at once, to reduce calls
	private askForDevices: string[] = [];
	// device listener
	// add the device to listen list and call callback, if needed
	public listen(id: string, deviceName: string, callback?: any, dirty?: boolean): Promise<FhemDevice|null>{
		return new Promise((resolve)=>{
			// connection type
			const type = this.connectionType();
			// handle subscriptions
			let subscribeHandler = ()=>{
				let newListendevice: boolean = false;
				if(!this.listenDevices.find(x => x.id === id)){
					newListendevice = true;
					this.listenDevices.push({id: id, device: deviceName, handler: callback});
				}
				if(type === 'websocket' && device){
					// allow new dirty sub for reconnect, to keep device list
					if(newListendevice || dirty){
						this.sendCommand({command: 'subscribe', arg: device.id, type: '.*', name: deviceName, changed: '.*'});
					}
				}
			}

			// search for device in existing list
			let device: FhemDevice|undefined = this.devices.find(x => x.device === deviceName);
			if(device && !dirty){
				subscribeHandler();
				resolve(device);
			}else{
				// push to ask list
				if(deviceName && !this.askForDevices.includes(deviceName)){
					this.askForDevices.push(deviceName);
				}
				// list device handler
				// determine if device was found
				let gotReply: boolean = false;
				const sub = this.deviceListSub.subscribe((next: FhemDevice[])=>{
					device = next.find(x => x.device === deviceName);
					if(device){
						gotReply = true;
						sub.unsubscribe();
						subscribeHandler();
						resolve(device);
					}
				});
				setTimeout(()=>{
					if(!gotReply){
						sub.unsubscribe();
						// no reply --> no device found
						resolve(null);
					}
				}, 1000);
				// prevent multiple calls
				// send just one request for all getDevice requests
				setTimeout(()=>{
					if(this.askForDevices.length > 0){
						// build copy
						let deviceList: string[]|string = this.askForDevices;
						// reset ask array
						this.askForDevices = [];

						// build request array
						deviceList = deviceList.length > 1 ? '('+deviceList.join('|')+')' : deviceList.join();

						// send list command, to get device
						if (type === 'fhemweb') {
							this.sendCommand({command: 'jsonlist2 ' + deviceList});
						}
						if(type === 'websocket'){
							this.sendCommand({command: 'list', arg: deviceList});
						}
					}
				}, 50);
			}
		});
	}

	// get command
	public get(device: string, property: any): Promise<any>{
		return new Promise((resolve)=>{
			if(!this.connected){
				let gotReply: boolean = false;
				// wait for connection
				const sub = this.connectedSub.subscribe((state: boolean)=>{
					gotReply = true;
					if(state){
						sub.unsubscribe();
						this.sendSingleGetRequest(device, property).then((result: any)=> resolve(result));
					}else{
						if(this.noReconnect){
							sub.unsubscribe();
							resolve(null);
						}
					}
				});
				setTimeout(()=>{
					if(!gotReply){
						sub.unsubscribe();
						resolve(null);
					}
				}, 5000);
			}else{
				this.sendSingleGetRequest(device, property).then((result: any)=> resolve(result));
			}
		});
	}

	// build single connection for 
	public sendSingleGetRequest(device: string, property: any): Promise<any>{
		return new Promise((resolve)=>{
			// get url
			const url: string = this.getConnectionURL();
			// get the desired url for fhem connection
			const type: string = this.connectionType();
			// connected
			let getReceived: boolean = false;
			if(type.match(/websocket|fhemweb/)){
				const partialConnection = type === 'websocket' ? new WebSocket(url, ['json']) : new WebSocket(url);
				// timeout
				const timeout = setTimeout(()=>{
					if(!getReceived){
						partialConnection.close();
						resolve(null);
					}
				}, 1500);

				// connected
				partialConnection.onopen = (e)=>{
					// partial connection established
					// listen for message
					const message = partialConnection.onmessage = (e)=>{
						let msg = e.data;
						// handle external websocket
						if (type === 'websocket') {
							msg = JSON.parse(msg);

							if(msg.payload.value){
								getReceived = true;

								const splitText = msg.payload.value.split(/\r\n|\r|\n/).length;
								let value = [];
								for (let i = 0; i < splitText; i++) {
									const line = msg.payload.value.split(/\r\n|\r|\n/)[i];
									if (line !== '') {
										value.push(line);
									}
								}
								partialConnection.close();
								resolve(value);
							}else{
								resolve(null);
							}
						}else{
							// fhemweb
							let lines: string[] = msg.split(/\n/).filter((s: string) => s !== '' && s !== '[""]');
							if (lines.length === 1) {
								msg = JSON.parse(msg);

								getReceived = true;
								const splitText = msg[0].split(/\r\n|\r|\n/).length;
								let value = [];
								for (let i = 0; i < splitText; i++) {
									const line = msg[0].split(/\r\n|\r|\n/)[i];
									if (line !== '') {
										value.push(line);
									}
								}
								partialConnection.close();
								resolve(value);
							}
						}
					}
					// send request
					if (type === 'websocket') {
						partialConnection.send(JSON.stringify({
							type: 'command',
							payload: {command: 'get', device, property}
						}));
					}else{
						partialConnection.send('get ' + device + ' ' + property);
					}
				}
			}
		});
	}

	// remove device and stop listen, if no other listener for same device is present
	public removeDevice(id: string): void{
		const index = this.listenDevices.findIndex(x=> x.id === id);
		if(index > -1){
			this.listenDevices.splice(index, 1);
		}
	}

	// look for device and subscribe to changes
	public deviceReadingFinder(deviceName: string, reading: string|null): boolean{
		const device = this.devices.find(x => x.device === deviceName);
		return (
			// check for device
			device ? (
				// check if reading is used
				!reading && reading !== '' ? true : (
					// reading is used and has to be checked
					device.readings[reading] ? true : false
				)
			) : false
		);
	}

	// send commands
	public sendCommand(cmd: any): void{
		const type = this.connectionType();
		if (type === 'websocket') {
			this.socket$.next(JSON.stringify({
				type: 'command',
				payload: cmd
			}));
		}
		if (type === 'fhemweb') {
			this.socket$.next(cmd.command);
		}
	}

	// set
	public set(device: string, value: any): void {
		this.sendCommand({
			command: 'set ' + device + ' ' + value
		});
	}

	// set reading
	public setReading(device: string, reading: string, value: any): void {
		this.sendCommand({
			command: 'setReading ' + device + ' ' + reading + ' ' + value
		});
	}
	// set attr
	public setAttr(device: string, prop: string, value: any): void {
		this.sendCommand({
			command: 'set ' + device + ' ' + prop + ' ' + value
		});
	}


	// send list command to fhem for relevant connection type
	private listTrials: number = 0;
	public listDevices(value: string): void{
		if(this.socket$['_socket'].readyState === 1) {
			this.listTrials = 0;
			const type: string = this.connectionType();
			this.socket$.next( 
				type === 'websocket' ? 
					JSON.stringify({type: 'command', payload: {command: 'list', arg: value}}) :
					'jsonlist2 '+ value
			);
		}else{
			if(this.listTrials <= 2){
				this.listTrials ++;
				setTimeout(()=>{ this.listDevices(value); }, 100);
			}
		}
	}

	// handle single request and respond with device if found
	public handleSimpleDeviceRequest(device: string, timeout?: number): Promise<FhemDevice|null> {
		return new Promise((resolve)=>{
			const foundDevice: FhemDevice|null|undefined = this.devices.find(x=> x.device === device);
			if(foundDevice){
				resolve(foundDevice);
			}else{
				// send sinple device request
				let gotReply: boolean = false;
				const sub: Subscription = this.deviceListSub.subscribe((device: FhemDevice[])=>{
					gotReply = true;
					sub.unsubscribe();
					resolve((device ? device[0] : null));
				});
				// timeout time
				let t: number = timeout || 1000;
				setTimeout(()=>{
					if(!gotReply){
						sub.unsubscribe();
						resolve(null);
					}
				}, t);
				this.listDevices(device);
			}
		});
	}

	// test for json
	public IsJsonString(str: any): boolean {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	// test for state values, true or false decisions
	public deviceReadingActive(device: FhemDevice|null, reading: string, compareTo: any): boolean{
		if(device && device.readings[reading]){
			const value = device.readings[reading].Value.toString().toLowerCase();
			compareTo = compareTo.toString().toLowerCase();
			if(value === compareTo){
				return true;
			}
		}
		return false;
	}

	// websocket reply transformer
	public objResolver(obj: any, level: number): any {
		const keys = Object.keys(obj);
		const result: any = {};
		// validate type of data
		let transformRaw = (value: any)=>{
			// transform string booleans
			if(value === 'true' || value === 'false' || this.IsJsonString(value)){
				// test for leading zero and containing string values
				let test = JSON.parse(value);
				if(value.toString() !== JSON.stringify(test)){
					return value;
				}
				return JSON.parse(value)
			}
			// check for actual boolean
			if(typeof value === 'boolean'){
				return value;
			}
			// check for leading zeros and containing string values
			if(value.toString().substring(0, 1) === '0' || value.toString().match(/[a-zA-Z]/) ){
				return value;
			}
			// check for numbers
			if(!isNaN(value)){
				return parseFloat(value);
			}
			return value;
		}
		for (let i = 0; i < keys.length; i++) {
			const val = (level === 1 ? obj[keys[i]].Value : obj[keys[i]]);
			if (level === 1) {
				result[keys[i]] = {Value: '', Time: ''};
				result[keys[i]].Time = obj[keys[i]].Time;
				result[keys[i]].Value = transformRaw(val);
				// (val === 'true' || val === 'false' || this.IsJsonString(val)) ? JSON.parse(val) : (typeof val === 'boolean') ? val : !isNaN(val) ? parseFloat(val) : val;
			} else {
				result[keys[i]] = transformRaw(val);
			}
		}
		return result;
	}
}