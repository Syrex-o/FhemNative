import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef } from '@angular/core';

// Drag and Drop
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Components
import { IonicModule } from '@ionic/angular';
import { FhemComponentModule } from '../fhem-component.module';
import { SwitchComponentModule } from '../../switch/switch.component';
import { SelectComponentModule } from '../../select/select.component';
import { PickerComponentModule } from '../../picker/picker.component';

// Interfaces
import { ComponentSettings, CustomComponentInputs, DynamicComponentDefinition, FhemDevice } from '../../../interfaces/interfaces.type';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { StructureService } from '../../../services/structure.service';
import { SelectComponentService } from '../../../services/select-component.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

import * as d3 from 'd3';
import { ChartService } from './fhem-chart.service';

@Component({
	selector: 'fhem-chart',
	templateUrl: './fhem-chart.component.html',
	styleUrls: ['./fhem-chart.component.scss'],
	providers: [ ChartService ]
})
export class FhemChartComponent implements OnInit, OnDestroy {
	[key: string]: any;

	@Input() ID!: string;

	@Input() data_device!: string;
	@Input() data_dbDevice!: string;
	@Input() data_logFile!: string;
	@Input() arr_data_dbtype!: string[];
	@Input() arr_data_style!: string[];

	@Input() bool_data_getCurrent!: boolean;

