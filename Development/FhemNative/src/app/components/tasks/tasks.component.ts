import { Component, OnInit, NgModule } from '@angular/core';
import { ModalController } from '@ionic/angular';

// Components
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';

// Services
import { FhemService } from '../../services/fhem.service';
import { TaskService } from '../../services/task.service';
import { ToastService } from '../../services/toast.service';
import { StructureService } from '../../services/structure.service';
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

// Translate
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'tasks',
	templateUrl: './tasks.component.html',
  	styleUrls: ['./tasks.component.scss']
})

export default class TasksComponent implements OnInit {
	// Back button handle ID
	private handleID: string = '_' + Math.random().toString(36).substr(2, 9);

	// list of tasks to load from app storage
	tasks: any;

	// list of all components in rooms
	components:Array<any> = [];

	// task info for task creation
	taskInfo: any = {
		name: '',
		description: ''
	};

	// code structure of selected elem
	taskStructure: any = {
		selectedTask: null
	};

	// menus
	menus: {[key: string]: boolean} = {
		createTask: false,
		taskConfigurator: false
	}

	ngOnInit(){
		this.backBtn.handle(this.handleID, ()=>{
			this.closeTasks();
		});
		// load tasks
		this.loadTasks();
	}

	// walkaround for object sorting
	orderItems(val){return 0;}

	// load tasks from storage
	private loadTasks(){
		this.task.getTasks().then((res)=>{
			this.tasks = this.task.tasks;
			// build selectable list
			this.components = [];
			const components = this.structure.getAllComponents();
			components.forEach((comp)=>{
				let props = {
					text: comp.component.name + ' ID: '+comp.component.ID + ', For: ',
					ID: comp.component.ID
				};
				// search for fhem device
				if(comp.component.attributes.attr_data){
					let device= comp.component.attributes.attr_data.find(x=> x.attr === 'data_device');
					if(device && device.value !== ''){
						props.text = props.text + device.value;
					}else{
						props.text = props.text + 'no Device';
					}
					props.text = props.text + ', In: '+ comp.room;
				}
				this.components.push(props);
			});
		});
	}

	// open menu 
	openMenu(menu: string){
		this.menus[menu] = !this.menus[menu];
	}

	closeTasks(){
		this.modalCtrl.dismiss();
		this.backBtn.removeHandle(this.handleID);
	}

	// check values
	private valueChecker(){
		if(this.taskInfo.name && this.taskInfo.name !== '' && this.taskInfo.description && this.taskInfo.description !== ''){
			return true;
		}else{
			this.toast.showAlert(
				this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.TITLE'),
				this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.INFO'),
				false
			);
			return false;
		}
	}

	// config a task
	configTask(index: number){
		this.taskStructure.selectedTask = index;
		this.menus.taskConfigurator = true;
	}

	// edit existing task
	editTask(index: number){
		this.taskStructure.selectedTask = index;
		this.taskInfo = {
			name: this.tasks[index].name,
			description: this.tasks[index].description
		};
		this.menus.createTask = true;
	}

	// remove task
	removeTask(index: number){
		this.toast.showAlert(
			this.translate.instant('GENERAL.TASKS.REMOVE_TASK.TITLE'),
			this.translate.instant('GENERAL.TASKS.REMOVE_TASK.INFO'),
			{
				buttons: [
	    			{
	                    text: this.translate.instant('GENERAL.BUTTONS.CONFIRM'),
	                    handler: data => {
						    this.task.removeTask(index).then((res)=>{
								this.tasks = res;
								this.task.getHideElements();
							});
	                    }
	                },
	                {
	    				text: this.translate.instant('GENERAL.BUTTONS.CANCEL'),
	    				role: 'cancel'
	    			}
				]
			}
		)
	}

	// update task attr
	updateAttributes(name: string, condition: string){
		this.tasks[this.taskStructure.selectedTask].attributes[condition] = {
			compare: {operator: '=', to: ''},
			name: name,
			output: this.tasks[this.taskStructure.selectedTask].attributes[condition].output
		};
		// check if task has inputs
		const option = this.task.taskOptions.find(x=> x.name === name);
		if(option.inputs){
			this.tasks[this.taskStructure.selectedTask].attributes[condition].inputs = option.inputs;
		}
	}

	// cahnge task properties on save
	changeTaskAttributes(){
		// check if all relevant information is filled in
		let allFilled: boolean = true;
		const taskValues = this.tasks[this.taskStructure.selectedTask].attributes;
		for(const key of Object.keys(taskValues)){
			// check compare operator
			if(taskValues[key].compare && taskValues[key].compare.to === ''){
				allFilled = false;
				break;
			}
			// check input
			if(taskValues[key].inputs){
				taskValues[key].inputs.forEach((input)=>{
					if(!input.value || input.value === ''){
						allFilled = false;
					}
				});
			}
			// check output
			taskValues[key].output.forEach((output)=>{
				if(!output.value || output.value === ''){
					allFilled = false;
				}
			});
		}
		// save or remind to fill properties
		if(allFilled){
			this.task.changeTask(this.taskStructure.selectedTask, {
				attributes: this.tasks[this.taskStructure.selectedTask].attributes
			}).then((res)=>{
				this.tasks = res;
				this.resetValues();
				this.task.getHideElements();
			});
		}else{
			this.toast.showAlert(
				this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.TITLE'),
				this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.INFO'),
				false
			);
		}
	}

	// add output parameters
	addOutput(param: string){
		let output = this.tasks[this.taskStructure.selectedTask].attributes[param].output;
		output.push({});
	}

	// remove output
	removeOutput(index: number, param: string){
		this.tasks[this.taskStructure.selectedTask].attributes[param].output.splice(index, 1);
	}

	// add else block
	addElse(){
		this.tasks[this.taskStructure.selectedTask].attributes.ELSE = {
			output: [{variable: '', value: ''}]
		};
	}

	// remove else block
	removeElse(){
		delete this.tasks[this.taskStructure.selectedTask].attributes.ELSE;
	}

	// demo of native feedback
	nativeDemo(param: string, value: any){
		if(param === 'play_sound'){
			this.native.playAudio(value);
		}else{
			this.native.vibrate(value);
		}
	}

	// save task
	save(){
		if(this.valueChecker()){
			if(this.taskStructure.selectedTask !== null){
				// change task
				this.task.changeTask(this.taskStructure.selectedTask, {
					name: this.taskInfo.name,
					description: this.taskInfo.description
				}).then((res)=>{
					this.tasks = res;
					this.resetValues();
				});
			}else{
				// new task
				this.task.createTask(this.taskInfo.name, this.taskInfo.description).then((res)=>{
					this.tasks = res;
					this.resetValues();
				});
			}
		}
	}

	// cancel task creation/edit
	close(){
		this.resetValues();
	}

	private resetValues(){
		// reset menus
		this.menus.createTask = false;
		this.menus.taskConfigurator = false;

		this.taskInfo = {
			name: '',
			description: ''
		};
		this.taskStructure.selectedTask = null;

		this.loadTasks();
	}

	constructor(
		public task: TaskService,
		public settings: SettingsService,
		public structure: StructureService,
		private fhem: FhemService,
		private toast: ToastService,
		private modalCtrl: ModalController,
		private backBtn: BackButtonService,
		private translate: TranslateService,
		private native: NativeFunctionsService){

	}
}
@NgModule({
	imports: [ComponentsModule, IonicModule],
  	declarations: [TasksComponent]
})
class TasksComponentModule {}