import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { StorageService } from '../../services/storage.service';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { StructureService } from '../../services/structure.service';
import { NativeFunctionsService } from '../../services/native-functions.service';

import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'room-tasks',

	template: `
		<ion-header [ngClass]="settings.app.theme">
			<ion-toolbar>
			    <button class="back-btn" (click)="modalCtrl.dismiss();" matRipple [matRippleColor]="'#d4d4d480'">
			    	<ion-icon name="arrow-round-back"></ion-icon>
			    </button>
				<ion-title>{{ 'GENERAL.TASKS.TITLE' | translate }}</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding" [ngClass]="settings.app.theme">
			<div class="page">
				<div class="select-box">
					<div class="select-box">
						<div class="text">
							<p>{{ 'GENERAL.TASKS.CREATE_TASK.TITLE' | translate }}</p>
							<p class="des">{{ 'GENERAL.TASKS.CREATE_TASK.INFO' | translate }}</p>
						</div>
						<button matRipple [matRippleColor]="'#d4d4d480'" class="add-btn" (click)="showPopup = true;">
							<span class="line top"></span>
							<span class="line bottom"></span>
						</button>
					</div>
					<ng-container *ngIf="tasks">
						<div class="task" *ngFor="let task of tasks; let i = index;">
							<div class="label-container">
								<p>{{task.name}}</p>
								<p class="des">{{ task.description }}</p>
							</div>
							<div class="button-container">
								<button class="btn-icon" matRipple [matRippleColor]="'#d4d4d480'" (click)="configTask(i)">
						    		<ion-icon name="build"></ion-icon>
						    	</button>
								<button class="btn-icon" matRipple [matRippleColor]="'#d4d4d480'" (click)="editTask(i)">
						    		<ion-icon name="create"></ion-icon>
						    	</button>
						    	<button class="btn-icon" matRipple [matRippleColor]="'#d4d4d480'" (click)="removeTask(i)">
						    		<ion-icon name="trash"></ion-icon>
						    	</button>
							</div>
						</div>
					</ng-container>
				</div>
			</div>
		</ion-content>
		<popup *ngIf="showPopup"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[(ngModel)]="showPopup"
			[data_width]="'90'"
			[data_height]="'90'"
			[fixPosition]="true"
			(onClose)="resetValues()"
			[headLine]=" taskStructure.selectedTask !== null ? ( 'GENERAL.TASKS.EDIT_TASK.TITLE' | translate ) : ( 'GENERAL.TASKS.CREATE_TASK.TITLE' | translate )">
			<div class="config-container">
				<p>{{ 'GENERAL.TASKS.CREATE_TASK.NAME.TITLE' | translate }}</p>
				<p class="des">{{ 'GENERAL.TASKS.CREATE_TASK.NAME.INFO' | translate }}</p>
				<input class="inp" [(ngModel)]="taskInfo.name" placeholder="{{taskInfo.name}}">
			    <span class="bar"></span>
			</div>
			<div class="config-container">
				<p>{{ 'GENERAL.TASKS.CREATE_TASK.DES.TITLE' | translate }}</p>
				<p class="des">{{ 'GENERAL.TASKS.CREATE_TASK.DES.INFO' | translate }}</p>
				<input class="inp" [(ngModel)]="taskInfo.description" placeholder="{{taskInfo.description}}">
			    <span class="bar"></span>
			</div>
		    <button ion-button class="btn submit" (click)="taskStructure.selectedTask !== null ? changeTaskName() : createTask()">{{'GENERAL.BUTTONS.SAVE' | translate}}</button>
			<button ion-button class="btn cancel" (click)="showPopup = false;">{{'GENERAL.BUTTONS.CANCEL' | translate}}</button>
		</popup>
		<popup *ngIf="showTaskConfigurator"
			[ngClass]="settings.app.theme"
			[customMode]="true"
			[(ngModel)]="showTaskConfigurator"
			[data_width]="'100'"
			[data_height]="'100'"
			[fixPosition]="true"
			[headLine]="('GENERAL.TASKS.CONFIG_TASK.TITLE' | translate) +': '+ (tasks[taskStructure.selectedTask].device ? tasks[taskStructure.selectedTask].device : tasks[taskStructure.selectedTask].name)"
			(onClose)="resetValues()">
			<div class="page">
				<div class="graph-container">
					<ng-container *ngTemplateOutlet="BLOCK; context: {items: tasks[taskStructure.selectedTask].attributes}"></ng-container>
				</div>
				<button ion-button class="btn submit half" (click)="changeTaskAttributes()">{{'GENERAL.BUTTONS.SAVE' | translate}}</button>
				<button ion-button class="btn cancel half" (click)="resetValues()">{{'GENERAL.BUTTONS.CANCEL' | translate}}</button>
			</div>
		</popup>

		<ng-template #BLOCK let-items="items">
			<div class="code-block" *ngFor="let attr of items | keyvalue: orderItems">
				<ng-container *ngTemplateOutlet="BLOCK_CONDITION; context: {block: attr.key}"></ng-container>
			</div>
		</ng-template>

		<ng-template #BLOCK_CONDITION let-block="block">
			<div class="block-container {{block}}">
				<div class="block-definition">
					<p class="block-condition">{{block}}</p>
					<ng-select 
						*ngIf="block === 'IF'"
						class="break"
						[items]="task.taskOptions"
						[searchable]="false"
						[clearable]="false"
						bindLabel="name"
						bindValue="name"
						[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block].name"
						(change)="updateAttributes($event, block)">
						<ng-template ng-option-tmp let-item="item" let-index="index">
					   		<span class="label">{{item.name}}</span>
						</ng-template>
					</ng-select>
				</div>

				<ng-container *ngIf="{ inputs: tasks[taskStructure.selectedTask].attributes[block].inputs } as input">
					<ng-container *ngTemplateOutlet="BLOCK_INPUTS; context: input"></ng-container>
				</ng-container>

				<ng-container *ngIf="{ $implicit: block, operators: task.getOperators(tasks[taskStructure.selectedTask].attributes[block].name, 'operators') } as operator">
					<ng-container *ngTemplateOutlet="BLOCK_OPERATORS; context: operator"></ng-container>
				</ng-container>

				<ng-container *ngIf="{ $implicit: block, outputs: tasks[taskStructure.selectedTask].attributes[block].output } as output">
					<ng-container *ngTemplateOutlet="BLOCK_OUTPUTS; context: output"></ng-container>
				</ng-container>
			</div>

			<div class="add-output-container" *ngIf="tasks[taskStructure.selectedTask]?.attributes[block.key]?.output[0]?.value !== ''">
				<button matRipple [matRippleColor]="'#d4d4d480'" class="add-btn add-output" (click)="addOutput(block)">
					<span class="line top"></span>
					<span class="line bottom"></span>
				</button>
				<div class="text-block">
					<p>{{ 'GENERAL.TASKS.ADD_OUTPUT.TITLE' | translate }}</p>
					<p class="des">{{ 'GENERAL.TASKS.ADD_OUTPUT.INFO' | translate }}</p>
				</div>
			</div>

			<div class="add-else-container" *ngIf="block === 'IF'">
				<button *ngIf="!tasks[taskStructure.selectedTask]?.attributes.ELSE" matRipple [matRippleColor]="'#d4d4d480'" class="add-btn add-output" (click)="addElse()">
					<span class="line top"></span>
					<span class="line bottom"></span>
				</button>
				<button *ngIf="tasks[taskStructure.selectedTask]?.attributes.ELSE" matRipple [matRippleColor]="'#d4d4d480'" class="add-btn add-output remove" (click)="removeElse()">
					<ion-icon name="trash"></ion-icon>
				</button>
				<div class="text-block">
					<p>{{ (tasks[taskStructure.selectedTask]?.attributes.ELSE ?  ('GENERAL.TASKS.REMOVE_ELSE.TITLE' | translate) : ('GENERAL.TASKS.ADD_ELSE.TITLE' | translate) ) }}</p>
					<p class="des">{{ (tasks[taskStructure.selectedTask]?.attributes.ELSE ?  ('GENERAL.TASKS.REMOVE_ELSE.INFO' | translate) : ('GENERAL.TASKS.ADD_ELSE.INFO' | translate) ) }}</p>
				</div>
			</div>
		</ng-template>

		<ng-template #BLOCK_INPUTS let-inputs="inputs">
			<ng-container *ngIf="inputs">
				<div class="block-inputs">
					<div class="input-text">
						<p>Input:</p>
					</div>
					<div class="input-param" *ngFor="let input of inputs">
						<p class="input-key">{{input.variable}}</p>
						<input class="input-value" [(ngModel)]="input.value" placeholder="{{input.value}}">
					</div>
				</div>
			</ng-container>
		</ng-template>

		<ng-template #BLOCK_OPERATORS let-operators="operators" let-key>
			<ng-container *ngIf="operators">
				<div class="block-operators">
					<div class="input-text"><p>Operator:</p></div>
					<div class="input-param">
						<ng-select 
							class="break"
							[items]="operators"
							[searchable]="false"
							[clearable]="false"
							[(ngModel)]="tasks[taskStructure.selectedTask].attributes[key].compare.operator">
							<ng-template ng-option-tmp let-item="item" let-index="index">
							   	<span class="label">{{item}}</span>
							</ng-template>
						</ng-select>
						<ng-container *ngIf="!task.getOperators(tasks[taskStructure.selectedTask].attributes[key].name, 'operatorParam')">
							<input 
								*ngIf="task.operatorOptions[tasks[taskStructure.selectedTask].attributes[key].compare.operator].type === 'input'"
								class="input-value" 
								[(ngModel)]="tasks[taskStructure.selectedTask].attributes[key].compare.to" 
								placeholder="{{tasks[taskStructure.selectedTask].attributes[key].compare.to}}
							">
						</ng-container>
						<ng-container *ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[key].name, 'operatorParam')">
							<timepicker
								class="input-value"
								*ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[key].name, 'operatorParam') === 'timepicker'"
								[customMode]="true"
								[fixBtnHeight]="true"
								[(ngModel)]="tasks[taskStructure.selectedTask].attributes[key].compare.to"
								(onTimeChange)="tasks[taskStructure.selectedTask].attributes[key].compare.to = $event">
							</timepicker>
							<ng-select 
								*ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[key].name, 'operatorParam') === 'select'"
								class="break right"
								[items]="task.getOperators(tasks[taskStructure.selectedTask].attributes[key].name, 'operatorValues')"
								[searchable]="true"
								[clearable]="false"
								[(ngModel)]="tasks[taskStructure.selectedTask].attributes[key].compare.to">
								<ng-template ng-option-tmp let-item="item" let-index="index">
								   	<span class="label">{{item}}</span>
								</ng-template>
							</ng-select>
						</ng-container>
					</div>
				</div>
			</ng-container>
		</ng-template>

		<ng-template #BLOCK_OUTPUTS let-outputs="outputs" let-key>
			<ng-container *ngIf="outputs">
				<div class="block-outputs">
					<div class="input-text"><p>Output:</p></div>
					<ng-container *ngFor="let output of outputs; let first = first; let last = last; let i = index;">
						<div class="output-container">
							<button *ngIf="!first" class="remove-output" matRipple [matRippleColor]="'#d4d4d480'" (click)="removeOutput(i, key)">
								<ion-icon name="trash"></ion-icon>
							</button>
							<div class="input-param">
								<p class="input-key">Select Output:</p>
								<ng-select 
									class="break"
									[items]="task.outputOptions"
									[searchable]="false"
									[clearable]="false"
									bindLabel="variable"
									bindValue="variable"
									[(ngModel)]="output.variable">
									<ng-template ng-option-tmp let-item="item" let-index="index">
									   	<span class="label">{{item.variable}}</span>
									</ng-template>
								</ng-select>
							</div>
							<ng-container *ngIf="output.variable">
								<div class="input-param select-output" [ngClass]="{ last: last }">
									<p class="input-key">Select Param:</p>
									<ng-select 
										class="break"
										*ngIf="output.variable === 'hide_room'"
										[items]="structure.rooms"
										[searchable]="false"
										[clearable]="false"
										bindLabel="name"
										bindValue="UID"
										[(ngModel)]="output.value">
										<ng-template ng-option-tmp let-item="item" let-index="index">
										   	<span class="label">{{item.name}}</span>
										</ng-template>
									</ng-select>
									<ng-select 
										class="break"
										*ngIf="output.variable === 'hide_component'"
										[items]="components"
										[searchable]="true"
										[clearable]="false"
										bindLabel="text"
										bindValue="ID"
										[(ngModel)]="output.value">
										<ng-template ng-option-tmp let-item="item" let-index="index">
										   	<span class="label">{{item.text}}</span>
										</ng-template>
									</ng-select>
									<ng-select 
										class="break"
										*ngIf="output.variable === 'change_room'"
										[items]="structure.rooms"
										[searchable]="false"
										[clearable]="false"
										bindLabel="name"
										bindValue="UID"
										[(ngModel)]="output.value">
										<ng-template ng-option-tmp let-item="item" let-index="index">
										   	<span class="label">{{item.name}}</span>
										</ng-template>
									</ng-select>
									<ng-select 
										class="break"
										*ngIf="output.variable === 'play_sound' || output.variable === 'vibration'"
										[items]="output.variable === 'play_sound' ? [1,2,3,4] : [0.2, 0.5, 1, 2]"
										[searchable]="false"
										[clearable]="false"
										(change)="nativeDemo(output.variable, $event)"
										[(ngModel)]="output.value">
									</ng-select>
									<input 
										*ngIf="output.variable === 'show_alert'"
										class="input-value" 
										[(ngModel)]="output.value" 
										placeholder="{{output.value}}
									">
								</div>
							</ng-container>
						</div>
					</ng-container>
				</div>
			</ng-container>
		</ng-template>
	`,
	styleUrls: ['./room-tasks-style.scss']
})
export class TasksRoomComponent implements OnInit{
	// show/hide task menu
	public showPopup: boolean = false;
	public showTaskConfigurator: boolean = false;

