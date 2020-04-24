import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import * as d3 from 'd3';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { SettingsService } from '../../../services/settings.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { StructureService } from '../../../services/structure.service';
import { SelectComponentService } from '../../../services/select-component.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

@Component({
	selector: 'fhem-chart',
	templateUrl: './fhem-chart.component.html',
  	styleUrls: ['./fhem-chart.component.scss']
})
export class FhemChartComponent implements OnInit, OnDestroy {
	@Input() ID: string;

	@Input() data_device: string;
	@Input() data_dbDevice: string;
	@Input() data_logFile: string;
	@Input() arr_data_dbtype: string[];
	@Input() arr_data_style: string[];

	@Input() bool_data_getCurrent: boolean;
	@Input() bool_data_zoomBothAxis: boolean;

	// custom inputs
	// Axis properties
	@Input() data_leftMaxY: string;
	@Input() data_rightMaxY: string;
	@Input() data_leftMinY: string;
	@Input() data_rightMinY: string;
	@Input() data_leftLabelExtension: string;
	@Input() data_rightLabelExtension: string;
	@Input() data_timeFormat: string;
	// graph properties
	@Input() arr_data_readings: string[] = [];
	@Input() arr_data_chartTypes: string[] = [];
	@Input() arr_data_forAxis: string[] = [];
	@Input() arr_data_aggregation: string[] = [];
	@Input() arr_data_colors: string[] = [];
	@Input() arr_data_displayLabels: boolean[] = [];
	@Input() arr_data_labelExtensions: string[] = [];

	// position information
	@Input() width: any;
	@Input() height: any;
	@Input() top: number;
	@Input() left: number;
	@Input() zIndex: number;

	fhemDevice: any;
	// custom input properties
	private customInputs: any;
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

	private x: any;
	private xScale: any;
	private xAxis: any;

	// left and right y axis
    private leftY: any;
    private rightY: any;
    // scales for left and right y
    private leftYScale: any;
    private rightYScale: any;
    // axis for left and right y
    private leftYAxis: any;
    private rightYAxis: any;
    // selector list --> build early to reduce calculations
    private zoomSelectors: string;
    // band width --> scaletime is used, so calc manually after axis creation
    private xBand: any;

    // svg dimensions
    private dim: any = {
  		padding: {top: 20, right: 30, bottom: 30, left: 40},
  		svg: {width: 0, height: 0},
  		content: {width: 0, height: 0}
  	};
    // unique ID for clip path
    private UID: string = '_' + Math.random().toString(36).substr(2, 9);

	ngOnInit(){
		if(this.data_device){
			this.fhem.getDevice(this.ID, this.data_device).then((device: any)=>{
				if(device){
					this.fhemDevice = device;
					// detect the type to get data
					if(device.internals.TYPE === 'FileLog'){
						this.getDataRaw('log').then(()=>{
							this.loadCustomInputs();
						});
					}
					if(device.internals.TYPE === 'DbLog'){
						this.getDataRaw('dblog').then(()=>{
							this.loadCustomInputs();
						});
					}
				}
			});
		}
		// button enablement
		if(this.ID !== 'TEST_COMPONENT'){
			this.showEditButton = true;
		}
		// assign while resize handle
		this.selectComponent.addHandle(this.ID, 'whileResize', (dimensions)=>{
			if(!this.noData && this.arr_data_readings.length > 0){
				this.draw({width: dimensions.width, height: dimensions.height});
			}
		});
	}

	// load the additional component information
	private loadCustomInputs(){
		// load the additional information
		this.componentLoader.assignCustomInputData(this.ID, 'Chart').then((customInputs)=>{
			this.customInputs = customInputs;
			// check if there is relevant information already defined
			if(this.arr_data_readings.length > 0){
				this.getDataFormatted();
				// oply aggregate data for timeframe charts
				if(this.arr_data_chartTypes[0].match(/(bar|line|area)/g)){
					this.aggregate();
				}
				this.draw(false);
			}
		});
	}

