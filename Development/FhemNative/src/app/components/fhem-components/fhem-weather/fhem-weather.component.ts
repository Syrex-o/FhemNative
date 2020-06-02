import { Component, Input, NgModule, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

// Drag and Drop
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import * as d3 from 'd3';

// Components
import { ComponentsModule } from '../../components.module';

// Services
import { FhemService } from '../../../services/fhem.service';
import { TimeService } from '../../../services/time.service';
import { SettingsService } from '../../../services/settings.service';
import { UndoRedoService } from '../../../services/undo-redo.service';
import { StructureService } from '../../../services/structure.service';
import { SelectComponentService } from '../../../services/select-component.service';
import { ComponentLoaderService } from '../../../services/component-loader.service';

@Component({
	selector: 'fhem-weather',
	templateUrl: './fhem-weather.component.html',
  	styleUrls: ['../fhem-chart/fhem-chart.component.scss']
})
export class FhemWeatherComponent implements OnInit, OnDestroy {

	@Input() ID: string;

	@Input() data_device: string;
	@Input() arr_data_fhemModule: string[];
	@Input() arr_data_style: string[];

	@Input() bool_data_showCurrentDayDetails: boolean;
	@Input() bool_data_showDayBorder: boolean;

	@Input() style_dayBorderColor: string;

	// custom inputs
	// Axis properties
	@Input() data_leftMaxY: string;
	@Input() data_rightMaxY: string;
	@Input() data_leftMinY: string;
	@Input() data_rightMinY: string;
	@Input() data_leftLabelExtension: string;
	@Input() data_rightLabelExtension: string;
	// graph properties
	@Input() arr_data_readings: string[] = [];
	@Input() arr_data_chartTypes: string[] = [];
	@Input() arr_data_forAxis: string[] = [];
	@Input() arr_data_colors: any = [];
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
	chartTypes: string[] = ['bar', 'line', 'area'];
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
		this.fhem.getDevice(this.ID, this.data_device, (device)=>{
			this.getData(device);
		}).then((device)=>{
			this.getData(device);
		});

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
		this.componentLoader.assignCustomInputData(this.ID, 'Weather').then((customInputs: any)=>{
			// assign colors as array
			customInputs.arr_data_colors.forEach((color, index: number)=>{
				if(typeof color === 'string'){
					customInputs.arr_data_colors[index] = color.split(',');
				}
			});
			this.customInputs = customInputs;
			// check if there is relevant information already defined
			if(this.arr_data_readings.length > 0){
				this.getDataFormatted();
				this.draw(false);
			}
		});
	}

	private getData(device){
		this.fhemDevice = device;
		this.rawData = [];
		this.dates = [];
		if(device){
			if(this.arr_data_fhemModule[0] === 'Proplanta'){
				for(const [key, value] of Object.entries(device.readings)){
					let val: any = value;
					const relevantReading = key.match(/fc\d+_.+\d+/g);
					if(relevantReading){
						const attr = relevantReading[0].match(/(?<=_).*?(?=\d)/g);
						if(attr){
							const day = parseInt(relevantReading[0].match(/(?<=fc).*?(?=_)/g)[0]);
							const hour = parseInt(relevantReading[0].match(/\d+$/g)[0]);
							// get the date
							let date: any = this.time.addDay(this.time.local().dateRaw, day);
							date.setHours(hour);
							date.setSeconds(0);
							date.setMilliseconds(0);
							date.setMinutes(0);

							date = date;

							if(!isNaN(val.Value)){
								// add to raw data
								this.rawData.push({
									date: date,
									reading: attr[0],
									value: val.Value
								});

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
		if(this.rawData.length > 0){
			// sort the timestamps
			this.dates.sort();
			let uniqueDates = this.dates.map(d => d.getTime()).filter((date, i, array)=> {
    			return array.indexOf(date) === i;
 			}).map((time)=> new Date(time));
 			this.dates = uniqueDates;
			// convert time
			this.loadCustomInputs();
		}
	}

	private getDataFormatted(){
		this.data = {};
		this.arr_data_readings.forEach((reading: string, index: number)=>{
			const readingData = this.rawData.filter(x=> x.reading === reading).map(({date, value})=>({date: date, value: +value}));
			if(readingData){
				// assign index instead of reading name, to allow duplicates
				this.data[index] = readingData;
				this.data[index].sort((a, b) => (a.date > b.date) ? 1 : -1);
			}
		});
		if(this.data){
			this.noData = false;
		}
	}

	editChart(){
		this.showChartConfig = !this.showChartConfig;
	}

	// add new graph block
	addGraph(){
		// graph assign
		this.arr_data_chartTypes.push(this.chartTypes[0]);
		this.arr_data_forAxis.push('left');
		this.arr_data_readings.push(this.readings[0]);
		this.arr_data_colors.push(['#14a9d5']);
		this.arr_data_displayLabels.push(true);
		this.arr_data_labelExtensions.push(this.labelEndings[0]);
	}

	// remove graph block
	removeGraph(index){
		this.arr_data_chartTypes.splice(index, 1);
		this.arr_data_forAxis.splice(index, 1);
		this.arr_data_readings.splice(index, 1);
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
			// write to component
			component['customInputs'] = this.customInputs;
			// assign as change
			this.undoManager.addChange();
			// reload attributes
			this.loadCustomInputs();
		}
	}

	// drag start
	onDragStart(){
		// remove unfold items
		this.arr_data_chartTypes.forEach((item: string, index: number)=>{
			const elem: HTMLElement = this.ref.nativeElement.querySelector('#config-data-' + index);
			elem.classList.remove('unfold');
		});
	}

	// reorder graphs
	reorderGraphs(event: CdkDragDrop<string[]>){
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
	unfoldItem(index: number){
		const elem: HTMLElement = this.ref.nativeElement.querySelector('#config-data-' + index);
		elem.classList.toggle('unfold');
	}

	// CHARTS PART
	// draw chart
	private draw(size){
		// getting size
		this.dim.svg = size || this.getSize('.weather');
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

	private buildContent(){
		// clip path
		this.svg.append('defs').append('clipPath')
			.attr('id', this.UID)
		  	.append('rect')
		    .attr('width', this.dim.content.width)
		    .attr('height', this.dim.content.height);

		 // focus
		this.svg.append('g')
    		.attr('class', 'focus')
    		.attr('transform', 'translate(' + this.dim.padding.left + ',' + this.dim.padding.top + ')');

    	this.svg.select('.focus').append('g')
    		.attr('clip-path', 'url(#' + this.UID + ')')
    		.attr('class', 'chart');

    	// daily values display
	    if(this.bool_data_showCurrentDayDetails){
	    	let tempMin, tempMax, tempCurrent;
	    	if(this.arr_data_fhemModule[0] === 'Proplanta' && this.fhemDevice){
	    		tempMin = this.fhemDevice.readings.fc0_tempMin.Value;
	    		tempMax = this.fhemDevice.readings.fc0_tempMax.Value;
	    		tempCurrent = this.fhemDevice.readings.temperature.Value;
	    	}
	    	if(tempCurrent !== undefined){

	    		this.svg.select('.chart')
		    		.append('g')
		    		.attr("class", "overall")
		    		.attr('transform', 'translate(' + 10 + ',' + this.dim.padding.top + ')');

		    	// date
		    	this.svg.select('.overall').append('text')
		    		.attr("class", "date")
		    		.attr('font-size', '12px')
		    		.text(d3.timeFormat("%d. %B %H:%m")(new Date));

		    	// min max
		    	this.svg.select('.overall').append('text')
		    		.attr("class", "min")
		    		.attr('font-size', '12px')
		    		.text('Min: '+tempMin+ '\xB0'+ ' - Max: '+tempMax+ '\xB0')
		    		.attr('transform', 'translate(' + 0 + ',' + 15 + ')');

		    	// current
		    	this.svg.select('.overall').append('text')
		    		.attr("class", "current")
		    		.attr('font-size', '20px')
		    		.text(tempCurrent+ '\xB0C')
		    		.attr('transform', 'translate(' + 0 + ',' + 35 + ')');
	    	}
	    }
	}

	// axis of chart
	private buildAxis(){
		// X Axis
		this.x = d3.scaleTime().rangeRound([0, this.dim.content.width])
			.domain([
				d3.min(this.dates) as unknown as number,
				d3.max(this.dates) as unknown as number
			]);

		// x axis ticks
		const xTicks = Math.min(this.data[[0][0]].length, Math.floor(this.dim.content.width / 80));
		// draw x axis
		this.xScale = d3.axisBottom(this.x)
			.tickFormat(d3.timeFormat('%d.%m.%Y %H:%M'))
			.tickSizeOuter(0)
			.ticks(xTicks);

		this.xAxis = this.svg.selectAll('.focus').append('g').attr('class', 'x axis')
			.attr('transform', 'translate(' + [0, this.dim.content.height] + ')')
			.call(this.xScale);

		// get bandWidth
		this.xBand = d3.scaleBand().domain(d3.range(-1, this.dates.length) as any).range([0, this.dim.content.width]);

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

		// draw day border
		if(this.bool_data_showDayBorder){
			this.svg.selectAll('.focus').append('g')
				.attr('class', 'grid')
				.attr('transform', 'translate(' + [0, this.dim.content.height] + ')')
				.call(
					d3.axisBottom(this.x)
						.ticks(d3.timeDay, 1)
						.tickSize(-this.dim.content.height / 1.4)
						.tickSizeOuter(0)
				);
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

	    // line breaks
		this.breakLine();
		// color axis
		this.colorAxis();
	}

	// apply line breaks
	private breakLine(){
		this.svg.selectAll('.x .tick text')
			.call((t)=>{
				t.each(function(d){
					let self = d3.select(this);
					let s = self.text().split(' ');
					self.text('');
					self.append("tspan")
						.attr("x", 0)
		                .attr("dy",".8em")
		                .text(s[0]);
		            self.append("tspan")
		                .attr("x", 0)
		                .attr("dy",".8em")
		                .text(s[1]);
				})
			});
	}

	private zoomed(){
		// rescale axis
		const newXscale = d3.event.transform.rescaleX(this.x);
		// X
		this.xAxis.call(this.xScale.scale(newXscale));
		// labels
		this.svg.selectAll('.label')
			.attr('x', (d)=>{
				return newXscale(d.date) - this.xBand.bandwidth()
			});

		// day breaks
		this.svg.selectAll('.grid')
			.call(
				d3.axisBottom(this.x)
				.scale(d3.event.transform.rescaleX(this.x))
				.ticks(d3.timeDay, 1)
				.tickSize(-this.dim.content.height / 1.4)
				.tickSizeOuter(0)
			);

		// chart zoom
		this.svg.select('.focus').selectAll(this.zoomSelectors).attr('transform', 'translate(' + [d3.event.transform.x, 0] + ') scale(' + [d3.event.transform.k, 1] + ')');
		// line breaks
		this.breakLine();
		// color axis
		this.colorAxis();
	}

	private colorAxis(){
		const color = (this.settings.app.theme === 'dark') ? '#fff' : '#000';
		this.svg.selectAll('.axis path').style('stroke', color);
      	this.svg.selectAll('.axis line').style('stroke', color);
      	this.svg.selectAll('.axis text').style('fill', color);
      	this.svg.selectAll('.overall').style('fill', color);
      	this.svg.selectAll('.grid .tick line')
      		.style('stroke', this.style_dayBorderColor)
      		.style('stroke-opacity', 0.7);
	}

	// get size 
	private getSize(el) {
    	const elem = this.ref.nativeElement.querySelector(el);
    	return {
    	  	width: elem.clientWidth > 0 ? elem.clientWidth : parseInt(this.width),
    	  	height: elem.clientHeight > 0 ? elem.clientHeight : parseInt(this.height)
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

  	// color getter
  	private getColor(index: number){
  		let colors: string|string[] = this.arr_data_colors[index];
  		let res;
  		if(Array.isArray(colors)){
  			// UID for svg gradient
  			const UID: string = '_' + Math.random().toString(36).substr(2, 9);

  			let gradient = this.svg.select('defs')
				.append('svg:linearGradient')
				.attr("id", UID)
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "0%")
				.attr("y2", "100%")
				.attr("spreadMethod", "pad");

			const p = 100 / colors.length;

			colors.forEach((color: string, index: number)=>{
				const offset: string = (index === colors.length -1) ? '100%' : (index * p) + '%';
				gradient.append("svg:stop")
					.attr("offset", offset)
					.attr("stop-color", color)
					.attr("stop-opacity", 1);
			});
			res = 'url(#'+UID+')';
  		}else{
  			res = colors;
  		}
  		return res;
  	}

  	// create bar chart
  	private createBARchart(index: number) {
  		const axis = this.arr_data_forAxis[index];
  		const totalBarcharts = this.arr_data_chartTypes.filter(x=> x=== 'bar').length;
  		const color = this.getColor(index);
  		
  		this.svg.select('.chart').selectAll('.g')
  			.data(this.data[index]).enter()
  			.append('rect')
  			.attr('class', 'bar')
  			.style('opacity', totalBarcharts > 1 ? 0.7 : 1.0)
  			.style('fill', color)
  			.attr('x', d => this.x(d.date) - this.xBand.bandwidth() * 0.9 / 2 )
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
  		const color = this.getColor(index);

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
      		.attr('stroke', color)
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
  		const color = this.getColor(index);

  		this.svg.select('.chart')
  			.append('path')
  			.datum(this.data[index])
  			.attr('class', 'area')
			.attr('fill', color)
			.attr('fill-opacity', '0.7')
			.attr('stroke', color)
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

	ngOnDestroy(){
		this.fhem.removeDevice(this.ID);
		this.selectComponent.removeHandle(this.ID, 'whileResize');
	}

	constructor(
		private ref: ElementRef,
		private fhem: FhemService,
		private time: TimeService,
		public settings: SettingsService,
		private structure: StructureService,
		private undoManager: UndoRedoService,
		private selectComponent: SelectComponentService,
		private componentLoader: ComponentLoaderService){
	}

	static getSettings() {
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
	imports: [ComponentsModule, IonicModule, TranslateModule],
  	declarations: [FhemWeatherComponent]
})
class FhemWeatherComponentModule {}