	// custom inputs
	// Axis properties
	@Input() data_leftMaxY!: string;
	@Input() data_rightMaxY!: string;
	@Input() data_leftMinY!: string;
	@Input() data_rightMinY!: string;
	@Input() data_leftLabelExtension!: string;
	@Input() data_rightLabelExtension!: string;
	@Input() data_timeFormat!: string;
	// graph properties
	@Input() arr_data_readings: string[] = [];
	@Input() arr_data_chartTypes: string[] = [];
	@Input() arr_data_forAxis: string[] = [];
	@Input() arr_data_aggregation: string[] = [];
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
	chartTypes: string[] = ['bar', 'line', 'area', 'gauge', 'liquidGauge'];
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
			this.fhem.getDevice(this.ID, this.data_device).then((device: FhemDevice|null)=>{
				this.fhemDevice = device;
				if(device){
					// detect the type to get data --> from type or rejection for unsopported
					this.getRawData( device.internals.TYPE ).then((data: Array<any>)=>{
						// only supported for more then 1 value
						if(data.length > 1){
							// transform data, relevant to data source
							const func: string = 'transform' + device.internals.TYPE + 'Data';
							this[func](data);
							// load custom input data from user
							this.loadCustomInputs();
						}
					}).catch((e)=>{
						console.log(e);
					});
				}
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

	// raw data fetch
	private getRawData(type: string): Promise<any>{
		const sources: string[] = ['FileLog', 'DbLog'];

		return new Promise((resolve, reject)=>{
			// get relevant type
			const found: string|undefined = sources.find(x=> x === type);
			if(found){
				const func: string = 'get' + found + 'Data';
				this.fhem.get(this.data_device, this[func]() ).then((data: any)=>{
					if(data){
						resolve(data);
					}else{
						reject();
					}
				});
			}else{
				reject();
			}
		})
	}

	// logfile request for data
	private getFileLogData(): string{
		const d: Date = new Date();
		const result = [
			// log:
			'',
			// minDate:
			'2000-01-01',
			// maxDate:
			[
				d.getFullYear(),
				(d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1),
				d.getDate() + 1
			].join('-')
		];
		if (this.bool_data_getCurrent && this.fhemDevice) {
			const test = new RegExp('.*(?=' + this.data_device + ')', 'g');
			result[0] = this.fhemDevice.internals.currentlogfile.replace(test, '') + ' -';
		} else {
			result[0] = this.data_logFile + ' -';
		}
		return result.join(' ');
	}

	// get db log data
	private getDbLogData(): string{
		const d: Date = new Date();
		const result = [
			// log:
			'- -',
			// minDate:
			'2000-01-01',
			// maxDate:
			[
				d.getFullYear(),
				(d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1),
				d.getDate() + 1
			].join('-')
		];
		return result.join(' ') + ' ' + this.data_dbDevice;
	}

	// transform filelog data 
	private transformFileLogData(data: string[]): void {
		data.forEach((line: string)=>{
			const date: RegExpMatchArray|null = line.match(/([^\s]*)/i);
			const value: RegExpMatchArray|null = line.match(/([^\s]*)$/g);
			const reading: RegExpMatchArray|null = line.match(/.*\s(.*?(?=:))/);
			if(date && value && reading && reading[1]){
				this.addRawData(date[0], reading[1], value[0]);
			}
		});
		this.readings = [...new Set(this.rawData.map(x=> x.reading))];
	}

	// transform filelog data 
	private transformDbLogData(data: string[]): void {
		const readings: RegExpMatchArray|null = data[data.length - 1].match(/(?<=:)(.\w+)/g);
		if(readings){
			this.readings = [ readings[0] ];
			for(let i = 0; i < data.length - 1; i++){
				const line: string = data[i];
				const date: RegExpMatchArray|null = line.match(/.*?(?=\s)/g);
				const value: RegExpMatchArray|null = line.match(/(?<=\s).+/g);
				if(date && value){
					this.addRawData(date[0], this.readings[0], value[0]);
				}
			}
		}
	}

	// data adder of all sources
	private addRawData(date: string, reading: string, value: any): void{
		this.rawData.push({ date: d3.timeParse('%Y-%m-%d_%H:%M:%S')(date), reading: reading, value: value });
	}

	// assign formatted data
	private getFormattedData(): void{
		this.data = {};
		this.arr_data_readings.forEach((reading: string, index: number)=>{
			const readingData: Array<{date: any, value: any}> = this.rawData.filter(x=> x.reading === reading).map(({date, value})=>({date: date, value: +value}));
			if(readingData){
				// assign index instead of reading name, to allow duplicates
				this.data[index] = readingData;
				this.dates.push(this.data[index].map((x: any)=> x.date));
			}
		});
		if(this.data){
			this.noData = false;
		}
		// generate dates
		this.getDates();
	}

	private getDates(): void{
		this.dates = this.dates.concat.apply([], this.dates);
		// sort the timestamps
		this.dates.sort();
		// get unique values
		let uniqueDates: Array<any> = this.dates.map((d: Date) => d.getTime()).filter((date: string, i: number, array: Array<any>)=> {
			return array.indexOf(date) === i;
		}).map((time: string)=> new Date(time));

		this.dates = uniqueDates;
	}

	// load the additional component information
	private loadCustomInputs(): void{
		// load the additional information
		this.componentLoader.assignCustomInputData(this.ID, 'Chart').then((customInputs: CustomComponentInputs)=>{
			// assign colors as array
			(customInputs.arr_data_colors).forEach((color: any, index: number)=>{
				if(typeof color === 'string'){
					customInputs.arr_data_colors[index] = color.split(',');
				}
			});
			this.customInputs = customInputs;
			// check if there is relevant information already defined
			if(this.arr_data_readings.length > 0){
				this.getFormattedData();
				// oply aggregate data for timeframe charts
				if(this.arr_data_chartTypes[0].match(/(bar|line|area)/g)){
					this.aggregate();
				}

				// initialize chart
				this.chart.init(
					this.data_timeFormat,
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
					this.arr_data_aggregation
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

	// data aggregation
	private aggregate(): void{
		// aggregate timestamps
		// create unique timestamps based on time format
		let transformedDates: Array<any> = [...new Set(
			this.dates.map((d: any) => d3.timeFormat(this.data_timeFormat)(d))
		)].map((d: any)=> d3.timeParse(this.data_timeFormat)(d));

		// create unique data based on aggregation
		let transformedData: any = {};

		this.arr_data_readings.forEach((reading: string, index: number)=>{
			transformedData[index] = [];
			this.data[index].forEach((d: any)=>{
				transformedData[index].push({
					date: d3.timeFormat(this.data_timeFormat)(d.date),
					value: d.value
				})
			});

			// aggregate data
			const agg = d3.rollup(
				transformedData[index], 
				(v: any)=> this.chart.aggregateDataset(v, this.arr_data_aggregation[index]),
				(d: any)=> d3.timeParse(this.data_timeFormat)(d.date)
			);

			// transform d3 map to array
			const arr = Array.from(agg, ([date, value]) => ({ date, value }));

			transformedData[index] = arr;

		});
		// // assign the new values
		this.dates = transformedDates;
		this.data = transformedData;
	}

	// edit chart properties
	editChart(): void{
		this.showChartConfig = !this.showChartConfig;
	}

	// add new graph block
	addGraph(): void{
		// graph assign
		this.arr_data_chartTypes.push(this.chartTypes[0]);
		this.arr_data_forAxis.push('left');
		this.arr_data_readings.push(this.readings[0]);
		this.arr_data_aggregation.push(this.aggregations[0]);
		this.arr_data_colors.push(['#14a9d5']);
		this.arr_data_displayLabels.push(true);
		this.arr_data_labelExtensions.push(this.labelEndings[0]);
	}

	// remove graph block
	removeGraph(index: number): void{
		this.arr_data_chartTypes.splice(index, 1);
		this.arr_data_forAxis.splice(index, 1);
		this.arr_data_readings.splice(index, 1);
		this.arr_data_aggregation.splice(index, 1);
		this.arr_data_colors.splice(index, 1);
		this.arr_data_displayLabels.splice(index, 1);
		this.arr_data_labelExtensions.splice(index, 1);
	}

	// save the configuration
	saveChartConfig(): void{
		let component: DynamicComponentDefinition|null = this.structure.getComponent(this.ID);
		if(component && this.customInputs){
			// assign props
			this.customInputs.data_leftMaxY = this.data_leftMaxY;
			this.customInputs.data_rightMaxY = this.data_rightMaxY;
			this.customInputs.data_leftMinY = this.data_leftMinY;
			this.customInputs.data_rightMinY = this.data_rightMinY;
			this.customInputs.data_leftLabelExtension = this.data_leftLabelExtension;
			this.customInputs.data_rightLabelExtension = this.data_rightLabelExtension;
			this.customInputs.data_timeFormat = this.data_timeFormat;
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
			moveItemInArray(this.arr_data_aggregation, event.previousIndex, event.currentIndex);
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

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		private chart: ChartService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		// resize
		this.selectComponent.removeHandle(this.ID, 'resize');
	}

	static getSettings(): ComponentSettings {
		return {
			name: 'Chart',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_dbDevice', default: ''},
				{variable: 'data_logFile', default: ''},
				{variable: 'arr_data_dbtype', default: 'FileLog,DbLog'},
				{variable: 'bool_data_getCurrent', default: true},
				{variable: 'arr_data_style', default: 'standard,NM-IN,NM-OUT'}
			],
			customInputs:{
				data_leftMaxY: '',
				data_rightMaxY: '',
				data_leftMinY: '',
				data_rightMinY: '',
				data_leftLabelExtension: '',
				data_rightLabelExtension: '',
				data_timeFormat: '%Y-%m-%d',
				arr_data_readings: [],
				arr_data_chartTypes: [],
				arr_data_aggregation: [],
				arr_data_forAxis: [],
				arr_data_colors: [],
				arr_data_displayLabels: [],
				arr_data_labelExtensions: []
			},
			dependencies: {
				data_dbDevice: { dependOn: 'arr_data_dbtype', value: 'DbLog' },
				data_logFile: { dependOn: 'bool_data_getCurrent', value: false },
				bool_data_getCurrent: { dependOn: 'arr_data_dbtype', value: 'FileLog' },
			},
			dimensions: {minX: 200, minY: 200}
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
	declarations: [FhemChartComponent]
})
export class FhemButtonComponentModule {}