import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef } from '@angular/core';

// Drag and Drop
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Components
import { IonicModule } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';
import { SwitchComponentModule } from '../../switch/switch.component';
import { SelectComponentModule } from '../../select/select.component';
import { PickerComponentModule } from '../../picker/picker.component';

// Services
import { FhemService } from '../../../services/fhem.service';
import { TimeService } from '../../../services/time.service';
import { SettingsService } from '../../../services/settings.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { StructureService } from '../../../services/structure.service';
import { SelectComponentService } from '../../../services/select-component.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

// Interfaces
import { ComponentSettings, CustomComponentInputs, DynamicComponentDefinition, FhemDevice } from '../../../interfaces/interfaces.type';

import * as d3 from 'd3';
import { ChartService } from '../fhem-chart/fhem-chart.service';

@Component({
	selector: 'fhem-weather',
	templateUrl: './fhem-weather.component.html',
  	styleUrls: ['../fhem-chart/fhem-chart.component.scss'],
  	providers: [ ChartService ],
})
export class FhemWeatherComponent implements OnInit, OnDestroy {
	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() arr_data_fhemModule!: string[];
	@Input() arr_data_style!: string[];

	@Input() bool_data_showCurrentDayDetails!: boolean;
	@Input() bool_data_showDayBorder!: boolean;

	@Input() style_dayBorderColor!: string;

	// custom inputs
	// Axis properties
	@Input() data_leftMaxY!: string;
	@Input() data_rightMaxY!: string;
	@Input() data_leftMinY!: string;
	@Input() data_rightMinY!: string;
	@Input() data_leftLabelExtension!: string;
	@Input() data_rightLabelExtension!: string;
	// graph properties
	@Input() arr_data_readings: string[] = [];
	@Input() arr_data_chartTypes: string[] = [];
	@Input() arr_data_forAxis: string[] = [];
	@Input() arr_data_colors: any = [];
	@Input() arr_data_displayLabels: boolean[] = [];
	@Input() arr_data_labelExtensions: string[] = [];

	// position information
	@Input() width!: string;
	@Input() height!: string;
	@Input() top!: string;
	@Input() left!: string;
	@Input() zIndex!: number;

	fhemDevice!: FhemDevice|null;
	// custom input properties
	private customInputs!: CustomComponentInputs;
	// data state
	noData: boolean = true;
	// edit chart properties
	showEditButton: boolean = false;
	showChartConfig: boolean = false;

	// custom input properties
	// get readings out of log file
	readings: string[] = [];
	// chart types to select and combine
	chartTypes: string[] = ['bar', 'line', 'area'];
	// chart types, that can be combined
	chartTypesCombine: string[] = ['bar', 'line', 'area'];
	// time aggregation levels
	timeFormats: string[] = ['%Y-%m-%d', '%d-%b-%y', '%Y-%m', '%d.%m.%Y', '%m.%Y', '%d.%m', '%d.%m.%Y %H', '%d.%m.%Y %H:%M', '%d.%m.%Y %H:%M:%S'];
	// aggregation types
	aggregations: string[] = ['median', 'sum', 'mean', 'min', 'max', 'variance', 'deviation'];
	// label endings
	labelEndings: string[] = ['%', '\xB0C', '€', '$'];

	// raw data
	private rawData: Array<{date: any, reading: string, value: any}> = [];
	// formatted data
	private data: any;
	private dates: any = [];

	// chart properties
	private svg: any;

	ngOnInit(){
		if(this.data_device !== ''){
			this.fhem.getDevice(this.ID, this.data_device, (device: FhemDevice)=>{
				this.getData(device);
			}).then((device: FhemDevice|null)=>{
				this.getData(device);
			});
		}
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
		// assign while resize handle
		this.selectComponent.addHandle(this.ID, 'resize', (dimensions: {[key: string]: number})=>{
			if(!this.noData && this.arr_data_readings.length > 0){
				// redraw charts
				this.chart.createCharts(
					this.ref.nativeElement.querySelector('.chart'),
					this.arr_data_chartTypes,
					{w: dimensions.width, h: dimensions.height},
					this.data,
					this.dates
				);
			}
		});
	}