	// raw data fetch
	private getDataRaw(type: string){
		return new Promise((resolve)=>{
			this.fhem.get(this.data_device, type === 'log' ? this.getLog() : this.getDbLog()).then((data:any)=>{
				if(data){
					if(this.fhemDevice.internals.TYPE === 'FileLog'){
						data.forEach((line)=>{
							const date = line.match(/([^\s]*)/i)[0];
							const value = line.match(/([^\s]*)$/g)[0];
							const reading = line.match(/.*\s(.*?(?=:))/);
							if(date && value && reading && reading[1]){
								this.rawData.push({
									date: d3.timeParse('%Y-%m-%d_%H:%M:%S')(date),
									reading: reading[1],
									value: value
								});
							}
						});
						this.readings = [...new Set(this.rawData.map(x=> x.reading))];
						resolve();
					}else{
						this.readings = [data[data.length - 1].match(/(?<=:)(.\w+)/g)[0]];
						for(let i = 0; i < data.length - 1; i++){
							const line = data[i];
							const date = line.match(/.*?(?=\s)/g)[0];
							const value = line.match(/(?<=\s).+/g)[0];

							this.rawData.push({
								date: d3.timeParse('%Y-%m-%d_%H:%M:%S')(date),
								reading: this.readings[0],
								value: value
							});
							resolve();
						}
					}
				}
			});
		});
	}

	// assign formatted data
	private getDataFormatted(){
		this.data = {};
		this.arr_data_readings.forEach((reading: string, index: number)=>{
			const readingData = this.rawData.filter(x=> x.reading === reading).map(({date, value})=>({date: date, value: +value}));
			if(readingData){
				// assign index instead of reading name, to allow duplicates
				this.data[index] = readingData;
				this.dates.push(this.data[index].map(x=> x.date));
			}
		});
		if(this.data){
			this.noData = false;
		}

		this.dates = this.dates.concat.apply([], this.dates);
		// sort the timestamps
		this.dates.sort();
		// get unique values
		let uniqueDates = this.dates.map(d => d.getTime()).filter((date, i, array)=> {
    		return array.indexOf(date) === i;
 		}).map((time)=> new Date(time));

 		this.dates = uniqueDates;
	}

	// logfile request for data
	private getLog(){
		const d = new Date();
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
		if (this.bool_data_getCurrent) {
			const test = new RegExp('.*(?=' + this.data_device + ')', 'g');
			result[0] = this.fhemDevice.internals.currentlogfile.replace(test, '') + ' -';
		} else {
			result[0] = this.data_logFile + ' -';
		}
		return result.join(' ');
	}

