import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

// interfaces
import { FhemDevice, Room, RoomParams, Task, TaskInput, TaskProperty } from '../interfaces/interfaces.type';

// Services
import { FhemService } from './fhem.service';
import { TimeService } from './time.service';
import { ToastService } from './toast.service';
import { StorageService } from './storage.service';
import { StructureService } from './structure.service';
import { NativeFunctionsService } from './native-functions.service';

@Injectable({
	providedIn: 'root'
})

export class TaskService {
	// change subscription
	public taskSub = new Subject<any>();
	// fhem subscription
	private fhemSub!: Subscription;
	// connection sub 
	private connectedSub!: Subscription;
	// timer for time tasks
	private timer: any;
	// detect tasks loaded event
	private tasksLoadedSub = new Subject<boolean>();
	private tasksLoaded: boolean = false;

	// list of tasks
	public tasks: Array<Task> = [];

	// list of hide elements
	public hideList: any = {
		rooms: [],
		components: []
	};

	// task options for input
	public taskOptions: Array<TaskInput> = [
		{
			name: 'Fhem',
			inputs: [
				{variable: 'device', value: ''},
				{variable: 'reading', value: 'state'}
			],
			operators: ['=', '!=', '>','<', 'reading_not_available']
		},
		{
			name: 'Time',
			operators: ['=', '!=', '>','<'],
			operatorParam: 'timepicker'
		},
		{
			name: 'Weekday',
			operators: ['=', '!='],
			operatorParam: 'select',
			operatorValues: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
		}
	];

	// operator actions 
	// identify the input fields of the task
	public operatorOptions: any = {
		'=': { type: 'input' },
		'!=': { type: 'input' },
		'>': { type: 'input' },
		'<': { type: 'input' },
		'reading_not_available': { type: 'bool' }
	};

	// output options
	// defines the outputs, that can be generated from tasks
	public outputOptions: Array<TaskProperty> = [
		{variable: 'hide_component', value: ''},
		{variable: 'hide_room', value: ''},
		{variable: 'change_room', value: ''},
		{variable: 'show_alert', value: ''},
		{variable: 'play_sound', value: ''},
		{variable: 'vibration', value: ''}
	];

	constructor(
		// private native: NativeFunctionsService,
		private storage: StorageService,
		private structure: StructureService,
		private fhem: FhemService,
		private time: TimeService,
		private toast: ToastService){
		// task load sub
		this.tasksLoadedSub.subscribe(next=>{
			this.tasksLoaded = next;
		});
	}

	// get the list of tasks from storage
	public getTasks(): Promise<Task[]> {
		return new Promise((resolve)=>{
			this.storage.setAndGetSetting({ name: 'tasks', default: JSON.stringify([]) }).then((res:Array<Task>)=>{
				// check if task output is object
				// used because of old structure, when only one output was possible
				res.forEach((item: Task)=>{
					const itemAttributes: any = item.attributes;
					for(const key of Object.keys(itemAttributes)){
						if(itemAttributes[key].output && !Array.isArray(itemAttributes[key].output) ){
							const val = itemAttributes[key].output;
							itemAttributes[key].output = [val];
						}
					}
				});
				this.tasks = res;
				resolve(res);
			});
		});
	}

	// create a task
	public createTask(name: string, des: string): Promise<Task[]> {
		return new Promise((resolve)=>{
			let task: any = {
				ID: '_' + Math.random().toString(36).substr(2, 9),
				attributes: {
					IF: {
						name: 'Fhem',
						inputs: [
							{variable: 'device', value: ''},
							{variable: 'reading', value: 'state'}
						],
						compare: { operator: '=', to: '' },
						output: {variable: '', value: ''}
					}
				},
				name: name,
				description: des
			};
			this.changeTaskStorage(this.tasks.concat(task)).then((res: Task[])=> resolve(res) );
		});
	}

	// remove a task
	public removeTask(index: number): Promise<Task[]> {
		return new Promise((resolve)=>{
			this.tasks.splice(index, 1);
			this.changeTaskStorage(this.tasks).then(res=> resolve(res) );
		});
	}

