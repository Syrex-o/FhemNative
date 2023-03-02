import { Injectable } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
// Services
import { FhemService } from './fhem.service';
import { StorageService } from './storage.service';
import { StructureService } from './structure.service';
import { LoggerService } from './logger/logger.service';
// interfaces
import { FhemDevice, Variable } from '../interfaces/interfaces.type';

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

@Injectable({
	providedIn: 'root'
})

export class VariableService {
	// variables in storage
	public storageVariables: StorageVariable[] = [];
	// active variables
	public variables: Array<Variable> = [];
	// fhem subscription
	private fhemSub!: Subscription;
	// connection sub 
	private connectedSub!: Subscription;
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
			name: 'regex shortcodes',
			options: [
				'first digit',
				'all digits'
			],
			dependOn: ['Fhem Value', 'Fhem Internal', 'Fhem Attribute', 'Fhem Get']
		},
		{
			name: 'regex custom',
			input: '',
			dependOn: ['Fhem Value', 'Fhem Internal', 'Fhem Attribute', 'Fhem Get']
		},
		{
			name: 'regex replace (comma seperated)',
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
	public getVariables(): Promise<boolean>{
		return new Promise((resolve)=>{
			this.storage.setAndGetSetting({
				name: 'variables',
				default: JSON.stringify([])
			}).then((res:Array<StorageVariable>)=>{
				this.storageVariables = res;
				this.variables = JSON.parse(JSON.stringify(res));
				resolve(true);
			});
		});
	}

	public changeVariable(index: number, obj: any): Promise<boolean>{
		return new Promise((resolve)=>{
			for(const [key, value] of Object.entries(obj)){
				let relevantVariable: any = this.storageVariables[index];
				relevantVariable[key] = value;
			}
			this.changeVariableStorage(this.storageVariables).then(()=>{
				resolve(true);
			});
		});
	}

	// create variable
	public createVariable(obj: StorageVariable): Promise<boolean>{
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
				resolve(true);
			});
		});
	}

	// change variables in storage
	public changeVariableStorage(variables: StorageVariable[]): Promise<boolean>{
		return new Promise((resolve)=>{
			this.unlisten();
			this.storage.changeSetting({
				name: 'variables',
				change: JSON.stringify(variables)
			}).then((res: Array<StorageVariable>)=>{
				this.storageVariables = res;
				this.variables = JSON.parse(JSON.stringify(res));

				this.listen();
				resolve(true);
			});
		});
	}

	// update static variable
	public updateStaticVariable(variableDefSyntax: string, value: string): void{
		let foundVariable: StorageVariable|undefined = this.storageVariables.find(x=> x.defSyntax === variableDefSyntax);
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
			// get base config of regex option
			const baseRegex: any = this.regexOptions.find(x=> x.name === variable.attributes.regexOption.name);
			// regex for match
			let regExp: RegExp = new RegExp(variable.attributes.regexOption.value, '');
			// match number to consider
			let regExIndex: number|string = 0;

			// predefined regex
			if(baseRegex.options){
				const relValue: string = variable.attributes.regexOption.value;
				if(relValue === 'first digit'){
					regExp = new RegExp(/\d/, '');
				}
				if(relValue === 'all digits'){
					regExp = new RegExp(/\d+/, 'g');
					regExIndex = 'all';
				}
			}
			// test regex
			try {
				if(baseRegex.name === 'regex replace (comma seperated)'){
					const rel: string = variable.attributes.regexOption.value;
					// check for double comma
					let splitted: string[] = rel.split(',');
					if(splitted.length > 2){
						const relIndex: any = rel.match(/(,)(?!.*,)/);
						if(relIndex){
							// split by index --> needed for double comma (,,)
							splitted = [
								rel.substring(0, relIndex.index),
								rel.substr(relIndex.index + 1)
							]
						}
					}
					if(splitted.length === 2){
						try{
							let res = variable.rawValue.toString().split(splitted[0]).join(splitted[1]);
							// check for num
							if(isNaN(res)){
								variable.modValue = res;
							}else{
								variable.modValue = parseFloat(res);
							}
						} catch(e){
							this.logger.error('Variable Regex error for Variable: ' + variable.defSyntax + ` (${e})`);
						}
					}else{
						variable.modValue = variable.rawValue;
					}
				}else{
					let res = variable.rawValue.toString().match(regExp);
					if(res){
						if(typeof regExIndex === 'string'){
							let mod = res.join('');
							// check for num
							if(isNaN(mod)){
								variable.modValue = mod;
							}else{
								variable.modValue = parseFloat(mod);
							}
						}else{
							// check for num
							if(isNaN(res[regExIndex])){
								variable.modValue = res[regExIndex];
							}else{
								variable.modValue = parseFloat(res[regExIndex]);
							}
						}
					}else{
						variable.modValue = variable.rawValue;
					}
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
		this.getVariables().then((done: boolean)=>{
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
		this.timers.forEach((variableTimer: {variableID: string, timer: any})=> clearInterval(variableTimer.timer) );
	}
}