	// get db log data
	private getDbLog(){
		const d = new Date();
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

	// data aggregation
	private aggregate(){
		// aggregate timestamps
		// create unique timestamps based on time format
		let transformedDates = [...new Set(
			this.dates.map(d => d3.timeFormat(this.data_timeFormat)(d))
		)].map((d: any)=> d3.timeParse(this.data_timeFormat)(d));

		// create unique data based on aggregation
		let transformedData = {};

		this.arr_data_readings.forEach((reading: string, index: number)=>{
			transformedData[index] = [];
			this.data[index].forEach((d)=>{
				transformedData[index].push({
					date: d3.timeFormat(this.data_timeFormat)(d.date),
					value: d.value
				})
			});
			transformedData[index] = d3.nest()
				.key((d: any)=> d.date)
				.rollup((leaves: any)=>{
					// aggregation
					return this.aggregateDataset(leaves, this.arr_data_aggregation[index]);
				})
				.entries(transformedData[index])
				// format times back to use them in chart creation
				.map(d=>{return {date: d3.timeParse(this.data_timeFormat)(d.key), value: d.value}});

		});
		// // assign the new values
		this.dates = transformedDates;
		this.data = transformedData;
	}

	// aggregate single dataset
	private aggregateDataset(data: any, aggregation: string){
		// sum aggregation
		if(aggregation === 'sum'){
			return d3.sum(data, (d: any)=>{return d.value}) as any;
		}
		// mean aggregation
		if(aggregation === 'mean'){
			return d3.mean(data, (d: any)=>{return d.value}) as any;
		}
		// median aggregation
		if(aggregation === 'median'){
			return d3.median(data, (d: any)=>{return d.value}) as any;
		}
		// min aggregation
		if(aggregation === 'min'){
			return d3.min(data, (d: any)=>{return d.value}) as any;
		}
		// max aggregation
		if(aggregation === 'max'){
			return d3.max(data, (d: any)=>{return d.value}) as any;
		}
		// variance aggregation
		if(aggregation === 'variance'){
			return d3.variance(data, (d: any)=>{return d.value}) as any;
		}
		// deviation aggregation
		if(aggregation === 'deviation'){
			return d3.deviation(data, (d: any)=>{return d.value}) as any;
		}
	}

	// edit chart properties
	editChart(){
		this.showChartConfig = !this.showChartConfig;
	}

	// add new graph block
	addGraph(){
		// graph assign
		this.arr_data_chartTypes.push(this.chartTypes[0]);
		this.arr_data_forAxis.push('left');
		this.arr_data_readings.push(this.readings[0]);
		this.arr_data_aggregation.push(this.aggregations[0]);
		this.arr_data_colors.push('#14a9d5');
		this.arr_data_displayLabels.push(true);
		this.arr_data_labelExtensions.push(this.labelEndings[0]);
	}

	// remove graph block
	removeGraph(index){
		this.arr_data_chartTypes.splice(index, 1);
		this.arr_data_forAxis.splice(index, 1);
		this.arr_data_readings.splice(index, 1);
		this.arr_data_aggregation.splice(index, 1);
		this.arr_data_colors.splice(index, 1);
		this.arr_data_displayLabels.splice(index, 1);
		this.arr_data_labelExtensions.splice(index, 1);
	}

	// save the configuration
	saveChartConfig(){
		let component = this.structure.getComponent(this.ID);
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

	// CHARTS PART
	// draw chart
	private draw(size){
		// getting size
		this.dim.svg = size || this.getSize('.chart');
		this.dim.content.width = this.dim.svg.width - this.dim.padding.left - this.dim.padding.right;
		this.dim.content.height = this.dim.svg.height - this.dim.padding.top - this.dim.padding.bottom;

		// delete and create svg
		d3.select(this.ref.nativeElement).select('svg').remove();
		this.svg = d3.select(this.ref.nativeElement.querySelector('.chart')).append('svg').attr('width', this.dim.svg.width).attr('height', this.dim.svg.height);
		// build content
		this.buildContent();
		// build axis
		this.buildAxis();
		// build Charts
 		this.drawCharts();
 		// buikld the selectors
 		this.zoomSelectors = [...new Set(this.arr_data_chartTypes.map(x=> '.' + x))].join(',');
	}

	// build relevant chart content
	private buildContent(){
		// only build clip path for time charts
		if(this.arr_data_chartTypes.join('').match(/(bar|line|area)/)){
			// clip path
			this.svg.append('defs').append('clipPath')
				.attr('id', this.UID)
			  	.append('rect')
			    .attr('width', this.dim.content.width)
			    .attr('height', this.dim.content.height);
			 // focus
			this.buildFocus();
		}
	}

	// focus for movements
	private buildFocus(){
		this.svg.append('g')
    		.attr('class', 'focus')
    		.attr('transform', 'translate(' + this.dim.padding.left + ',' + this.dim.padding.top + ')');

    	this.svg.select('.focus').append('g')
    		.attr('clip-path', 'url(#' + this.UID + ')')
    		.attr('class', 'chart');
	}

	// axis of chart
	private buildAxis(){
		// only build axis for time charts
		if(this.arr_data_chartTypes.join('').match(/(bar|line|area)/)){
			// X Axis
			this.x = d3.scaleTime().rangeRound([0, this.dim.content.width])
				.domain([
					d3.min(this.dates) as unknown as number,
					d3.max(this.dates) as unknown as number
				])

			// x axis ticks
			const xTicks = Math.min(this.data[[0][0]].length, Math.floor(this.dim.content.width / 80));
			// draw x axis
			this.xScale = d3.axisBottom(this.x)
				.tickFormat(d3.timeFormat(this.data_timeFormat))
				.tickSizeOuter(0)
				.ticks(xTicks);

			this.xAxis = this.svg.selectAll('.focus').append('g').attr('class', 'x axis')
				.attr('transform', 'translate(' + [0, this.dim.content.height] + ')')
				.call(this.xScale);

			// get bandWidth
			this.xBand = d3.scaleBand().domain(
				d3.range(-1, this.dates.length) as any
			).range([0, this.dim.content.width]);

			// get the readings for left and right y axis
			let leftYMinData: number[] = [];
			let leftYMaxData: number[] = [];

			let rightYMinData: number[] = [];
			let rightYMaxData: number[] = [];

			this.arr_data_forAxis.forEach((axis: string, i: number)=>{
				if(axis === 'left'){
					let min = d3.min(this.data[i].map(x=> x.value));
					let max = d3.max(this.data[i].map(x=> x.value));

					leftYMinData.push(min as unknown as number);
					leftYMaxData.push(max as unknown as number);
				}else{
					let min = d3.min(this.data[i].map(x=> x.value));
					let max = d3.max(this.data[i].map(x=> x.value));

					rightYMinData.push(min as unknown as number);
					rightYMaxData.push(max as unknown as number);
				}
			});
			// check axis
			if(leftYMinData.length > 0){
				// draw left axis
				this.leftY = d3.scaleLinear().range([this.dim.content.height, 0])
					.domain([
						this.data_leftMinY && this.data_leftMinY !== '' ? parseFloat(this.data_leftMinY) : d3.min(leftYMinData),
						this.data_leftMaxY && this.data_leftMaxY !== '' ? parseFloat(this.data_leftMaxY) : d3.max(leftYMaxData)
					]);

				this.leftYScale = d3.axisLeft(this.leftY)
					.tickFormat(d=> d + this.data_leftLabelExtension);

				this.leftYAxis = this.svg.selectAll('.focus')
					.append('g').attr('class', 'y axis left')
					.call(this.leftYScale);
			}

			if(rightYMinData.length > 0){
				// draw right axis
				this.rightY = d3.scaleLinear().range([this.dim.content.height, 0])
					.domain([
						this.data_rightMinY && this.data_rightMinY !== '' ? parseFloat(this.data_rightMinY) : d3.min(rightYMinData),
						this.data_rightMaxY && this.data_rightMaxY !== '' ? parseFloat(this.data_rightMaxY) : d3.max(rightYMaxData)
					]);

				this.rightYScale = d3.axisRight(this.rightY)
					.tickFormat(d=> d + this.data_rightLabelExtension);

				this.rightYAxis = this.svg.selectAll('.focus')
					.append('g').attr('class', 'y axis right')
					.attr('transform', 'translate(' + [this.dim.content.width, 0] + ')')
					.call(this.rightYScale);
			}

			// apply zoom
			const zoom = d3.zoom()
				.extent([[0, this.dim.padding.top], [this.dim.svg.width-(this.dim.padding.left + this.dim.padding.right), this.dim.svg.width-this.dim.padding.top]])
	 			.scaleExtent([0.9, 10])
	 			.translateExtent([[0, this.dim.padding.top], [this.dim.svg.width-(this.dim.padding.left + this.dim.padding.right), this.dim.svg.width-this.dim.padding.top]])
				.on('zoom', this.zoomed.bind(this));

			// zoom content
	  		this.svg.append('rect').attr('class', 'zoom')
	  			.attr('width', this.dim.content.width)
	      		.attr('height', this.dim.content.height)
	      		.attr('fill', 'transparent')
	      		.attr('transform', 'translate(' + [this.dim.padding.left, this.dim.padding.top] + ')')
	      		.call(zoom);

			// color axis
			this.colorAxis();
		}
	}

	// zoom behaviour
	private zoomed(){
		// rescale axis
		const newXscale = d3.event.transform.rescaleX(this.x);
		// X
		this.xAxis.call(this.xScale.scale(newXscale));
		// Y
		if (this.bool_data_zoomBothAxis) {
			if(this.leftYAxis){
				this.leftYAxis.call(this.leftYScale.scale(d3.event.transform.rescaleY(this.leftY)));
			}
			if(this.rightYAxis){
				this.rightYAxis.call(this.rightYScale.scale(d3.event.transform.rescaleY(this.rightY)));
			}
		}

		// Label resize
		if(!this.bool_data_zoomBothAxis){
			this.svg.selectAll('.label')
			.attr('x', (d)=>{
				return newXscale(d.date) - this.xBand.bandwidth()
			});
		}

		// chart zoom
		if(this.zoomSelectors.match(/(bar|line|area)/)){
			this.svg.select('.focus').selectAll(this.zoomSelectors + (this.bool_data_zoomBothAxis ? ',.label' : '') )
				.attr('transform', 'translate(' + [d3.event.transform.x, (this.bool_data_zoomBothAxis ? d3.event.transform.y : 0)] + ') scale(' + [d3.event.transform.k, (this.bool_data_zoomBothAxis ? d3.event.transform.k : 1)] + ')');

		}

		// color axis
		this.colorAxis();
	}

	// colorize axis valus
	private colorAxis(){
		const color = (this.settings.app.theme === 'dark') ? '#fff' : '#000';
		this.svg.selectAll('.axis path').style('stroke', color);
      	this.svg.selectAll('.axis line').style('stroke', color);
      	this.svg.selectAll('.axis text').style('fill', color);
	}

	// get size 
	private getSize(el) {
    	const elem = this.ref.nativeElement.querySelector(el);
    	return {
    	  	width: (this.width) ? parseInt(this.width) : elem.clientWidth,
    	  	height: (this.height) ? parseInt(this.height) : elem.clientHeight
    	};
  	}

  	// Draw Charts
  	private drawCharts(){
  		this.arr_data_chartTypes.forEach((chartType:string, index: number)=>{
  			let chart = chartType.toUpperCase();
  			// create the chart
  			this['create' + chart + 'chart'](index);
  			if(chartType.match(/(bar|line|area)/) && this.arr_data_displayLabels[index]){
  				this.createLabels(index);
  			}
  		});
  	}

  	// create labels for specific chart type
  	private createLabels(index: number){
  		const axis = this.arr_data_forAxis[index];

  		this.svg.select('.chart').selectAll('.g')
  			.data(this.data[index]).enter()
  			.append("text")
  			.attr("class","label")
  			.attr("fill", (this.settings.app.theme === 'dark') ? '#fff' : '#000')
  			.attr('x', d => this.x(d.date) - this.xBand.bandwidth() / 2 )
  			.attr('y',  d => (axis === 'left' ? this.leftY(d.value) : this.rightY(d.value)) + this.dim.padding.top / 2)
  			.text(d=> Math.round(d.value) + this.arr_data_labelExtensions[index]);   
  	}

  	// create bar chart
  	private createBARchart(index: number) {
  		const axis = this.arr_data_forAxis[index];
  		const totalBarcharts = this.arr_data_chartTypes.filter(x=> x=== 'bar').length;
  		
  		this.svg.select('.chart').selectAll('.g')
  			.data(this.data[index]).enter()
  			.append('rect')
  			.attr('class', 'bar')
  			.style('opacity', totalBarcharts > 1 ? 0.7 : 1.0)
  			.style('fill', this.arr_data_colors[index])
  			.attr('x', d => this.x(d.date) - this.xBand.bandwidth() * 0.9 / 2 )
  			// .attr('width', (this.dim.content.width / this.data[index].length) )
  			.attr('width', this.xBand.bandwidth() * 0.9 )
  				// animate
  				.attr('y',  d => this.dim.content.height)
  				.attr('height', 0)
				.transition()
	        	.duration(600)
	        .attr('y',  d => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))
	        .attr('height', d => this.dim.content.height - (axis === 'left' ? this.leftY(d.value) : this.rightY(d.value)) );
  	}

  	// line chart
  	private createLINEchart(index: number) {
  		const axis = this.arr_data_forAxis[index];

  		const line = d3.line()
  			.x((d:any) => this.x(d.date))
      		.y((d:any) => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))
      		.curve(d3.curveNatural);

      	const line0 = d3.line()
      		.x((d:any) => this.x(d.date))
      		.y(axis === 'left' ? this.leftY(d3.min(this.data[index].map(x=> x.value))) : this.rightY(d3.min(this.data[index].map(x=> x.value))))
      		.curve(d3.curveNatural);

      	this.svg.select('.chart')
      		.append('path')
  			.datum(this.data[index])
      		.attr('class', 'line')
      		.attr('fill', 'none')
      		.attr('stroke', this.arr_data_colors[index])
      		.attr('stroke-linejoin', 'round')
      		.attr('stroke-linecap', 'round')
      		.attr('stroke-width', 1.5)
        		.attr('d', line0)
        		.transition()
        		.duration(600)
      		.attr('d', line);
  	}

