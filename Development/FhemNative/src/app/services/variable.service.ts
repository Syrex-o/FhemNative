import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';

// interfaces
import { FhemDevice } from '../interfaces/interfaces.type';

// Services
import { StorageService } from './storage.service';
import { StructureService } from './structure.service';
import { LoggerService } from './logger/logger.service';
import { FhemService } from './fhem.service';

interface StorageVariable {
	ID: string,
	defSyntax: string,
	name: string,
	description: string,
	// variable attributes
	attributes:{
		// static/dynamic
		type?: string,
		// variable inputs
		inputOption?: any,
		// variable update options
		updateOption?: any,
		// regex variable options
		regexOption?: any
	}
}

interface Variable {
	ID: string,
	// syntax to call
	defSyntax: string,
	name: string,
	description: string,
	// variable attributes
	attributes: {
		// static/dynamic
		type?: string,
		// variable inputs
		inputOption?: any,
		// variable update options
		updateOption?: any,
		// regex variable options
		regexOption?: any
	},
	// raw value
	rawValue?: any,
	// desired value
	modValue?: any
}

@Injectable({
	providedIn: 'root'
})

export class VariableService {
	// variables in storage
	public storageVariables: Array<StorageVariable> = [];
	// active variables
	public variables: Array<Variable> = [];

	// fhem subscription
	private fhemSub: Subscription;
	// connection sub 
	private connectedSub: Subscription;
	// timers
	private timers: Array<{variableID: string, timer: any}> = [];
	// variables loaded
	public variablesLoadedSub = new Subject<boolean>();
	public variablesLoaded: boolean = false;
	// variable update
	public variableUpdate = new Subject<Variable>();

	// Workflow:
	// Get Variable options --> Show raw output --> Define updater --> additional regex --> Show modified output

	// variable options for input
	public variableOptions: Array<{name: string, inputs: Array<any>, dependOn: string}> = [
		{
			name: 'Shortcode',
			inputs: [
				{variable: 'shortcode', value: ''}
			],
			dependOn: 'static'
		},
		{
			name: 'Fhem Value',
			inputs: [
				{variable: 'device', value: ''},
				{variable: 'reading', value: 'state'}
			],
			dependOn: 'dynamic'
		},
		{
			name: 'Fhem Internal',
			inputs: [
				{variable: 'device', value: ''},
				{variable: 'internal', value: 'FUUID'}
			],
			dependOn: 'dynamic'
		},
		{
			name: 'Fhem Attribute',
			inputs: [
				{variable: 'device', value: ''},
				{variable: 'attribute', value: 'room'}
			],
			dependOn: 'dynamic'
		},
		{
			name: 'Fhem Get',
			inputs: [
				{variable: 'device', value: ''},
				{variable: 'command', value: ''}
			],
			dependOn: 'dynamic'
		}
	];

	// variable options for update
	public updateOptions: Array<{name: string, options?: Array<any>, dependOn: string[]}> = [
		{
			name: 'Update Interval',
			options: [10, 20, 30, 60, 120],
			dependOn: ['Fhem Value', 'Fhem Internal', 'Fhem Attribute', 'Fhem Get']
		},
		{
			name: 'On Change',
			dependOn: ['Fhem Value']
		}
	];

	// regex options
	public regexOptions: Array<{name: string, input?: string, options?: Array<any>, dependOn: string[]}> = [
		{
			name: 'regex custom',
			input: '',
			dependOn: ['Fhem Value', 'Fhem Internal', 'Fhem Attribute', 'Fhem Get']
		}
	];

	constructor(
		private storage: StorageService,
		private structure: StructureService,
		private logger: LoggerService,
		private fhem: FhemService){
		// variable loader
		this.variablesLoadedSub.subscribe(next=> this.variablesLoaded = next);
	}

	// get the list of variables from storage
	public getVariables(): Promise<any>{
		return new Promise((resolve)=>{
			this.storage.setAndGetSetting({
				name: 'variables',
				default: JSON.stringify([])
			}).then((res:Array<StorageVariable>)=>{
				this.storageVariables = res;
				this.variables = JSON.parse(JSON.stringify(res));
				resolve();
			});
		});
	}

	public changeVariable(index: number, obj: any): Promise<any>{
		return new Promise((resolve)=>{
			for(const [key, value] of Object.entries(obj)){
				this.storageVariables[index][key] = value;
			}
			this.changeVariableStorage(this.storageVariables).then(()=>{
				resolve();
			});
		});
	}

	// create variable
	public createVariable(obj: StorageVariable): Promise<any>{
		return new Promise((resolve)=>{
			let task: StorageVariable = {
				ID: '_' + Math.random().toString(36).substr(2, 9),
				defSyntax: obj.defSyntax,
				name: obj.name,
				description: obj.description,
				attributes:{
					type: 'static',
					inputOption: {name: ''},
					updateOption: {name: ''},
					regexOption: {name: ''}
				}
			};
			this.changeVariableStorage(this.storageVariables.concat(task)).then(()=>{
				resolve();
			});
		});
	}

	// change variables in storage
	public changeVariableStorage(variables: StorageVariable[]): Promise<any>{
		return new Promise((resolve)=>{
			this.unlisten();
			this.storage.changeSetting({
				name: 'variables',
				change: JSON.stringify(variables)
			}).then((res: Array<StorageVariable>)=>{
				this.storageVariables = res;
				this.variables = JSON.parse(JSON.stringify(res));

				this.listen();
				resolve();
			});
		});
	}

	// update static variable
	public updateStaticVariable(variableDefSyntax: string, value: string): void{
		let foundVariable: StorageVariable|null = this.storageVariables.find(x=> x.defSyntax === variableDefSyntax);
		if(foundVariable){
			// modify
			foundVariable.attributes.inputOption.inputs[0].value = value;
			// save modification
			this.changeVariableStorage(this.storageVariables);
		}
	}