	// load the additional component information
	private loadCustomInputs(): void{
		// load the additional information
		this.componentLoader.assignCustomInputData(this.ID, 'Weather').then((customInputs: any)=>{
			// assign colors as array
			customInputs.arr_data_colors.forEach((color: string, index: number)=>{
				if(typeof color === 'string'){
					customInputs.arr_data_colors[index] = color.split(',');
				}
			});
			this.customInputs = customInputs;
			// check if there is relevant information already defined
			if(this.arr_data_readings.length > 0){
				this.getDataFormatted();
				// initialize chart
				this.chart.init(
					'%Y-%m-%d',
					this.arr_data_forAxis,
					this.arr_data_displayLabels,
					this.data_leftMinY !== '' ? parseFloat(this.data_leftMinY) : 0,
					this.data_leftMaxY !== '' ? parseFloat(this.data_leftMaxY) : 0,
					this.data_rightMinY !== '' ? parseFloat(this.data_rightMinY) : 0,
					this.data_rightMaxY !== '' ? parseFloat(this.data_rightMaxY) : 0,
					this.data_leftLabelExtension,
					this.data_rightLabelExtension,
					this.arr_data_labelExtensions,
					this.arr_data_colors,
					['mean']
				);

				// create chart
				this.chart.createCharts(
					this.ref.nativeElement.querySelector('.chart'),
					this.arr_data_chartTypes,
					{w: parseFloat(this.width), h: parseFloat(this.height)},
					this.data,
					this.dates
				);
			}
		});
	}

	private getData(device: FhemDevice|null): void{
		this.fhemDevice = device;
		this.rawData = [];
		this.dates = [];
		if(this.fhemDevice){
			if(this.arr_data_fhemModule[0] === 'Proplanta'){
				for(const [key, value] of Object.entries(this.fhemDevice.readings)){
					let val: any = value;
					const relevantReading: RegExpMatchArray|null = key.match(/fc\d+_.+\d+/g);
					if(relevantReading){
						const attr: RegExpMatchArray|null = relevantReading[0].match(/(?<=_).*?(?=\d)/g);
						if(attr){
							const d: RegExpMatchArray|null = relevantReading[0].match(/(?<=fc).*?(?=_)/g);
							const h: RegExpMatchArray|null = relevantReading[0].match(/\d+$/g);
							if(d && h){
								const day: number = parseInt(d[0]);
								const hour: number = parseInt(h[0]);
								// get the date
								let date: Date = this.time.addDay(this.time.local().dateRaw, day);
								date.setHours(hour);
								date.setSeconds(0);
								date.setMilliseconds(0);
								date.setMinutes(0);

								date = date;
								if(!isNaN(val.Value)){
									// add to raw data
									this.rawData.push({ date: date, reading: attr[0], value: val.Value });

									// add to dates
									if(!this.dates.includes(date)){
										this.dates.push(date);
									}

									// add to readings
									if(!this.readings.includes(attr[0])){
										this.readings.push(attr[0]);
									}
								}
							}
						}
					}
				}
			}
		}
		if(this.rawData.length > 0){
			// sort the timestamps
			this.dates.sort();
			let uniqueDates = this.dates.map((d: Date) => d.getTime()).filter((date: string, i: null, array: Array<any>)=> {
    			return array.indexOf(date) === i;
 			}).map((time: string)=> new Date(time));
 			this.dates = uniqueDates;
			// convert time
			this.loadCustomInputs();
		}
	}

	private getDataFormatted(): void{
		this.data = {};
		this.arr_data_readings.forEach((reading: string, index: number)=>{
			const readingData = this.rawData.filter(x=> x.reading === reading).map(({date, value})=>({date: date, value: + value}));
			if(readingData){
				// assign index instead of reading name, to allow duplicates
				this.data[index] = readingData;
				this.data[index].sort((a: any, b: any) => (a.date > b.date) ? 1 : -1);
			}
		});
		if(this.data){
			this.noData = false;
		}
	}

	editChart(): void{
		this.showChartConfig = !this.showChartConfig;
	}

