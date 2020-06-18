import { Component, OnInit, NgModule } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

// Components
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';

// Services
import { ToastService } from '../../services/toast.service';
import { FhemService } from '../../services/fhem.service';
import { SettingsService } from '../../services/settings.service';
import { BackButtonService } from '../../services/back-button.service';
import { VariableService } from '../../services/variable.service';

// Translate
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'variables',
	templateUrl: './variables.component.html',
	styleUrls: ['./variables.component.scss']
})

export class VariablesComponent implements OnInit {
	// Back button handle ID
	private handleID: string = '_' + Math.random().toString(36).substr(2, 9);

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
	selectedVariable: null|number = null; 

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
	getVariableSyntax(name: string){
		let defSyntax: string = this.uniqueDefSyntax(name);
		this.variableInfo.defSyntax = defSyntax;
		return defSyntax;
	}

	private uniqueDefSyntax(defSyntax: string){
		let sameName = this.variable.storageVariables.find(x=> x.defSyntax === '{' + defSyntax + '}');
		if(
			// new
			(sameName && this.selectedVariable === null) ||
			// old modify (check for modified name in other variables)
			(sameName && sameName.ID !== this.variable.storageVariables[this.selectedVariable].ID)
		){
			let lastChar = defSyntax.match(/.$/)[0];
			if(isNaN(lastChar as any)){
				return this.uniqueDefSyntax(defSyntax + 1);
			}else{
				let modDefSyntax: string = defSyntax.substr(0, defSyntax.length -1);
				return this.uniqueDefSyntax(modDefSyntax + (parseInt(lastChar) + 1))
			}
		}else{
			return '{' + defSyntax + '}';
		}
	}

	closeVariables(){
		this.modalCtrl.dismiss();
		this.backBtn.removeHandle(this.handleID);
	}

	openMenu(menu: string){
		this.menus[menu] = !this.menus[menu];
	}

	// cancel variable creation/edit
	closeMenu(){
		this.resetValues();
		this.variable.listen();
	}

	// save variable creation/config
	save(){
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
	getAvailableInputs(selected: string, update?: boolean){
		this.inputOptions = [];
		setTimeout(()=>{
			this.inputOptions = this.variable.variableOptions.filter(x=> x.dependOn.includes(selected));
		});
		// changed properties
		if (update){
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
	updateInput(selected: string){
		let selection = this.variable.variableOptions.find(x=> x.name === selected);
		this.variable.storageVariables[this.selectedVariable].attributes.inputOption = {
			name: selected,
			inputs: selection.inputs
		}
		this.getAvailableUpdaters(selected, true);
		this.getAvailableRegex(selected);
	}

	updateOptions: Array<any> = [];
	private getAvailableUpdaters(selected: string, update?: boolean){
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

	updateSelectionOptions: Array<any> = [];
	updateUpdater(selected: string, update?: boolean){
		let selection = this.variable.updateOptions.find(x=> x.name === selected);
		this.updateSelectionOptions = [];
		setTimeout(()=>{
			if(selection.options){
				this.updateSelectionOptions = selection.options;
			}
		});

		if(update){
			this.variable.storageVariables[this.selectedVariable].attributes.updateOption = {
				name: selected,
				value: ''
			}
		}
	}

	regexOptions: Array<any> = [];
	private getAvailableRegex(selected: string, update?: boolean){
		this.regexOptions = [];
		setTimeout(()=>{
			this.regexOptions = this.variable.regexOptions.filter(x=> x.dependOn.includes(selected));
		});

		if(update){
			this.variable.storageVariables[this.selectedVariable].attributes.regexOption = {name: ''};
		}
	}

	updateRegexOptions: Array<any> = [];
	updateRegex(selected: string, update?: boolean){
		let selection = this.variable.regexOptions.find(x=> x.name === selected);
		this.updateRegexOptions = [];
		setTimeout(()=>{
			if(selection.options){
				// preselected regex (quick)
				this.updateRegexOptions = selection.options;
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

	private valueChecker(){
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

	private resetValues(){
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
		
		this.selectedVariable = null;
	}

	// edit existing varable
	editVariable(index: number){
		this.selectedVariable = index;
		this.variableInfo = {
			name: this.variable.storageVariables[index].name,
			description: this.variable.storageVariables[index].description,
			defSyntax: this.variable.storageVariables[index].defSyntax
		};
		this.menus.createVariable = true;
	}

	// config a variable
	configVariable(index: number){
		this.variable.unlisten();
		this.selectedVariable = index;
		// open menu
		this.menus.configureVariable = true;
	}

	// show content of popup after animation, to reduce lags
	showConfigContent(popupState: boolean){
		if(popupState){
			// get config
			this.getAvailableInputs(this.variable.storageVariables[this.selectedVariable].attributes.type);

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
	removeVariable(index: number){
		this.toast.showAlert(
			this.translate.instant('GENERAL.VARIABLES.REMOVE_VARIABLE.TITLE'),
			this.translate.instant('GENERAL.VARIABLES.REMOVE_VARIABLE.INFO'),
			{
				buttons: [
					{
						text: this.translate.instant('GENERAL.BUTTONS.CONFIRM'),
						handler: data => {
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
	private fillChecker(){
		let selected = this.variable.storageVariables[this.selectedVariable].attributes;

		let allFilled = true;
		if(!selected.inputOption.inputs){
			allFilled = false;
		}else{
			selected.inputOption.inputs.forEach((attr)=>{
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
		// missing values
		this.toast.showAlert(
			this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.TITLE'),
			this.translate.instant('GENERAL.TASKS.CHANGE_TASK.MISSING.INFO'),
			false
		);
		return false;
	}

	saveVariableConfig(){
		if(this.fillChecker()){
			this.variable.changeVariable(this.selectedVariable, this.variable.storageVariables[this.selectedVariable]).then(()=>{
				this.menus.configureVariable = false;
			});
		}
	}

	// preview functions
	async previewValue(type: string){
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
				let regex = new RegExp(selected.attributes.regexOption.value, '');
				try{
					let res = this.previews.inputValue.toString().match(regex);
					if(res){
						this.previews.regexValue = res[0];
					}else{
						this.previews.regexValue = 'No match'
					}
				} catch(e){
					this.previews.regexValue = e;
				}
			}else{
				this.previews.regexValue = this.previews.inputValue;
			}
		}

	}

	constructor(
		public settings: SettingsService,
		public variable: VariableService,
		private fhem: FhemService,
		private toast: ToastService,
		private modalCtrl: ModalController,
		private backBtn: BackButtonService,
		private translate: TranslateService){

	}
}
@NgModule({
	imports: [ComponentsModule, IonicModule, TranslateModule],
	declarations: [VariablesComponent]
})
class VariablesComponentModule {}