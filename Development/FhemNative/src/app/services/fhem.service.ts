import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

// Services
import { LoggerService } from './logger/logger.service';
import { SettingsService } from './settings.service';
import { StructureService } from './structure.service';
import { ToastService } from './toast.service';

// Translator
import { TranslateService } from '@ngx-translate/core';

interface FhemDevice {
	id: number,
	device: string,
	readings: any,
	internals: any,
	attributes: any
};

interface ListenDevice {
	id: string,
	device: string,
	handler?: any
}

@Injectable({
	providedIn: 'root'
})

export class FhemService {
	// fhem connection state
	public connectedSub = new Subject<boolean>();
	public connected: boolean = false;

	// device subscriptions
	public deviceListSub = new Subject<any>();
	public deviceUpdateSub = new Subject<any>();
	public deviceGetSub = new Subject<any>();

	// Fhem device list
	public devices: Array<FhemDevice> = [];
	// list of devices to listen for changes
	public listenDevices: Array<ListenDevice> = [];

	// connection 
	private socket: any;
	// current connection profile
	// initial -1 to add
	private currentProfile: number = -1;

	// connection tries
	private tries: number = 0;
	private reTries: number = 0;
	private maxTries: number = 10;
	private maxRetires: number = 3;

	// no Reconnect
	public noReconnect: boolean = false;
	private connectionInProgress: boolean = false;

	constructor(
		private logger: LoggerService,
		private settings: SettingsService,
		private structure: StructureService,
		private toast: ToastService,
		private zone: NgZone,
		private translate: TranslateService) {
		// connection subscription
		this.connectedSub.subscribe((next: boolean) => {
			// update the connection state
			this.connected = next;
		});
		// device update subscription
		this.deviceUpdateSub.subscribe((device: FhemDevice)=>{
			// inform logger
			this.logger.info('Value update received for: ' + device.device);
			// match handles
			this.listenDevices.forEach((listenDevice: ListenDevice)=>{
				if(listenDevice.device === device.device && listenDevice.handler){
					listenDevice.handler(device);
				}
			});
			// inform abaout device update
			let timerRuns = false;
			let toasterDevices: string[] = [];
			if (!toasterDevices.includes(device.device)) {
				toasterDevices.push(device.device);
				if (!timerRuns) {
	      			timerRuns = true;
	      			setTimeout(() => {
	      				if (toasterDevices.length > 0) {
	      					this.toast.addToast(
	      						this.translate.instant('GENERAL.FHEM.TITLE'),
	      						this.translate.instant('GENERAL.FHEM.DEVICE_UPDATE') + toasterDevices.join(', '),
	      						'info'
	      					);
	      				}
	      				toasterDevices = [];
	      				timerRuns = false;
	      			}, 300);
	      		}
			}
		});
	}

	// seperate component devices into array
	// needs string of data_device
	public seperateDevices(device){
		return device.replace(/\s/g, '').split(',');
	}

	// get the connection type
	private connectionType(){
		return this.settings.connectionProfiles[this.currentProfile].type.toLowerCase();
	}