  	private createAREAchart(index: number) {
  		const axis = this.arr_data_forAxis[index];

  		this.svg.select('.chart')
  			.append('path')
  			.datum(this.data[index])
  			.attr('class', 'area')
			.attr('fill', this.arr_data_colors[index])
			.attr('fill-opacity', '0.7')
			.attr('stroke', this.arr_data_colors[index])
			.attr('stroke-width', 1.5)
				.attr('d', d3.area()
					.x((d:any) => this.x(d.date))
					.y0( axis === 'left' ? this.leftY(0) : this.rightY(0) )
					.y1(d => axis === 'left' ? this.leftY(d3.min(this.data[index].map(x=> x.value))) : this.rightY(d3.min(this.data[index].map(x=> x.value))))
				)
				.transition()
        		.duration(600)
        	.attr('d', d3.area()
				.x((d:any) => this.x(d.date))
				.y0(axis === 'left' ? this.leftY(0) : this.rightY(0))
				.y1((d:any) => axis === 'left' ? this.leftY(d.value) : this.rightY(d.value))
			);
  	}

  	// Gauge Chart
  	private createGAUGEchart(index: number) {
  		// get relevant values
  		const value = this.aggregateDataset(this.data[index], this.arr_data_aggregation[index]);
  		const minValue: number = d3.min(this.data[index].map(d=> d.value)) as unknown as number;
  		const maxValue: number = d3.max(this.data[index].map(d=> d.value)) as unknown as number;

  		const radius = Math.min(this.dim.svg.width - 40, this.dim.svg.height - 40) / 2;
	  	const locationX = this.dim.svg.width / 2;
	  	const locationY = this.dim.svg.height / 2;
	  	const textPixels = (radius / 2);

	  	const textRounder = (value) => Math.round(value);
	  	const animateTime = 1000;

	  	const group = this.svg.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');
	  	const arc = d3.arc().innerRadius(radius - 10).outerRadius(radius).startAngle(0);
	  	const ring1 = d3.arc().innerRadius(radius + 18).outerRadius(radius + 20).startAngle(0);
	 	const ring2 = d3.arc().innerRadius(radius - 1).outerRadius(radius + 11).startAngle(0);

	 	group.append('path').datum({endAngle: 2 * Math.PI}).style('fill', '#ffffff').attr('fill-opacity', 0.3).attr('d', arc);
	 	group.append('path').datum({endAngle: 2 * Math.PI}) .style('stroke-opacity', 0.1).style('opacity', 0.1).style('fill', '#ffffff').attr('d', ring2);
	 	group.append('path').datum({endAngle: 2 * Math.PI}).style('stroke-opacity', 0.3).style('opacity', 0.3).style('fill', '#ffffff').attr('d', ring1);

	 	const foreground = group.append('path').datum({endAngle: 0 }).style('fill', '#A4DBf8').attr('d', arc);

	 	if(value){
	 		const toPercent = 1 - ( (value - minValue) / (maxValue - minValue) );

		   	const arcTween = (newAngle) => {
	      		return (d) => {
	      			const i = d3.interpolate(d.endAngle, newAngle);
	      			return (t) => {
	      				d.endAngle = i(t);
	      				const path = arc(d);
	          			return path;
	      			};
	      		};
	      	};
	      	foreground.transition()
		   	.duration(1000)
	      	.attrTween('d', arcTween( toPercent * (2 * Math.PI)));

	      	// text
		   	const text1 = group.append('text')
	            .attr('text-anchor', 'middle')
	            .attr('font-size', textPixels + 'px')
	            .style('fill', '#A4DBf8')
	            .attr('transform', 'translate(' + 0 + ',' + textPixels / 4 + ')');

	        const transition = (from, to, riseWave, animateText) => {
		        if (animateText) {
		            const textTween = () => {
		                const i  = d3.interpolate(from, to);
		                return (t) => {
		                    text1.text(textRounder(i(t)) + this.arr_data_labelExtensions[index]);
		                };
		            };
		            text1.transition()
		                .duration(animateTime)
		                .tween('text', textTween);
		        }
		    };
		    transition(0, value, true && true, true && true);
	 	}
  	}