	// change task
	public changeTask(index: number, obj: any): Promise<Task[]> {
		return new Promise((resolve)=>{
			for(const [key, value] of Object.entries(obj)){
				let desiredTask: any = this.tasks[index];
				desiredTask[key] = value;
			}
			this.changeTaskStorage(this.tasks).then(res=> resolve(res) );
		});
	}

	// returns arguments from task options
	public getOperators(name: string, output: string): any{
		const res: any = this.taskOptions.find(x=> x.name === name);
		if(res){
			return res[output];
		}
		return false;
	}

	// apply changes to storage
	private changeTaskStorage(tasks: Task[]): Promise<Task[]>{
		return new Promise((resolve)=>{
			this.storage.changeSetting({ name: 'tasks', change: JSON.stringify(tasks) }).then((res:Array<any>)=>{
				this.tasks = res;
				resolve(res);
			});
		});
	}

	// get the hide rooms and components
	public getHideElements(): void{
		this.tasksLoadedSub.next(false);
		// reset hide list
		this.hideList.rooms = [];
		this.hideList.components = [];
		let deviceList: Array<{taskID: string, fhemDevice: string}> = [];
		// search for fhem tasks
		this.tasks.forEach((task, i)=>{
			let taskAttributes: any = task.attributes;
			for( const [condition, value] of Object.entries(taskAttributes)){
				// check for fhem
				if(taskAttributes[condition].name === 'Fhem'){
					let device = taskAttributes[condition].inputs.find((x: any)=> x.variable === 'device');
					if(device && device.value !== '' && !deviceList.find(x=> x.taskID === task.ID)){
						deviceList.push({taskID: task.ID, fhemDevice: device.value});
					}
				}
			}
		});
		if(deviceList.length === 0){
			// no fhem devices needed
			this.analyseTasks([]);
		}else{
			// fhem devices needed
			deviceList.forEach((device)=>{
				// allow dirty fhem question, to receive new raw device
				this.fhem.getDevice(device.taskID, device.fhemDevice, false, true).then((dev: FhemDevice|null)=>{
					if(dev){
						this.analyseTasks([dev]);
					}
				});
			});
		}
	}

	private analyseTasks(devices: FhemDevice[]|[]): void{
		this.tasks.forEach((task, i)=>{
			// blocking indicator
			let block: boolean = false;
			// loop over conditions (IF, ELSE)
			let taskAttributes: any = task.attributes;
			for( const [condition, value] of Object.entries(taskAttributes)){
				if(condition.match(/IF/g)){
					// check for fhem
					if(taskAttributes[condition].name === 'Fhem'){
						// get device from task
						const taskDevice: any = taskAttributes[condition].inputs.find((x: any)=> x.variable === 'device');
						if(taskDevice && taskDevice.value !== ''){
							if(devices[0] !== null){
								const device: FhemDevice|undefined = devices.find((x: FhemDevice)=> x.device === taskDevice.value);
								if(device){
									const reading: any = taskAttributes[condition].inputs.find((x: any)=> x.variable === 'reading');
									if(reading && reading.value !== ''){
										// check for reading presence
										if( !(reading.value in device.readings) ){
											// reading is not in device
											if(taskAttributes[condition].compare.operator === 'reading_not_available'){
												block = true;
											}
										}else{
											// reading is in device
											block = this.propertyChecker(
												device.readings[reading.value].Value,
												taskAttributes[condition].compare.operator, 
												taskAttributes[condition].compare.to
											);
										}
									}
								}
							}
						}
					}
					// check for time
					if(taskAttributes[condition].name === 'Time'){
						let d: any = taskAttributes[condition].compare.to;
						let min;
						if(d.substr(2,1) !== ':'){
							d = new Date(d);
							min = d.getHours() * 60 + d.getMinutes();
						}else{
							min = this.time.times(d).toMin;
						}

						block = this.propertyChecker(
							this.time.local().timeMin,
							taskAttributes[condition].compare.operator,
							min,
						);
						this.timeChangeListener();
					}
					// check for weekday
					if(taskAttributes[condition].name === 'Weekday'){
						block = this.propertyChecker(
							this.time.local().weekdayTextShort,
							taskAttributes[condition].compare.operator,
							taskAttributes[condition].compare.to
						);
					}
					// evaluate the blocker
					if(block){
						this.outputHandler(taskAttributes[condition].output);
					}
				}
			}
			// check for else block
			if(!block && task.attributes.ELSE){
				this.outputHandler(task.attributes.ELSE.output);
			}
		});
		// all tasks evaluated
		this.tasksLoadedSub.next(true);
		this.taskSub.next(this.hideList);
	}