	// get variable value update
	// ask for devices only in initial stage
	private updateVariables(initial?: boolean): void{
		this.variables.forEach((variable: Variable)=>{
			if(variable.attributes.type === 'dynamic'){
				const attr = variable.attributes;
				if(attr.inputOption.name !== 'Fhem Get'){
					if( (attr.updateOption.name === 'On Change' || attr.updateOption.value !== '') && attr.inputOption.inputs[1].value !== ''){
						if(initial){
							if(attr.updateOption.name === 'Update Interval'){
								this.timers.push({
									variableID: variable.ID,
									timer: setInterval(()=>{
										// allow dirty fhem question, to receive new raw device
										this.fhem.getDevice(variable.ID, attr.inputOption.inputs[0].value, false, true).then((dev: FhemDevice|null)=>{
											this.analyseVariables(dev);
										});
									}, attr.updateOption.value * 1000)
								});
							}
							// send request
							this.fhem.getDevice(variable.ID, attr.inputOption.inputs[0].value, false, true).then((dev: FhemDevice|null)=>{
								this.analyseVariables(dev);
							});
						}
					}
				}else{
					// special fhem get
					if(attr.updateOption.value && attr.inputOption.inputs[1].value !== ''){
						if(initial){
							this.timers.push({
								variableID: variable.ID,
								timer: setInterval(()=>{
									this.fhem.get(attr.inputOption.inputs[0].value, attr.inputOption.inputs[1].value).then((res)=>{
										this.analyseGetVariables(variable, res);
									});
								}, attr.updateOption.value * 1000)
							});
							// send get 
							this.fhem.get(attr.inputOption.inputs[0].value, attr.inputOption.inputs[1].value).then((res)=>{
								this.analyseGetVariables(variable, res);
							});
						}
					}
				}
			}else{
				// only init static variables on first load
				if(initial && variable.attributes.inputOption.inputs){
					variable.rawValue = variable.attributes.inputOption.inputs[0].value;
					this.analyseRegex(variable);
				}
			}
		});
	}

	// analyseVariables except get
	private analyseVariables(device: FhemDevice|null): void{
		if(device){
			this.variables.forEach((variable: Variable)=>{
				if(variable.attributes.type === 'dynamic'){
					const attr = variable.attributes;
					// Fhem Device reading combination
					if(attr.inputOption.name === 'Fhem Value'){
						// look for matching devices
						if(attr.inputOption.inputs[0].value === device.device && attr.inputOption.inputs[1].value in device.readings){
							variable.rawValue = device.readings[attr.inputOption.inputs[1].value].Value;
							this.analyseRegex(variable);
						}
					}
					// Fhem Internal
					if(attr.inputOption.name === 'Fhem Internal'){
						// look for matching devices
						if(attr.inputOption.inputs[0].value === device.device && attr.inputOption.inputs[1].value in device.internals){
							variable.rawValue = device.internals[attr.inputOption.inputs[1].value];
							this.analyseRegex(variable);
						}
					}
					// Fhem Attribute
					if(attr.inputOption.name === 'Fhem Attribute'){
						// look for matching devices
						if(attr.inputOption.inputs[0].value === device.device && attr.inputOption.inputs[1].value in device.attributes){
							variable.rawValue = device.attributes[attr.inputOption.inputs[1].value];
							this.analyseRegex(variable);
						}
					}
				}
			});
		}
	}

	private analyseGetVariables(variable: Variable, reply: any): void{
		if(reply !== null){
			let res: string = reply.join(' ');
			variable.rawValue = res;
			this.analyseRegex(variable);
		}
	}

	private analyseRegex(variable: Variable): void{
		const prevValue: any = variable.modValue;

		if(variable.attributes.regexOption.name !== '' && variable.attributes.regexOption.value && variable.attributes.regexOption.value !== ''){
			let regex: RegExp = new RegExp(variable.attributes.regexOption.value, '');
			try{
				let res = variable.rawValue.toString().match(regex);
				if(res){
					// check for num
					if(isNaN(res[0])){
						variable.modValue = res[0];
					}else{
						variable.modValue = parseFloat(res[0]);
					}
				}else{
					variable.modValue = variable.rawValue;
				}
			} catch(e){
				this.logger.error('Variable Regex error for Variable: ' + variable.defSyntax + ` (${e})`);
			}
		}else{
			variable.modValue = variable.rawValue;
		}
		if(variable.modValue !== prevValue){
			this.variableUpdate.next(variable);
		}
	}


	// listen to changes
	public listen(): void{
		this.variablesLoadedSub.next(false);
		this.getVariables().then(()=>{
			// clear
			if(this.connectedSub) this.connectedSub.unsubscribe();
			if(this.fhemSub) this.fhemSub.unsubscribe();
			this.timers.forEach((variableTimer)=>{
				clearInterval(variableTimer.timer);
			});
			if(this.variables.length > 0){
				this.fhemSub = this.fhem.deviceUpdateSub.subscribe((device:FhemDevice)=>{
					this.analyseVariables(device);
				});

				this.connectedSub = this.fhem.connectedSub.subscribe((state: boolean)=>{
					this.updateVariables();
				});
				this.updateVariables(true);
			}
			this.variablesLoadedSub.next(true);
		});
	}

	// reset listener
	public unlisten(): void{
		if(this.connectedSub) this.connectedSub.unsubscribe();
		if(this.fhemSub) this.fhemSub.unsubscribe();
		this.timers.forEach((variableTimer)=>{
			clearInterval(variableTimer.timer);
		});
	}
}