  	// Gauge Chart
  	private createLIQUIDGAUGEchart(index: number) {
  		// get relevant values
  		const value = this.aggregateDataset(this.data[index], this.arr_data_aggregation[index]);
  		const minValue: number = d3.min(this.data[index].map(d=> d.value)) as unknown as number;
  		const maxValue: number = d3.max(this.data[index].map(d=> d.value)) as unknown as number,

  		// Styles
        circleThicknessConfig = 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGapConfig = 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor = '#014469', // The color of the outer circle.
        backgroundColor = 'gray', // The color of the background
        waveColor = '#014469', // The color of the fill wave.

        // Waves
        waveHeightConfig = 0.09, // The wave height as a percentage of the radius of the wave circle.
        waveCount = 3, // The number of full waves per width of the wave circle.
        waveOffset = 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.

        // Animations
        waveRiseTime = 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime = 5000, // The amount of time in milliseconds for a full wave to enter the wave circle.

        // Text
        textVertPosition = 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize = 1, // The relative height of the text to display in the wave circle. 1 = 50%
        waveTextColor = '#A4DBf8'; // The color of the value text when the wave overlaps it.

        const gauge = this.svg;
        const radius = Math.min(this.dim.svg.width, this.dim.svg.height) / 2;
		const locationX = this.dim.svg.width / 2 - radius;
		const locationY = this.dim.svg.height / 2 - radius;
		// const fillPercent = Math.max(minValue, Math.min(maxValue, value)) / maxValue;

		const fillPercent = 1 - ( (value - minValue) / (maxValue - minValue) );

		const waveHeightScale = d3.scaleLinear().range([waveHeightConfig, waveHeightConfig]).domain([0, 100]);
		const textPixels = (textSize * radius / 2);
		const textFinalValue = Math.round(value);
		const circleThickness = circleThicknessConfig * radius;
		const circleFillGap = circleFillGapConfig * radius;
		const fillCircleMargin = circleThickness + circleFillGap;
		const fillCircleRadius = radius - fillCircleMargin;
		// const waveHeight = fillCircleRadius * waveHeightScale(fillPercent);
		const waveHeight = fillCircleRadius * waveHeightScale(fillPercent);

		const waveLength = fillCircleRadius * 2 / waveCount;
		const waveClipCount = 1 + waveCount;
		const waveClipWidth = waveLength * waveClipCount;
		const textRounder = (value) => Math.round(value);
		const data = [];
		for (let i = 0; i <= 40 * waveClipCount; i++) {data.push({x: i / (40 * waveClipCount), y: (i / (40))}); }
		// Scales for drawing the outer circle.
		const gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
		const gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);
		// Scales for controlling the size of the clipping path.
		const waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
		const waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
		// Scales for controlling the position of the clipping path.
		const waveRiseScale = d3.scaleLinear().range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)]).domain([0, 1]);
		const waveAnimateScale = d3.scaleLinear().range([0, waveClipWidth - fillCircleRadius * 2]).domain([0, 1]);
		// Scale for controlling the position of the text within the gauge.
		const textRiseScaleY = d3.scaleLinear().range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)]).domain([0, 1]);
		const gaugeGroup = gauge.append('g').attr('transform', 'translate(' + locationX + ',' + locationY + ')');

		// Background Circle
		gaugeGroup.append('circle').attr('r', radius).attr('class', 'gauge-outer-circle').attr('transform', 'translate(' + radius + ', ' + radius + ')');
		const gaugeCircleArc = d3.arc().startAngle(gaugeCircleX(0)).endAngle(gaugeCircleX(1)).outerRadius(gaugeCircleY(radius)).innerRadius(gaugeCircleY(radius - circleThickness));
		gaugeGroup.append('path').attr('d', gaugeCircleArc).style('fill', circleColor).attr('transform', 'translate(' + radius + ', ' + radius + ')');
		// Text where the wave does not overlap.
		const text1 = gaugeGroup.append('text')
            .attr('class', 'liquidFillGaugeText')
            .attr('text-anchor', 'middle')
            .attr('font-size', textPixels + 'px')
            .style('fill', this.arr_data_colors[index])
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(textVertPosition) + ')');

        if(value){
        	const clipArea = d3.area()
	            .x((d:any) => waveScaleX(d.x) )
	            .y0((d:any) => waveScaleY(Math.sin(Math.PI * 2 * waveOffset * -1 + Math.PI * 2 * (1 - waveCount) + d.y * 2 * Math.PI)) )
	            .y1((d) => (fillCircleRadius * 2 + waveHeight) );

	        const gaugeGroupDefs = gaugeGroup.append('defs');
	        const waveGroup = gaugeGroupDefs.append('clipPath').attr('id', this.UID);
        	const wave = waveGroup.append('path').datum(data).attr('d', clipArea);
        	const fillCircleGroup = gaugeGroup.append('g').attr('clip-path', 'url(#' + this.UID + ')');
        	fillCircleGroup.append('circle').attr('cx', radius).attr('cy', radius).attr('r', fillCircleRadius).style('fill', waveColor);

	        const text2 = fillCircleGroup.append('text')
	            .attr('class', 'liquidFillGaugeText')
	            .attr('text-anchor', 'middle')
	            .attr('font-size', textPixels + 'px')
	            .style('fill', waveTextColor)
	            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(textVertPosition) + ')');

	        const waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
	        const animateWave = () => {
	            wave.transition()
	            .duration(waveAnimateTime)
	            .ease(d3.easeLinear)
	            .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
	            .on('end', () => {
	                wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
	                animateWave();
	            });
	        };

	        animateWave();
	        const transition = (from, to, riseWave, animateText) => {
	            if (animateText) {
	                const textTween = () => {
	                    const i  = d3.interpolate(from, to);
	                    return (t) => {
	                        text1.text(textRounder(i(t)) + this.arr_data_labelExtensions[index]);
	                        text2.text(textRounder(i(t)) + this.arr_data_labelExtensions[index]);
	                    };
	                };
	                text1.transition()
	                    .duration(waveRiseTime)
	                    .tween('text', textTween);
	                text2.transition()
	                    .duration(waveRiseTime)
	                    .tween('text', textTween);
	            }

	            if (riseWave) {
	                waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
	                    .transition().duration(waveRiseTime)
	                    .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
	            }
	        };
	        transition(0, textFinalValue, true, true );
        }
  	}

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.selectComponent.removeHandle(this.ID, 'whileResize');
	}

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings() {
		return {
			name: 'Chart',
			type: 'fhem',
			inputs: [
				{variable: 'data_device', default: ''},
				{variable: 'data_dbDevice', default: ''},
				{variable: 'data_logFile', default: ''},
				{variable: 'arr_data_dbtype', default: 'FileLog,DbLog'},
				{variable: 'bool_data_getCurrent', default: true},
				{variable: 'bool_data_zoomBothAxis', default: false},
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
	imports: [ComponentsModule, IonicModule, TranslateModule],
  	declarations: [FhemChartComponent]
})
class FhemButtonComponentModule {}