	// check the value combination
	private propertyChecker(value:number|string, operator:string, compareTo:number|string): boolean{
		value = value.toString().toLowerCase();
		compareTo = compareTo.toString().toLowerCase();

		let numTest = (test:any): number =>{
			if(isNaN(test)){
				return test;
			}else{
				return parseFloat(test);
			}
		}
		//check the operators
		if(operator === '='){
			if(value === compareTo){
				return true;
			}
		}
		if(operator === '!='){
			if(value !== compareTo){
				return true;
			}
		}
		if(operator === '>'){
			if(numTest(value) > numTest(compareTo)){
				return true;
			}
		}
		if(operator === '<'){
			if(numTest(value) < numTest(compareTo)){
				return true;
			}
		}
		return false;
	}

	// handle output
	// only use this handler for true block conditions
	// hide rooms, components...
	private outputHandler(outputs: TaskProperty[]|TaskProperty): void{
		outputs = Array.isArray(outputs) ? outputs : [outputs];
		outputs.forEach((output: TaskProperty)=>{
			// hide room
			if(output.variable === 'hide_room' && !this.hideList.rooms.includes(output.value)){
				this.hideList.rooms.push(output.value);
			}
			// hide component
			if(output.variable === 'hide_component' && !this.hideList.rooms.includes(output.value)){
				this.hideList.components.push(output.value);
			}
			// change room
			if(output.variable === 'change_room'){
				// detect if room exists to switch
				// detect if current room is room to switch to
				const room: Room|undefined = this.structure.rooms.find(x=> x.UID === output.value);
				if(room && this.structure.currentRoom.ID !== room.ID){
					// navigation params
					const params: RoomParams = { 
						name: room.name,
						ID: room.ID,
						UID: room.UID
					};
					this.structure.navigateToRoom(room.name, room.ID, params);
				}
			}
			// show toast
			if(output.variable === 'show_alert'){
				this.toast.showAlert('Alert', output.value, false);
			}
			// play sound
			if(output.variable === 'play_sound'){
				// this.native.playAudio(output.value);
			}
			// vibrate
			if(output.variable === 'vibration'){
				// this.native.vibrate(output.value);
			}
		});
	}

	// time listener
	// only used, if one task has a timer
	private timeChangeListener(): void{
		let date: Date = new Date();
		if(this.timer){
			clearInterval(this.timer);
		}
		setTimeout(()=>{
			this.timer = setInterval(()=>{
				this.getHideElements();
			}, 1000 * 60);
			this.getHideElements();
		}, (60 - date.getSeconds()) * 1000);
	}

	// evaluate hide elem
	public hide(ID: string|number, where: string): any{
		if(!this.tasksLoaded){
			const sub = this.tasksLoadedSub.subscribe((state) => {
				if(state){
					sub.unsubscribe();
					return this.hideList[where].includes(ID);
				}
			});
		}else{
			return this.hideList[where].includes(ID);
		}
	}

	// listen to changes and execute task
	public listen(): void{
		this.getTasks().then((res)=>{
			// connection sub remove
			if(this.connectedSub) this.connectedSub.unsubscribe();
			if(this.fhemSub) this.fhemSub.unsubscribe();

			this.fhemSub = this.fhem.deviceUpdateSub.subscribe((device)=>{
				this.getHideElements();
			});

			this.connectedSub = this.fhem.connectedSub.subscribe((state: boolean)=>{
				this.getHideElements();
			});
			this.getHideElements();
		});
	}

	// reset listener
	public unlisten(): void{
		if(this.connectedSub) this.connectedSub.unsubscribe();
		if(this.fhemSub) this.fhemSub.unsubscribe();
		if(this.timer) clearInterval(this.timer);

		this.hideList.rooms = [];
		this.hideList.components = [];
	}
}