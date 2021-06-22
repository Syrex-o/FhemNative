import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Components
import { IonicModule, ModalController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SelectComponentModule } from '../../components/select/select.component';
import { PopoverComponentModule } from '../../components/popover/popover.component';

// Services
import { FhemService } from '../../services/fhem.service';
import { ToastService } from '../../services/toast.service';
import { VariableService } from '../../services/variable.service';
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';

@Component({
	selector: 'variables',
	templateUrl: './variables.component.html',
	styleUrls: ['./variables.component.scss']
})
export class VariablesComponent implements OnInit {
	// Back button handle ID
	private handleID: string = this.settings.getUID();

	// menus
	menus: {[key: string]: boolean} = {
		createVariable: false,
		configureVariable: false
	};

	// variable info of selected
	variableInfo: any = {
		name: '',
		description: '',
		defSyntax: ''
	};

	// selected variable
	selectedVariable: number = -1; 

	// value previews
	previews: any = {
		inputValue: null,
		regexValue: null
	}

	ngOnInit(){
		this.backBtn.handle(this.handleID, ()=>{
			this.closeVariables();
		});
	}

	// get variable syntax
	getVariableSyntax(name: string): string{
		let defSyntax: string = this.uniqueDefSyntax(name);
		this.variableInfo.defSyntax = defSyntax;
		return defSyntax;
	}

	private uniqueDefSyntax(defSyntax: string): string{
		let sameName = this.variable.storageVariables.find(x=> x.defSyntax === '{' + defSyntax + '}');
		if(
			// new
			(sameName && this.selectedVariable === -1) ||
			// old modify (check for modified name in other variables)
			(sameName && this.selectedVariable !== -1 && sameName.ID !== this.variable.storageVariables[this.selectedVariable].ID)
		){
			const lastChar: RegExpMatchArray|null = defSyntax.match(/.$/);
			if(lastChar){
				if(isNaN(lastChar[0] as any)){
					return this.uniqueDefSyntax(defSyntax + 1);
				}else{
					let modDefSyntax: string = defSyntax.substr(0, defSyntax.length -1);
					return this.uniqueDefSyntax(modDefSyntax + (parseInt(lastChar[0]) + 1))
				}
			}else{
				return '{' + defSyntax + '}';
			}
		}else{
			return '{' + defSyntax + '}';
		}
	}

	closeVariables(): void{
		this.modalCtrl.dismiss();
		this.backBtn.removeHandle(this.handleID);
	}

	openMenu(menu: string): void{
		this.menus[menu] = !this.menus[menu];
	}

	// cancel variable creation/edit
	closeMenu(): void{
		this.resetValues();
		this.variable.listen();
	}

	// save variable creation/config
	save(): void{
		if(this.valueChecker()){
			if(this.selectedVariable !== null){
				this.variable.changeVariable(this.selectedVariable, this.variableInfo).then(()=>{
					this.menus.createVariable = false;
				});
			}else{
				// new variable
				this.variable.createVariable(this.variableInfo).then(()=>{
					this.menus.createVariable = false;
				});
			}
		}
	}

	inputOptions: Array<any> = [];
	getAvailableInputs(selected: string, update?: boolean): void{
		this.inputOptions = [];
		setTimeout(()=>{
			this.inputOptions = this.variable.variableOptions.filter(x=> x.dependOn.includes(selected));
		});
		// changed properties
		if (update && this.selectedVariable !== -1){
			// reset input
			this.variable.storageVariables[this.selectedVariable].attributes.inputOption = {name: ''};
			// reset updater
			this.variable.storageVariables[this.selectedVariable].attributes.updateOption = {name: ''};
			this.updateOptions = [];
			this.updateSelectionOptions = [];
			// reset regex
			this.regexOptions = [];
			this.updateRegexOptions = [];
		}
	}

	// update variable params
	updateInput(selected: string): void{
		let selection = this.variable.variableOptions.find(x=> x.name === selected);
		if(selection && this.selectedVariable !== -1){
			this.variable.storageVariables[this.selectedVariable].attributes.inputOption = {
				name: selected,
				inputs: selection.inputs
			}
			this.getAvailableUpdaters(selected, true);
			this.getAvailableRegex(selected);
		}
	}

	updateOptions: Array<any> = [];
	private getAvailableUpdaters(selected: string, update?: boolean): void{
		if(this.selectedVariable !== -1){
			let updater = this.variable.storageVariables[this.selectedVariable].attributes;
			this.updateOptions = [];
			setTimeout(()=>{
				this.updateOptions = this.variable.updateOptions.filter(x=> x.dependOn.includes(selected));
			});
			// changed properties
			if (update){
				updater.updateOption = {name: ''};
			}
		}
	}

	updateSelectionOptions: Array<any> = [];
	updateUpdater(selected: string, update?: boolean): void{
		let selection = this.variable.updateOptions.find(x=> x.name === selected);
		if(selection && this.selectedVariable !== -1){
			this.updateSelectionOptions = [];
			setTimeout(()=>{
				if((selection as any).options){
					this.updateSelectionOptions = (selection as any).options;
				}
			});

			if(update){
				this.variable.storageVariables[this.selectedVariable].attributes.updateOption = {
					name: selected,
					value: ''
				}
			}
		}
	}