	public connectFhem(){
		this.devices = [];
		if(!this.noReconnect && !this.connected && !this.connectionInProgress){
			this.connectionInProgress = true;
			// check profile
			if(this.settings.connectionProfiles[this.currentProfile + 1]){
				this.currentProfile++;
			}else{
				this.currentProfile = 0;
			}
			// build connection
			this.logger.info('Start connecting to Fhem');
			this.tries ++;
			this.logger.info('Connection try: ' + this.tries);
			this.logger.info('Try connecting with profile:  ' + this.currentProfile);
			// clearing device lists
			this.devices = [];
			let url;
			// get the desired url for fhem connection
			const type = this.connectionType();
			
			if(type.match(/websocket|fhemweb/)){
				url = (this.settings.connectionProfiles[this.currentProfile].WSS ? 'wss://' : 'ws://') + 
				(this.settings.connectionProfiles[this.currentProfile].basicAuth ? this.settings.connectionProfiles[this.currentProfile].USER + ':' + this.settings.connectionProfiles[this.currentProfile].PASSW + '@' : '' ) + 
				this.settings.connectionProfiles[this.currentProfile].IP + ':' + this.settings.connectionProfiles[this.currentProfile].PORT;

				this.socket = type === 'websocket' ? new WebSocket(url, ['json']) : new WebSocket(url + '?XHR=1&inform=type=status;filter=.*;fmt=JSON' + '&timestamp=' + Date.now())
			}

			if (type.match(/websocket|fhemweb/)) {
				// timeout
				const timeout = setTimeout(()=>{
					if(!this.connected){
						// profile timeout
						this.logger.info('Connection timeout for profile: ' + this.currentProfile);
						this.toast.addToast(
							this.translate.instant('GENERAL.FHEM.TITLE'), 
							'Profile: ' + this.currentProfile + ' ' + this.translate.instant('GENERAL.FHEM.TIMEOUT'), 
							'error'
						);
						this.socket.close();
					}
				}, 1000);
				// open
				this.socket.onopen = (e)=>{
					this.connectionInProgress = false;
					this.tries = 0;
					this.reTries = 0;
					this.connectionOpenHandler();
					// check open listen devices
					if(this.listenDevices.length > 0){
						this.listenDevices.forEach((listenDevice: ListenDevice)=>{
							this.getDevice(listenDevice.id, listenDevice.device, false, true).then((device)=>{
								this.deviceUpdateSub.next(device);
							});
						});
					}
				}
				// close
				this.socket.onclose = (e) => {
					clearTimeout(timeout);
					this.connectedSub.next(false);
					setTimeout(()=>{
						if(this.tries <= this.maxTries){
							this.connectionInProgress = false;
							this.connectFhem();
						}else{
							this.reTries ++;
							if(this.reTries <= this.maxRetires){
								this.toast.addToast(
									this.translate.instant('GENERAL.FHEM.TITLE'), 
									'Maximum tries reached. Try to reconnect in 5 seconds',
									'error'
								);
								setTimeout(()=>{
									this.tries = 0;
									this.connectionInProgress = false;
									this.connectFhem();
								}, 5000);
							}else{
								// max retries reached, give up...
								this.toast.addToast(
									this.translate.instant('GENERAL.FHEM.TITLE'),
									'Maximum retries reached. Giving up...',
									'error'
								);
								this.noReconnect = true;
							}
						}
					}, 500);
				}
				// error
				this.socket.onerror = (e) => {
					this.logger.error('An Error occured during the connection process');
				}
			}
		}
		if(this.noReconnect){
			this.connectionInProgress = false;
			this.tries = 0;
			this.reTries = 0;
		}
	}

	// handle connection open
	private connectionOpenHandler(){
		this.logger.info('Connected to Fhem');
		this.connectedSub.next(true);
		// get relevant devices
		this.listDevices(this.getRelevantDevices());

		this.websocketEvents();
		this.toast.addToast(
			this.translate.instant('GENERAL.FHEM.TITLE'),
			this.translate.instant('GENERAL.FHEM.CONNECTED'),
			'success'
		);
	}

	// disconnect
	public disconnect() {
    	if(this.connected){
    		this.socket.close();
    		this.devices = [];
    		this.listenDevices = [];
    		this.toast.addToast(
				this.translate.instant('GENERAL.FHEM.TITLE'),
				this.translate.instant('GENERAL.FHEM.DISCONNECT'),
				'error'
			);
    	}
    }