	// add new graph block
	addGraph(): void{
		// graph assign
		this.arr_data_chartTypes.push(this.chartTypes[0]);
		this.arr_data_forAxis.push('left');
		this.arr_data_readings.push(this.readings[0]);
		this.arr_data_colors.push(['#14a9d5']);
		this.arr_data_displayLabels.push(true);
		this.arr_data_labelExtensions.push(this.labelEndings[0]);
	}

	// remove graph block
	removeGraph(index: number): void{
		this.arr_data_chartTypes.splice(index, 1);
		this.arr_data_forAxis.splice(index, 1);
		this.arr_data_readings.splice(index, 1);
		this.arr_data_colors.splice(index, 1);
		this.arr_data_displayLabels.splice(index, 1);
		this.arr_data_labelExtensions.splice(index, 1);
	}

	// save the configuration
	saveChartConfig(): void{
		let component = this.structure.getComponent(this.ID);
		if(component && this.customInputs){
			// assign props
			this.customInputs.data_leftMaxY = this.data_leftMaxY;
			this.customInputs.data_rightMaxY = this.data_rightMaxY;
			this.customInputs.data_leftMinY = this.data_leftMinY;
			this.customInputs.data_rightMinY = this.data_rightMinY;
			this.customInputs.data_leftLabelExtension = this.data_leftLabelExtension;
			this.customInputs.data_rightLabelExtension = this.data_rightLabelExtension;
			// write to component
			component['customInputs'] = this.customInputs;
			// assign as change
			this.undoManager.addChange();
			// reload attributes
			this.loadCustomInputs();
		}
	}

	// drag start
	onDragStart(): void{
		// remove unfold items
		this.arr_data_chartTypes.forEach((item: string, index: number)=>{
			const elem: HTMLElement = this.ref.nativeElement.querySelector('#config-data-' + index);
			elem.classList.remove('unfold');
		});
	}

	// reorder graphs
	reorderGraphs(event: any): void{
		if(event.previousIndex !== event.currentIndex){
			// move items
			moveItemInArray(this.arr_data_chartTypes, event.previousIndex, event.currentIndex);
			moveItemInArray(this.arr_data_forAxis, event.previousIndex, event.currentIndex);
			moveItemInArray(this.arr_data_readings, event.previousIndex, event.currentIndex);
			moveItemInArray(this.arr_data_colors, event.previousIndex, event.currentIndex);
			moveItemInArray(this.arr_data_displayLabels, event.previousIndex, event.currentIndex);
			moveItemInArray(this.arr_data_labelExtensions, event.previousIndex, event.currentIndex);
			// reload attributes
			this.loadCustomInputs();
		}
	}

	// unfold/fold
	unfoldItem(index: number): void{
		const elem: HTMLElement = this.ref.nativeElement.querySelector('#config-data-' + index);
		elem.classList.toggle('unfold');
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.selectComponent.removeHandle(this.ID, 'resize');
	}

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		private time: TimeService,
		private chart: ChartService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Weather',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'arr_data_fhemModule', default: 'Proplanta'},
				{variable: 'bool_data_showCurrentDayDetails', default: false},
				{variable: 'bool_data_showDayBorder', default: false},
				{variable: 'style_dayBorderColor', default: '#272727'},
				{variable: 'arr_data_style', default: 'standard,NM-IN,NM-OUT'}
			],
			customInputs:{
				data_leftMaxY: '',
				data_rightMaxY: '',
				data_leftMinY: '',
				data_rightMinY: '',
				data_leftLabelExtension: '',
				data_rightLabelExtension: '',
				arr_data_readings: [],
				arr_data_chartTypes: [],
				arr_data_forAxis: [],
				arr_data_colors: [],
				arr_data_displayLabels: [],
				arr_data_labelExtensions: []
			},
			dependencies:{
				style_dayBorderColor: { dependOn: 'bool_data_showDayBorder', value: true }
			},
			dimensions: {minX: 150, minY: 80}
		};
	}
}
@NgModule({
	imports: [
		IonicModule,
		FhemComponentModule,
		SwitchComponentModule,
		SelectComponentModule,
		PickerComponentModule
	],
  	declarations: [FhemWeatherComponent]
})
class FhemWeatherComponentModule {}