	// list of tasks to load from app storage
	public tasks: any;

	// list of all components in rooms
	public components:Array<any> = [];

	// task info for task creation
	public taskInfo: any = {
		name: '',
		description: ''
	};

	// code structure of selected elem
	public taskStructure: any = {
		selectedTask: null
	};

	constructor(
		public settings: SettingsService,
		private fhem: FhemService,
		private storage: StorageService,
		public modalCtrl: ModalController,
		public task: TasksService,
		private toast: ToastService,
		public structure: StructureService,
		private translate: TranslateService,
		private native: NativeFunctionsService) {
	}

	// walkaround for object sorting
	orderItems(val){return 0;}

	// load tasks from storage
	public loadTasks(){
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

	ngOnInit(){
		this.loadTasks();
	}

	// create a task
	public createTask(){
		if(this.taskInfo.name !== ''){
			this.task.createTask(this.taskInfo.name, this.taskInfo.description).then((res)=>{
				this.tasks = res;
				this.resetValues();
			});
		}
	}

	// cahnge task name and des
	public changeTaskName(){
		this.task.changeTask(
			this.taskStructure.selectedTask,{
				name: this.taskInfo.name,
				description: this.taskInfo.description
		}).then((res)=>{
			this.tasks = res;
			this.resetValues();
		});
	}

	// add output parameters
	public addOutput(param){
		let output = this.tasks[this.taskStructure.selectedTask].attributes[param].output;
		output.push({});
	}

	// remove output
	public removeOutput(index, param){
		this.tasks[this.taskStructure.selectedTask].attributes[param].output.splice(index, 1);
	}

	// add else block
	public addElse(){
		this.tasks[this.taskStructure.selectedTask].attributes.ELSE = {
			output: [{variable: '', value: ''}]
		};
	}

	// remove else block
	public removeElse(){
		delete this.tasks[this.taskStructure.selectedTask].attributes.ELSE;
	}

	// cahnge task properties
	public changeTaskAttributes(){
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
			this.task.changeTask(
				this.taskStructure.selectedTask,{
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

	public resetValues(){
		this.showPopup = false;
		this.taskInfo = {
			name: '',
			description: ''
		};
		this.showTaskConfigurator = false;
		this.taskStructure.selectedTask = null;

		this.loadTasks();
	}

	public editTask(index){
		this.taskStructure.selectedTask = index;
		this.taskInfo = {
			name: this.tasks[index].name,
			description: this.tasks[index].description
		};
		this.showPopup = true;
	}

	public removeTask(index){
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
	    			},
				]
			}
		)
	}

	// demo of native feedback
	public nativeDemo(param, value){
		if(param === 'play_sound'){
			this.native.playAudio(value);
		}else{
			this.native.vibrate(value);
		}
	}

	public configTask(index){
		this.taskStructure.selectedTask = index;
		this.showTaskConfigurator = true;
	}

	// FhemNative code blocks
	public updateAttributes(event, condition){
		this.tasks[this.taskStructure.selectedTask].attributes[condition] = {
			compare: {operator: '=', to: ''},
			name: event.name,
			output: this.tasks[this.taskStructure.selectedTask].attributes[condition].output
		};
		// check if task has inputs
		if(event.inputs){
			this.tasks[this.taskStructure.selectedTask].attributes[condition].inputs = event.inputs;
		}
	}
}