	// get the list of relevant devices
	private getRelevantDevices(){
		let list: string[] = [];

    	if(this.settings.app.fhemDeviceLoader === 'Component'){
    		// loop rooms for components
	    	this.structure.getAllComponents().forEach((item)=>{
	    		// check for devices in components
	    		if(item.component && item.component.attributes.attr_data && item.component.attributes.attr_data.find(x=> x.attr === 'data_device')){
	    			// device is present in component
	    			const devices: string[] = this.seperateDevices(item.component.attributes.attr_data.find(x=> x.attr === 'data_device').value);
	    			devices.forEach((device: string)=>{
	    				// check if device is already in list
	    				if(!list.includes(device)){
	    					list.push(device);
	    				}
	    			});
	    		}
	    	});
	    	return list.length > 0 ? '('+list.join('|')+')' : '';
    	}else{
    		// all devices should be loaded
    		return '.*';
    	}
	}

	// websocket event handler
	// handle fhemweb and external websocket
	private websocketEvents(){
		const type: string = this.connectionType();
		// list of catched devices
    	let listDevices: Array<FhemDevice> = [];
    	const message = this.socket.onmessage = (e)=>{
    		// initial message
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
	    		if (msg.type === 'getreply') {
	    			// get command answer
	    			if(this.listenDevices.find(x=> x.device === msg.payload.device)){
	    				// format the reply, for easy use
	    				const device = msg.payload.device;
	    				// check if value received
	    				if(msg.payload.value){
	    					const splitText = msg.payload.value.split(/\r\n|\r|\n/).length;
		    				let value = [];
		    				for (let i = 0; i < splitText; i++) {
		    					const line = msg.payload.value.split(/\r\n|\r|\n/)[i];
	  							if (line !== '') {
	  								value.push(line);
	  							}
	  						}
	  						this.deviceGetSub.next({
	  							device: device,
	  							value: value
	  						});
	    				}
	    			}
	    		}
	    	}
	    	// handle fhemweb
	    	if (type === 'fhemweb') {
	    		let lines: string[] = msg.split(/\n/).filter(s => s !== '' && s !== '[""]');
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
		    			}else{
		    				// get reply
		    				const device = msg[0].split(/\r\n|\r|\n/)[0];
		    				const splitText = msg[0].split(/\r\n|\r|\n/).length;
	    					let value = [];
	    					for (let i = 0; i < splitText; i++) {
		    					const line = msg[0].split(/\r\n|\r|\n/)[i];
	  							if (line !== '') {
	  								value.push(line);
	  							}
	  						}
	  						this.deviceGetSub.next({
	  							device: device,
	  							value: value
	  						});
		    			}
	      			}else{
	      				// evaluation of changes
	      				// device got an update
	      				const device = JSON.parse(lines[0])[0];
	      				const change = {};
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
	}

	// device transformer
	// determines already found devices and creates unique standard
	private deviceTransformer(device: any, capital: boolean){
		const deviceName = capital ? device.Name : device.name;
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
	private updateListenDevice(deviceName: string, change: any){
		const index = this.devices.findIndex(x=> x.device === deviceName);
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
	public getDevice(id: string, deviceName: string, callback?: any, dirty?: boolean){
		return new Promise((resolve) => {
			if(!this.connected){
				let gotReply: boolean = false;
				// wait for connection
				const sub = this.connectedSub.subscribe((state: boolean)=>{
					gotReply = true;
					if(state){
						sub.unsubscribe();
						this.listen(id, deviceName, callback, dirty).then(device=> resolve(device));
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
				this.listen(id, deviceName, callback, dirty).then(device=> resolve(device));
			}
		});
	}

	// list for device requests --> send multiple devices at once, to reduce calls
	private askForDevices: string[] = [];
	// device listener
	// add the device to listen list and call callback, if needed
	public listen(id: string, deviceName: string, callback?: any, dirty?: boolean){
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
				if(type === 'websocket'){
					// allow new dirty sub for reconnect, to keep device list
					if(newListendevice || dirty){
						this.sendCommand({command: 'subscribe',arg: device.id,type: '.*',name,changed: ''});
					}
				}
			}

			// search for device in existing list
			let device = this.devices.find(x => x.device === deviceName);
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
				const sub = this.deviceListSub.subscribe((next)=>{
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
						let deviceList: any = this.askForDevices;
						// reset ask array
						this.askForDevices = [];

						// build request array
						deviceList = deviceList.length > 1 ? '('+deviceList.join('|')+')' : deviceList.join();

						// send list command, to get device
						if (type === 'fhemweb') {
							this.socket.send('jsonlist2 ' + deviceList);
						}
						if(type === 'websocket'){
							this.sendCommand({command: 'list', arg: deviceList});
						}
					}
				});
			}
		});
	}