	regexOptions: Array<any> = [];
	private getAvailableRegex(selected: string, update?: boolean): void{
		if(this.selectedVariable !== -1){
			this.regexOptions = [];
			setTimeout(()=>{
				this.regexOptions = this.variable.regexOptions.filter(x=> x.dependOn.includes(selected));
			});

			if(update){
				this.variable.storageVariables[this.selectedVariable].attributes.regexOption = {name: ''};
			}
		}
	}

	updateRegexOptions: Array<any> = [];
	updateRegex(selected: string, update?: boolean): void{
		let selection = this.variable.regexOptions.find(x=> x.name === selected);
		if(selection && this.selectedVariable !== -1){
			this.updateRegexOptions = [];
			setTimeout(()=>{
				if((selection as any).options){
					// preselected regex (quick)
					this.updateRegexOptions = (selection as any).options;
				}else{
					// manual input
					this.updateRegexOptions = ['input'];
				}
			});

			if(update){
				this.variable.storageVariables[this.selectedVariable].attributes.regexOption = {
					name: selected,
					value: ''
				}
			}
		}
	}

	private valueChecker(): boolean{
		if(this.variableInfo.name && this.variableInfo.name !== '' && this.variableInfo.description && this.variableInfo.description !== ''){
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

	private resetValues(): void{
		// reset menus
		this.menus.createVariable = false;
		this.menus.configureVariable = false;

		this.variableInfo = {
			name: '',
			description: '',
			defSyntax: ''
		};
		this.previews = {
			inputValue: null,
			regexValue: null
		};
		this.inputOptions = [];
		this.updateOptions = [];
		this.regexOptions = [];
		
		this.selectedVariable = -1;
	}

	// edit existing varable
	editVariable(index: number): void{
		this.selectedVariable = index;
		this.variableInfo = {
			name: this.variable.storageVariables[index].name,
			description: this.variable.storageVariables[index].description,
			defSyntax: this.variable.storageVariables[index].defSyntax
		};
		this.menus.createVariable = true;
	}

	// config a variable
	configVariable(index: number): void{
		this.variable.unlisten();
		this.selectedVariable = index;
		// open menu
		this.menus.configureVariable = true;
		// get variable inputs on open
		this.getAvailableInputs((this.variable.storageVariables[this.selectedVariable] as any).attributes.type);
		// check if input is defined to show all options
		const relInput: string = this.variable.storageVariables[this.selectedVariable].attributes.inputOption.name;
		if(relInput !== ''){
			this.getAvailableUpdaters(relInput, false);
			this.getAvailableRegex(relInput, false);
			// check if regex is defined
			const attr = this.variable.storageVariables[this.selectedVariable].attributes
			if(attr.regexOption && attr.regexOption.name !== ''){
				this.updateRegex(attr.regexOption.name, false)
			}
		}
	}

	// show content of popup after animation, to reduce lags
	showConfigContent(popupState: boolean): void{
		if(popupState && this.selectedVariable !== -1){
			// get config
			this.getAvailableInputs((this.variable.storageVariables[this.selectedVariable] as any).attributes.type);

			let selectedInput = this.variable.storageVariables[this.selectedVariable].attributes.inputOption;
			if(selectedInput.name && selectedInput.name !== ''){
				this.getAvailableUpdaters(selectedInput.name);
				this.getAvailableRegex(selectedInput.name);
				// get current updater
				if(this.variable.storageVariables[this.selectedVariable].attributes.updateOption.name !== ''){
					this.updateUpdater(this.variable.storageVariables[this.selectedVariable].attributes.updateOption.name);
				}
				// get current regex
				if(this.variable.storageVariables[this.selectedVariable].attributes.regexOption.name !== ''){
					this.updateRegex(this.variable.storageVariables[this.selectedVariable].attributes.regexOption.name);	
				}
			}
		}
	}

	// remove variable
	removeVariable(index: number): void{
		this.toast.showAlert(
			this.translate.instant('GENERAL.VARIABLES.REMOVE_VARIABLE.TITLE'),
			this.translate.instant('GENERAL.VARIABLES.REMOVE_VARIABLE.INFO'),
			{
				buttons: [
					{
						text: this.translate.instant('GENERAL.BUTTONS.CONFIRM'),
						handler: (data: any) => {
							this.variable.storageVariables.splice(index, 1);
							this.variable.changeVariableStorage(this.variable.storageVariables);
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

	// check for all filled attributes
	private fillChecker(): boolean{
		if(this.selectedVariable !== -1){
			let selected = this.variable.storageVariables[this.selectedVariable].attributes;
			let allFilled = true;
			if(!selected.inputOption.inputs){
				allFilled = false;
			}else{
				selected.inputOption.inputs.forEach((attr: any)=>{
					if(attr.value === ''){
						allFilled = false;
					}
				});
			}
			if(allFilled){
				if(selected.type === 'static'){
					return true;
				}else{
					// dynamic test
					if(selected.updateOption.name === ''){
						allFilled = false;
					}else{
						if(selected.updateOption.value === '' && selected.updateOption.name !== 'On Change'){
							allFilled = false;
						}else{
							if(selected.regexOption.name !== '' && selected.regexOption.value === ''){
								allFilled = false;
							}else{
								return true;
							}
						}
					}
				}
			}
		}
		// missing values
		this.toast.showAlert(
			this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.TITLE'),
			this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.INFO'),
			false
		);
		return false;
	}

	saveVariableConfig(): void{
		if(this.fillChecker() && this.selectedVariable !== -1){
			this.variable.changeVariable(this.selectedVariable, this.variable.storageVariables[this.selectedVariable]).then(()=>{
				this.menus.configureVariable = false;
			});
		}
	}

	// preview functions
	async previewValue(type: string){
		if(this.selectedVariable !== -1){
			const selected = this.variable.storageVariables[this.selectedVariable];
			
			if(selected.attributes.type === 'static'){
				let inp = selected.attributes.inputOption.inputs;
				if(inp){
					// last item in static list
					this.previews.inputValue = inp[inp.length -1].value;
				}else{
					return;
				}
			}else{
				let inp = selected.attributes.inputOption.inputs;
				// fhem list 
				if( ['Fhem Value', 'Fhem Internal', 'Fhem Attribute'].includes(selected.attributes.inputOption.name) ){
					let device = inp[0].value;
					let attr = inp[1].value;
					if(device !== ''){
						await this.fhem.getDevice(selected.ID, device).then((dev: any)=>{
							this.fhem.removeDevice(selected.ID);
							if(dev){
								if(selected.attributes.inputOption.name === 'Fhem Value' && attr in dev.readings){
									this.previews.inputValue = Array.isArray(dev.readings[attr].Value) ? JSON.stringify(dev.readings[attr].Value) : dev.readings[attr].Value;
								}
								else if(selected.attributes.inputOption.name === 'Fhem Internal' && attr in dev.internals){
									this.previews.inputValue = dev.internals[attr]
								}
								else if(selected.attributes.inputOption.name === 'Fhem Attribute' && attr in dev.attributes){
									this.previews.inputValue = dev.attributes[attr]
								}
								else{
									this.previews.inputValue = 'Attr not found';
								}
							}else{
								this.previews.inputValue = 'Device not found';
							}
						});
					}
				}
				// fhem get
				if(selected.attributes.inputOption.name === 'Fhem Get'){
					let device = inp[0].value;
					let command = inp[1].value;
					if(device !== '' && command !== ''){
						await this.fhem.get(device, command).then((res: any)=>{
							if(res){
								this.previews.inputValue = res.join(' ');
							}else{
								this.previews.inputValue = 'No response';
							}
						});
					}
				}
			}
			if(type === 'input'){
				return;
			}else{
				// regex
				if(selected.attributes.regexOption.name !== '' && selected.attributes.regexOption.value !== ''){
					// get base config of regex option
					const baseRegex = this.regexOptions.find(x=> x.name === selected.attributes.regexOption.name);
					// regex for match
					let regExp: RegExp = new RegExp(selected.attributes.regexOption.value, '');
					// match number to consider
					let regExIndex: number|string = 0;
					// predefined regex
					if(baseRegex.options){
						const relValue: string = selected.attributes.regexOption.value;
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
							const rel: string = selected.attributes.regexOption.value;
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
									let res = this.previews.inputValue.toString().split(splitted[0]).join(splitted[1]);
									// check for num
									if(isNaN(res)){
										this.previews.regexValue = res;
									}else{
										this.previews.regexValue  = parseFloat(res);
									}
								} catch(e){
									this.previews.regexValue = 'No match';
								}
							}else{
								this.previews.regexValue = 'No match';
							}
						}else{
							let res = this.previews.inputValue.toString().match(regExp);
							if(res){
								if(typeof regExIndex === 'string'){
									let mod = res.join('');
									// check for num
									if(isNaN(mod)){
										this.previews.regexValue = mod;
									}else{
										this.previews.regexValue = parseFloat(mod);
									}
								}else{
									// check for num
									if(isNaN(res[regExIndex])){
										this.previews.regexValue = res[regExIndex];
									}else{
										this.previews.regexValue = parseFloat(res[regExIndex]);
									}
								}
							}else{
								this.previews.regexValue = 'No match';
							}
						}
					}catch(e){
						this.previews.regexValue = 'No match';
					}
				}else{
					this.previews.regexValue = this.previews.inputValue;
				}
			}
		}
	}

	constructor(
		private fhem: FhemService,
		private toast: ToastService,
		public settings: SettingsService,
		public variable: VariableService,
		private modalCtrl: ModalController,
		private backBtn: BackButtonService,
		private translate: TranslateService){

	}
}
@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		IonicModule, 
		TranslateModule,
		SelectComponentModule,
		PopoverComponentModule
	],
	declarations: [VariablesComponent]
})
class VariablesComponentModule {}