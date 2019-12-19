import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../services/settings.service';
import { FhemService } from '../../services/fhem.service';
import { StorageService } from '../../services/storage.service';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { StructureService } from '../../services/structure.service';

import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import * as beautify from 'js-beautify';

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
					<div class="text">
						<p>{{ 'GENERAL.TASKS.CHANGE_TASK.TITLE' | translate }}</p>
						<p class="des">{{ 'GENERAL.TASKS.CHANGE_TASK.INFO' | translate }}</p>
					</div>
					<ng-select 
						class="break"
						[items]="options"
						[searchable]="false"
						[(ngModel)]="options[0]"
						(change)="loadTasks()">
						<ng-template ng-option-tmp let-item="item" let-index="index">
						   	<span class="label">{{item}}</span>
						</ng-template>
					</ng-select>
				</div>

				<ng-container *ngIf="tasks && options[0] === 'Fhem Notifys'">
					<div class="task" *ngFor="let task of tasks; let i = index;">
						<div class="label-container">
							<p>{{task.device}}</p>
							<p *ngIf="task.internals?.REGEXP" class="des">{{ task.internals.REGEXP }}</p>
						</div>
						<div class="button-container single">
							<button class="btn-icon" matRipple [matRippleColor]="'#d4d4d480'" (click)="configTask(i, 'notify')">
						    	<ion-icon name="build"></ion-icon>
						    </button>
						</div>
					</div>
				</ng-container>
				<ng-container *ngIf="options[0] === 'FhemNative'">
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
								<button class="btn-icon" matRipple [matRippleColor]="'#d4d4d480'" (click)="configTask(i, 'FhemNative')">
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
				</ng-container>
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
				<ng-container *ngIf="options[0] === 'FhemNative'">
					<div class="graph-container">
						<div class="code-block" *ngFor="let block of tasks[taskStructure.selectedTask].attributes | keyvalue">
							<div class="block-container" [ngClass]="block.key">
								<div class="block-definition">
									<p class="block-condition">{{block.key}}</p>
									<ng-select 
										class="break"
										[items]="task.taskOptions"
										[searchable]="false"
										[clearable]="false"
										bindLabel="name"
										bindValue="name"
										[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].name"
										(change)="updateAttributes($event, block.key)">
										<ng-template ng-option-tmp let-item="item" let-index="index">
										   	<span class="label">{{item.name}}</span>
										</ng-template>
									</ng-select>
								</div>
								<div class="block-inputs" *ngIf="tasks[taskStructure.selectedTask].attributes[block.key].inputs">
									<div class="input-text">
										<p>Input:</p>
									</div>
									<div class="input-param" *ngFor="let input of tasks[taskStructure.selectedTask].attributes[block.key].inputs">
										<p class="input-key">{{input.variable}}</p>
										<input class="input-value" [(ngModel)]="input.value" placeholder="{{input.value}}">
									</div>
								</div>
								<div class="block-operators" *ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operators')">
									<div class="input-text">
										<p>Operator:</p>
									</div>
									<div class="input-param">
										<ng-select 
											class="break"
											[items]="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operators')"
											[searchable]="false"
											[clearable]="false"
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].compare.operator">
											<ng-template ng-option-tmp let-item="item" let-index="index">
											   	<span class="label">{{item}}</span>
											</ng-template>
										</ng-select>

										<ng-container *ngIf="!task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operatorParam')">
											<input 
												*ngIf="task.operatorOptions[tasks[taskStructure.selectedTask].attributes[block.key].compare.operator].type === 'input'"
												class="input-value" 
												[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].compare.to" 
												placeholder="{{tasks[taskStructure.selectedTask].attributes[block.key].compare.to}}
											">
										</ng-container>

										<ng-container *ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operatorParam')">
											<timepicker
												class="input-value"
												*ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operatorParam') === 'timepicker'"
												[customMode]="true"
												[fixBtnHeight]="true"
												[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].compare.to"
												(onTimeChange)="tasks[taskStructure.selectedTask].attributes[block.key].compare.to = $event">
											</timepicker>
											<ng-select 
												*ngIf="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operatorParam') === 'select'"
												class="break right"
												[items]="task.getOperators(tasks[taskStructure.selectedTask].attributes[block.key].name, 'operatorValues')"
												[searchable]="true"
												[clearable]="false"
												[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].compare.to">
												<ng-template ng-option-tmp let-item="item" let-index="index">
												   	<span class="label">{{item}}</span>
												</ng-template>
											</ng-select>
										</ng-container>
									</div>
								</div>
								<div class="block-outputs" *ngIf="tasks[taskStructure.selectedTask].attributes[block.key].compare.to !== ''">
									<div class="input-text">
										<p>Output:</p>
									</div>
									<div class="input-param">
										<p class="input-key">Select Output:</p>
										<ng-select 
											class="break"
											[items]="task.outputOptions"
											[searchable]="false"
											[clearable]="false"
											bindLabel="variable"
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].output">
											<ng-template ng-option-tmp let-item="item" let-index="index">
											   	<span class="label">{{item.variable}}</span>
											</ng-template>
										</ng-select>
									</div>
									<div class="input-param last" *ngIf="tasks[taskStructure.selectedTask].attributes[block.key].output.variable">
										<p class="input-key">Select Param:</p>
										<ng-select 
											class="break"
											*ngIf="tasks[taskStructure.selectedTask].attributes[block.key].output.variable === 'hide_room'"
											[items]="structure.rooms"
											[searchable]="false"
											[clearable]="false"
											bindLabel="name"
											bindValue="UID"
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].output.value">
											<ng-template ng-option-tmp let-item="item" let-index="index">
											   	<span class="label">{{item.name}}</span>
											</ng-template>
										</ng-select>
										<ng-select 
											class="break"
											*ngIf="tasks[taskStructure.selectedTask].attributes[block.key].output.variable === 'hide_component'"
											[items]="components"
											[searchable]="true"
											[clearable]="false"
											bindLabel="text"
											bindValue="ID"
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].output.value">
											<ng-template ng-option-tmp let-item="item" let-index="index">
											   	<span class="label">{{item.text}}</span>
											</ng-template>
										</ng-select>
										<ng-select 
											class="break"
											*ngIf="tasks[taskStructure.selectedTask].attributes[block.key].output.variable === 'change_room'"
											[items]="structure.rooms"
											[searchable]="false"
											[clearable]="false"
											bindLabel="name"
											bindValue="UID"
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].output.value">
											<ng-template ng-option-tmp let-item="item" let-index="index">
											   	<span class="label">{{item.name}}</span>
											</ng-template>
										</ng-select>
										<input 
											*ngIf="tasks[taskStructure.selectedTask].attributes[block.key].output.variable === 'show_alert'"
											class="input-value" 
											[(ngModel)]="tasks[taskStructure.selectedTask].attributes[block.key].output.value" 
											placeholder="{{tasks[taskStructure.selectedTask].attributes[block.key].output.value}}
										">
									</div>
								</div>
							</div>
						</div>
					</div>
				</ng-container>
				<ng-container *ngIf="options[0] === 'Fhem Notifys'">
					<ngx-codemirror
					  [(ngModel)]="taskStructure.code"
					  [options]="{
					    lineNumbers: true,
					    theme: 'material',
					    mode: 'javascript'
					  }"
					></ngx-codemirror>
				</ng-container>
				<button ion-button class="btn submit half" (click)="options[0] === 'FhemNative' ? changeTaskAttributes() : saveNotify()">{{'GENERAL.BUTTONS.SAVE' | translate}}</button>
				<button ion-button class="btn cancel half" (click)="resetValues()">{{'GENERAL.BUTTONS.CANCEL' | translate}}</button>
			</div>
		</popup>
	`,
	styles: [`
		.page{
			padding: 10px;
		}
		.add-btn{
			position: absolute;
			right: 8px;
			width: 45px;
			height: 45px;
			border-radius: 50%;
			background: #ffffff;
			border: none;
			box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
			top: 50%;
    		transform: translateY(-50%);
		}
		.add-btn:hover .line.top{
			transform: translate3d(-50%, -50%,0) rotate(90deg);
		}
		.add-btn:hover .line.bottom{
			transform: translate3d(-50%, -50%,0) rotate(180deg);
		}
		.line{
			position: absolute;
			left: 50%;
			top: 50%;
			width: 60%;
			height: 5px;
			background: var(--gradient);
			border-radius: 5px;
			transition: all .3s ease;
		}
		.line.top{
			transform: translate3d(-50%, -50%,0);
		}
		.line.bottom{
			transform: translate3d(-50%, -50%,0) rotate(90deg);
		}
		.btn{
			font-family: "Roboto", sans-serif;
			text-transform: uppercase;
			outline: 0;
			width: 100%;
			border: 0;
			padding: 15px;
			color: #FFFFFF;
			font-size: 14px;
			transition: all 0.3 ease;
			cursor: pointer;
			margin-top: 5px;
			margin-bottom: 5px;
		}
		.btn.half{
			width: calc(50% - 10px);
			margin-left: 5px;
    		margin-right: 5px;
    		margin-top: 0px;
			margin-bottom: 0px;
		}
		.btn.submit{
			background: var(--btn-green);
		}
		.btn.cancel{
			background: var(--btn-red);
		}
		.des{
			color: var(--p-small) !important;
			font-size: .8em;
			white-space: normal;
			margin-top: -10px;
		}
		.inp{
			position: relative;
			font-size:18px;
			padding:10px 10px 10px 5px;
			display:block;
			width:100%;
			border:none;
			border-bottom:1px solid #757575;
			color: #757575;
		}
		.inp:focus{ outline:none; }
		.bar{ 
			position:relative; 
			display:block; 
			width:100%; 
			left: 0%;
		}
		.bar:before, .bar:after{
		  	content:'';
			height:2px;
			width:0;
			bottom:1px; 
			position:absolute;
			background: var(--btn-blue); 
			transition:0.2s ease all;
		}
		.bar:before {
			left:50%;
		}
		.bar:after {
			right:50%; 
		}
		.inp:focus ~ .bar:before, .inp:focus ~ .bar:after {
			width:50%;
		}
		.task{
			position: relative;
			border-bottom:1px solid #757575;
			height: 50px;
			width: 100%;
		}
		.label-container{
			width: calc(100% - 140px);
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
		}
		.label-container p{
			margin-top: 5px;
			margin-bottom: 0px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.button-container{
			width: 140px;
			height: 100%;
			position: absolute;
			top: 0;
			right: 0;
		}
		.button-container.single{
			width: 45px;
		}
		.btn-icon{
			width: 40px;
			height: 40px;
			background: transparent;
			border-radius: 50%;
			font-size: 25px;
			padding: 0px;
			top: 5px;
			margin-left: 3px;
    		margin-right: 3px;
		}
		.select-box{
			width: 100%;
			position: relative;
			border-bottom: 2px solid #757575;
		}
		.select-box .text,
		.block-definition p{
			width: 50%;
			white-space: nowrap;
		  	overflow: hidden;
		  	text-overflow: ellipsis;
		  	display: inline-block;
		}
		.block-definition p{
			width: 30px;
		}
		.select-box ng-select,
		.block-definition ng-select,
		.input-param ng-select{
			width: 45%;
			position: absolute;
			display: inline-block;
			top: 50%;
    		transform: translateY(-50%);
		}
		.select-box ng-select{
			z-index: 10;
		}
		.block-definition ng-select,
		.block-outputs .input-param ng-select{
			right: 5px;
		}
		.input-param ng-select.right{
			right: 5px !important;
			left: auto;
		}
		.graph-container{
			background-color: #263238;
			width: 100%;
			height: 75vh;
			overflow: auto;
		}
		.code-block{
			position: relative;
		    min-height: 100px;
		    border-radius: 10px;
		    padding: 5px;
		    margin-left: 10px;
		    margin-right: 10px;
		    margin-top: 10px;
		}
		.block-definition{
			width: 100%;
			height: 40px;
			border-bottom: 3px solid #757575;
			position: relative;
		}
		.block-container{
			width: 100%;
			height: 100%;
			border-radius: inherit;
		}
		.block-container.IF{
			background: #14a9d5;
		}
		.block-condition{
			color: var(--dark-p);
			top: 50%;
		    position: relative;
		    transform: translateY(-50%);
		    margin: 0;
		    padding-left: 10px;
		}
		.block-operators,
		.block-inputs{
			position: relative;
			border-bottom: 2px solid #757575;
			min-height: 80px;
		}
		.block-outputs{
			position: relative;
			min-height: 80px;
		}
		.input-text{
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 50px;
			border-right: 0.5px solid #757575;
		}
		.input-text p{
			transform: rotate(-90deg);
		}
		.input-key{
			width: 42%;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		    position: absolute;
		    margin: 0;
		    left: 5px;
		    line-height: 40px;
		}
		.input-param{
			height: 46px;
		    width: calc(100% - 50px);
		    left: 50px;
		    position: relative;
		    border-bottom: 0.5px solid #757575;
		}
		.block-outputs .input-param.last{
			border-bottom: 0px;
		}
		.input-param .input-value{
			position: absolute;
		    right: 5px;
		    height: 36px;
		    top: 50%;
		    width: 45%;
		    border: none;
		    transform: translateY(-50%);
		}
		.block-operators .input-param{
			height: 80px;
		}
		.block-definition ng-select{
			z-index: 11;
		}
		.block-operators ng-select{
			z-index: 10;
			left: 5px;
		}
		.block-outputs ng-select{
			z-index: 9;
		}
		.block-outputs .last ng-select{
			z-index: 8;
		}
		timepicker{
			background: #fff;
		}

		.dark p,
		.dark input,
		.dark .back-btn ion-icon,
		.dark .btn-icon ion-icon{
			color: var(--dark-p);
		}
		ion-content.dark,
		.dark ion-toolbar{
			--background: var(--dark-bg);
		}
		.dark .add-btn,
		.dark input,
		.dark timepicker{
			background: var(--dark-bg);
		}
		.back-btn{
			background: transparent;
			float: left;
			font-size: 30px;
			margin-left: 8px;
		}
		ion-title{
			transform: translateY(5px);
		}
		button:focus{
			outline: 0px;
		}
	`]
})
export class TasksRoomComponent implements OnInit{
	// list of selectable options for tasks
	public options: Array<string> = [
		'FhemNative', 'Fhem Notifys'
	];
	// show/hide task menu
	public showPopup: boolean = false;
	public showTaskConfigurator: boolean = false;

	// list of tasks to load (from app storage or fhem)
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
		selectedTask: null,
		code: '',
		graph: ''
	};

	constructor(
		public settings: SettingsService,
		private fhem: FhemService,
		private storage: StorageService,
		public modalCtrl: ModalController,
		public task: TasksService,
		private toast: ToastService,
		public structure: StructureService,
		private translate: TranslateService) {
	}

	public loadTasks(){
		if(this.options[0] === 'Fhem Notifys'){
			let gotReply: boolean = false;
			const t = this.fhem.devicesListSub.subscribe(next=>{
				gotReply = true;
				t.unsubscribe();
				this.tasks = next;
				console.log(next)
			});
			this.fhem.listDevices('TYPE=notify');
			setTimeout(()=>{
				if(!gotReply){
					t.unsubscribe();
					// no response from fhem
				}
			}, 2000);
		}
		if(this.options[0] === 'FhemNative'){
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

	// cahnge task properties
	public changeTaskAttributes(){
		// check if all relevant information is filled in
		let allFilled: boolean = true;
		const taskValues = this.tasks[this.taskStructure.selectedTask].attributes;
		for(const key of Object.keys(taskValues)){
			if(
				taskValues[key].compare.to === '' ||
				!taskValues[key].output.value ||
				taskValues[key].output.value == ''
			){
				allFilled = false;
			}
		}
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
		this.task.removeTask(index).then((res)=>{
			this.tasks = res;
			this.task.getHideElements();
		});
	}

	public configTask(index, type){
		this.taskStructure.selectedTask = index;
		if(type === 'notify'){
			this.taskStructure.code = this.tasks[index].internals.DEF;
		}
		if(type === 'FhemNative'){
			this.taskStructure.code = '';
		}
		this.showTaskConfigurator = true;
	}

	public saveNotify(){
		let command = '/fhem?cmd.modify' + this.tasks[this.taskStructure.selectedTask].device + '%3Dmodify%20'+this.tasks[this.taskStructure.selectedTask].device;

		// console.log(this.tasks[this.taskStructure.selectedTask]);

		// console.log(this.taskStructure.code);
	}

	// FhemNative code blocks
	public updateAttributes(event, condition){
		this.tasks[this.taskStructure.selectedTask].attributes[condition] = {
			compare: {operator: '=', to: ''},
			name: event.name,
			output: {}
		};
		// check if task has inputs
		if(event.inputs){
			this.tasks[this.taskStructure.selectedTask].attributes[condition].inputs = event.inputs;
		}
	}

	public saveFhemNativeCode(){
		// console.log(this.taskStructure.code);
	}


}