	// remove device and stop listen, if no other listener for same device is present
	public removeDevice(id: string){
		const index = this.listenDevices.findIndex(x=> x.id === id);
		if(index > -1){
			this.listenDevices.splice(index, 1);
		}
	}

	// look for device and subscribe to changes
	public deviceReadingFinder(deviceName: string, reading: string|null){
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
	public sendCommand(cmd) {
    	const type = this.connectionType();
    	if (type === 'websocket') {
    		this.socket.send(JSON.stringify({
	            type: 'command',
	            payload: cmd
	        }));
    	}
    	if (type === 'fhemweb') {
    		this.socket.send(cmd.command);
    	}
    }

    // set
    public set(device, value) {
        this.sendCommand({
            command: 'set ' + device + ' ' + value
        });
    }

    // get
    public get(device, property) {
    	return new Promise((resolve)=>{
    		let gotReply: boolean = false;
    		// subscribe to get listener
    		const sub = this.deviceGetSub.subscribe((data)=>{
    			gotReply = true;
    			sub.unsubscribe();
    			// check if the reply is for the correct device
    			if(data.device === device){
    				resolve(data.value);
    			}
    		});
    		// check for reply
    		setTimeout(()=>{
				if(!gotReply){
					sub.unsubscribe();
					// no reply --> no device found
					resolve(null);
				}
			}, 1000);
    		// send get request
    		const type = this.connectionType();
	    	if (type === 'websocket') {
	    		this.sendCommand({
		            command: 'get',
		            device,
		            property
		        });
	    	}
	    	if (type === 'fhemweb') {
	    		this.sendCommand({
	    			command: 'get ' + device + ' ' + property
	    		});
	    	}
    	});
    }
    // set reading
    public setReading(device, reading, value) {
        this.sendCommand({
            command: 'setReading ' + device + ' ' + reading + ' ' + value
        });
    }
    // set attr
    public setAttr(device, prop, value) {
        this.sendCommand({
            command: 'set ' + device + ' ' + prop + ' ' + value
        });
    }


	// send list command to fhem for relevant connection type
	public listDevices(value: string){
		const type = this.connectionType();
		if (type === 'websocket') {
    		this.socket.send(JSON.stringify(
	    		{type: 'command', payload: {command: 'list', arg: value}}
	    	));
    	}
    	if (type === 'fhemweb') {
	    	this.socket.send('jsonlist2 '+ value);
	    }
	}

	// test for json
    public IsJsonString(str) {
    	try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
    }

    // test for state values, true or false decisions
    public deviceReadingActive(device, reading, compareTo){
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
    public objResolver(obj, level) {
		const keys = Object.keys(obj);
		const result = {};
		for (let i = 0; i < keys.length; i++) {
			const val = (level === 1 ? obj[keys[i]].Value : obj[keys[i]]);
			if (level === 1) {
				result[keys[i]] = {Value: '', Time: ''};
				result[keys[i]].Time = obj[keys[i]].Time;
				result[keys[i]].Value = (val === 'true' || val === 'false' || this.IsJsonString(val)) ? JSON.parse(val) : (typeof val === 'boolean') ? val : !isNaN(val) ? parseFloat(val) : val;
			} else {
				result[keys[i]] = (val === 'true' || val === 'false' || this.IsJsonString(val)) ? JSON.parse(val) : (typeof val === 'boolean') ? val : !isNaN(val) ? parseFloat(val) : val;
			}
		}
		return result;
	}
}