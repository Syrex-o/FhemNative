import { Injectable } from '@angular/core';

// Services
import { FhemService } from './fhem.service';
import { StorageService } from './storage.service';
import { HelperService } from './helper.service';
import { StructureService } from './structure.service';
import { ToastService } from './toast.service';
import { TimeService } from './time.service';

import { Subject, Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class TasksService {
	// change subscription
	public taskSub = new Subject<any>();
	// fhem subscription
	private fhemSub: Subscription;
	// timer for time tasks
	private timer: any;
	// detect tasks loaded event
	private tasksLoadedSub = new Subject<boolean>();
	private tasksLoaded: boolean = false;

	// list of tasks
	public tasks: Array<any> = [];

	// list of hide elements
	public hideList: any = {
		rooms: [],
		components: []
	};

	// task options
	public taskOptions: Array<any> = [
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
	public outputOptions: Array<any> = [
		{variable: 'hide_component', value: ''},
		{variable: 'hide_room', value: ''},
		{variable: 'change_room', value: ''},
		{variable: 'show_alert', value: ''}
	];

	constructor(
		private fhem: FhemService,
		private storage: StorageService,
		private helper: HelperService,
		private structure: StructureService,
		private toast: ToastService,
		private time: TimeService){

		this.tasksLoadedSub.subscribe(next=>{
			this.tasksLoaded = next;
		});
	}

	// get the list of tasks from storage
	public getTasks(){
		return new Promise((resolve)=>{
			this.storage.setAndGetSetting({
				name: 'tasks',
				default: JSON.stringify([])
			}).then((res:Array<any>)=>{
				this.tasks = res;
				resolve(res);
			});
		});
	}

	// create a task
	public createTask(name, des){
		return new Promise((resolve)=>{
			let task = {
				ID: this.helper.UIDgenerator(),
				attributes: {
					IF: {
						name: 'Fhem',
						inputs: [
							{variable: 'device', value: ''},
							{variable: 'reading', value: 'state'}
						],
						compare: { operator: '=', to: '' },
						output: {}
					}
				},
				name: name,
				description: des
			};
			this.changeTaskStorage(this.tasks.concat(task)).then(res=> resolve(res) );
		});
	}

	// remove a task
	public removeTask(index){
		return new Promise((resolve)=>{
			this.tasks.splice(index, 1);
			this.changeTaskStorage(this.tasks).then(res=> resolve(res) );
		});
	}

	// change task
	public changeTask(index, obj){
		return new Promise((resolve)=>{
			for(const [key, value] of Object.entries(obj)){
				this.tasks[index][key] = value;
			}
			this.changeTaskStorage(this.tasks).then(res=> resolve(res) );
		});
	}

	// returns arguments from task options
	public getOperators(name, output){
		const result = this.helper.find(this.taskOptions, 'name', name);
		if(result){
			return result.item[output];
		}
		return false;
	}

	// apply changes to storage
	private changeTaskStorage(tasks){
		return new Promise((resolve)=>{
			this.storage.changeSetting({
				name: 'tasks',
				change: JSON.stringify(tasks)
			}).then((res:Array<any>)=>{
				this.tasks = res;
				resolve(res);
			});
		});
	}

	// get the hide rooms and components
	public getHideElements(){
		return new Promise((resolve)=>{
			this.tasksLoadedSub.next(false);
			// reset hide list
			this.hideList.rooms = [];
			this.hideList.components = [];

			let deviceList = [];
			let gotReply: boolean = false;
			// search for elements to hide
			this.tasks.forEach((task, i)=>{
				for( const [condition, value] of Object.entries(task.attributes)){
					// check for fhem
					if(task.attributes[condition].name === 'Fhem'){
						let device = task.attributes[condition].inputs.find(x=> x.variable === 'device');
						if(device && device.value !== '' && !deviceList.includes(device.value)){
							deviceList.push(device.value);
						}
					}
				}
			});
			// get the devices in tasks from fhem
			if(deviceList.length > 0){
				const t = this.fhem.devicesListSub.subscribe(next=>{
					gotReply = true;
					t.unsubscribe();
					// get the block list
					this.analyseTasks(next);
					// subscribe to changes
					next.forEach((device)=>{
						this.fhem.listen(device.device);
					});
					// end event
					resolve(this.hideList);
				});
				// send command for devices in tasks
				this.fhem.listDevices(deviceList.join(','));
				// check for response
				setTimeout(()=>{
					if(!gotReply){
						t.unsubscribe();
						this.analyseTasks([]);
						// end event
						resolve(this.hideList);
					}
				}, 1000);
			}else{
				// no fhem devices needed
				this.analyseTasks([]);
				// end event
				resolve(this.hideList);
			}
		});
	}

	private analyseTasks(devices){
		this.tasks.forEach((task, i)=>{
			for( const [condition, value] of Object.entries(task.attributes)){
				// blocking indicator
				let block = false;
				// check for fhem
				if(task.attributes[condition].name === 'Fhem'){
					// get device from task
					const taskDevice = task.attributes[condition].inputs.find(x=> x.variable === 'device');
					if(taskDevice && taskDevice.value !== ''){
						const device = devices.find(x=> x.device === taskDevice.value);
						if(device){
							const reading = task.attributes[condition].inputs.find(x=> x.variable === 'reading');
							if(reading && reading.value !== ''){
								// check for reading presence
								if( !(reading.value in device.readings) ){
									// reading is not in device
									if(task.attributes[condition].compare.operator === 'reading_not_available'){
										block = true;
									}
								}else{
									// reading is in device
									block = this.propertyChecker(
										device.readings[reading.value].Value,
										task.attributes[condition].compare.operator, 
										task.attributes[condition].compare.to
									);
								}
							}
						}
					}
				}
				// check for time
				if(task.attributes[condition].name === 'Time'){
					block = this.propertyChecker(
						this.time.local().timeMin,
						task.attributes[condition].compare.operator,
						this.time.times(task.attributes[condition].compare.to).toMin,
					);
					this.timeChangeListener();
				}
				// check for weekday
				if(task.attributes[condition].name === 'Weekday'){
					block = this.propertyChecker(
						this.time.local().weekdayTextShort,
						task.attributes[condition].compare.operator,
						task.attributes[condition].compare.to
					);
				}
				// evaluate the blocker
				if(block){
					if(task.attributes[condition].output.variable === 'hide_room'){
						this.hideList.rooms.push(task.attributes[condition].output.value);
					}
					if(task.attributes[condition].output.variable === 'hide_component'){
						this.hideList.components.push(task.attributes[condition].output.value);
					}
					if(task.attributes[condition].output.variable === 'change_room'){
						// detect if room exists to switch
						// detect if current room is room to switch to
						const room = this.helper.find(this.structure.rooms, 'UID', task.attributes[condition].output.value);
						if(room && this.structure.getCurrentRoom().item.ID !== room.item.ID){
							this.structure.navigateTo(room.item.name+'_'+room.item.ID);
						}
					}
					if(task.attributes[condition].output.variable === 'show_alert'){
						this.toast.showAlert(
							'Alert',
							task.attributes[condition].output.value,
							false
						);
					}
				}
			}
		});
		// all tasks evaluated
		this.tasksLoadedSub.next(true);
		this.taskSub.next(this.hideList);
	}

	// fhem listener
	private fhemChangeListener(){
		this.fhemSub = this.fhem.devicesSub.subscribe(next=>{
			this.getHideElements();
		});
	}

	// time listener
	// only used, if one task has a timer
	private timeChangeListener(){
		let date = new Date();
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

	// check the value combination
	private propertyChecker(value:any, operator:string, compareTo:any){
		value = value.toString().toLowerCase();
		compareTo = compareTo.toString().toLowerCase();
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
			if(value > compareTo){
				return true;
			}
		}
		if(operator === '<'){
			if(value < compareTo){
				return true;
			}
		}
		return false;
	}

	// evaluate hide elem
	public hide(ID, where){
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
	public listen(){
		this.getTasks().then((res)=>{
			this.getHideElements().then(()=>{
				this.fhemChangeListener();
			});
		});
	}

	// reset listener
	public unlisten(){
		if(this.fhemSub){
			this.fhemSub.unsubscribe();
		}
		if(this.timer){
			clearInterval(this.timer);
		}
		this.hideList.rooms = [];
		this.hideList.components = [];
	}
}